use anchor_lang::{prelude::*, solana_program::system_program};
use crate::constants::{POOL_VAULT_SEED, SCALE, TREASURY_VAULT_SEED};
use crate::errors::SettlementError;
use crate::states::{BetStatus, Treasury};
use crate::utils;
use crate::states::{Pool, Bet, Competition};

#[derive(Accounts)]
pub struct SettlePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // The Competition anchor account
    #[account(mut)]
    pub competition: Account<'info, Competition>,

    // Anchor metadata account
    #[account(
        mut,
        has_one = competition @ SettlementError::InvalidCompetitionAccount
    )]
    pub pool: Account<'info, Pool>,
    
    /// CHECK: The pool_vault is mutable because the pool_vault is stored in the pool account.
    #[account( mut,
        seeds = [
            POOL_VAULT_SEED,
            pool.key().as_ref()
        ],
        bump = pool.vault_bump,
        owner = system_program::ID
    )]
    pub pool_vault: AccountInfo<'info>,

    // The Treasury anchor account
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,

    /// CHECK: The treasury_vault is mutable because the treasury_vault is stored in the treasury account.
    #[account(
        mut,
        seeds = [TREASURY_VAULT_SEED],
        bump = treasury.vault_bump,
        owner = system_program::ID
    )]
    pub treasury_vault: AccountInfo<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}
pub fn run_settle_pool_by_price<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, SettlePool<'info>>,
    lower_bound_price: u64,
    upper_bound_price: u64,
) -> Result<()> where 'c: 'info {
    let pool = &ctx.accounts.pool;
    let pool_vault_info = ctx.accounts.pool_vault.to_account_info();
    let treasury_vault_info = ctx.accounts.treasury_vault.to_account_info();
    // Capture the vault’s starting balance for the event.
    let pool_balance_before = pool_vault_info.lamports();
    let mut remaining_iter: std::slice::Iter<'c, AccountInfo<'info>> = ctx.remaining_accounts.iter();

    // 1) Check authority is in competition admins
    if !ctx.accounts.competition.admin.contains(&ctx.accounts.authority.key()) {
        return err!(SettlementError::Unauthorized);
    }

    let mut has_any_bet_won = false;
    let mut total_winnings: u64 = 0;
    let mut total_losing_bets: u64 = 0;
    let mut number_of_winning_bets: u8 = 0;
    let mut number_of_losing_bets: u8 = 0;
    let mut pool_balance_before_settlement: u64 = 0;

    // 2) Process each Bet + associated user
    while let Some(bet_account_info) = remaining_iter.next() {

        let mut bet = Account::<Bet>::try_from(bet_account_info)?;
        if bet.status != BetStatus::Active {
            continue;
        }


        let user_account_info = remaining_iter.next()
        .ok_or(SettlementError::InvalidUserAccount)?;

        let user_balance_before = user_account_info.lamports();

        let won = has_won(&bet, lower_bound_price, upper_bound_price);
        pool_balance_before_settlement = pool_vault_info.lamports();
        
        if won {
            let winnings = get_winnings(bet.amount, bet.leverage_multiplier);
            total_winnings += winnings;
            number_of_winning_bets = number_of_winning_bets
                .checked_add(1)
                .ok_or(SettlementError::NotEnoughFundsInPoolOrTreasury)?; // Adjust error as needed

            if pool_balance_before_settlement < winnings {
                // Top up from treasury vault
                let shortfall = winnings - pool_balance_before_settlement;
                require!(
                    treasury_vault_info.lamports() >= shortfall,
                    SettlementError::NotEnoughFundsInPoolOrTreasury
                );
                utils::withdraw_lamports_from_treasury( 
                    &mut ctx.accounts.treasury,
                    &treasury_vault_info,
                    &pool_vault_info,
                    shortfall,
                )?;
            }
            
            // Now pay user from pool vault
            utils::transfer_from_vault_to_recipient(
                &ctx.accounts.pool, 
                &ctx.accounts.pool_vault,
     &user_account_info, 
            winnings)?;

        } else {
            total_losing_bets += bet.amount;
            number_of_losing_bets = number_of_losing_bets
                .checked_add(1)
                .ok_or(SettlementError::NotEnoughFundsInPoolOrTreasury)?;
            utils::transfer_from_vault_to_recipient(
                &ctx.accounts.pool,
                &ctx.accounts.pool_vault,
                &ctx.accounts.treasury_vault,
                bet.amount,
            )?;
        }

        // Mark bet as settled
        bet.status = BetStatus::Settled;
        bet.serialize(&mut *bet_account_info.try_borrow_mut_data()?)?;

        has_any_bet_won = has_any_bet_won || won;

        let user_balance_after = user_account_info.lamports();

        // Emit event for bet settlement
        emit!(BetSettled { 
            bet_key: bet.key(),
            user: bet.user,
            user_balance_before : user_balance_before,
            user_balance_after : user_balance_after,
            pool_balance_before: pool_balance_before_settlement,
            pool_balance_after: pool_vault_info.lamports(),
            amount: bet.amount,
            leverage_multiplier: bet.leverage_multiplier,
            lower_bound_price: bet.lower_bound_price,
            upper_bound_price: bet.upper_bound_price,
            has_winning_range: won,
            winning_lower_bound_price: lower_bound_price,
            winning_upper_bound_price: upper_bound_price,
        });
    }

    emit!(PoolSettled {
        pool_key: pool.key(),
        competition: ctx.accounts.competition.key(),
        lower_bound_price,
        upper_bound_price,
        has_winning_range: has_any_bet_won,
        pool_balance_before,
        pool_balance_after: pool_vault_info.lamports(),
        winning_bets_balance: total_winnings,
        losing_bets_balance: total_losing_bets,
        number_of_bets: number_of_winning_bets + number_of_losing_bets,
        number_of_winning_bets,
        number_of_losing_bets,
    });
    Ok(())
}

fn has_won(bet: &Bet, lower_bound_price: u64, upper_bound_price: u64) -> bool {
    bet.lower_bound_price >= lower_bound_price && bet.upper_bound_price <= upper_bound_price
}
fn get_winnings(amount: u64, leverage_multiplier: u64) -> u64 {
    let product = (amount as u128) * (leverage_multiplier as u128);
    (product / (SCALE as u128)) as u64
}

#[event]
pub struct BetSettled {
    pub bet_key: Pubkey,
    pub user: Pubkey,
    pub user_balance_before: u64,
    pub user_balance_after: u64,
    pub pool_balance_before: u64,
    pub pool_balance_after: u64,
    pub amount: u64,
    pub leverage_multiplier: u64,
    pub lower_bound_price: u64,
    pub upper_bound_price: u64,
    pub has_winning_range: bool,
    pub winning_lower_bound_price: u64,
    pub winning_upper_bound_price: u64,
}

#[event]
pub struct PoolSettled {
    pub pool_key: Pubkey,
    pub competition: Pubkey,
    pub lower_bound_price: u64,
    pub upper_bound_price: u64,
    pub has_winning_range: bool,
    pub pool_balance_before: u64,
    pub pool_balance_after: u64,
    pub winning_bets_balance: u64,
    pub losing_bets_balance: u64,
    pub number_of_bets: u8,
    pub number_of_winning_bets: u8,
    pub number_of_losing_bets: u8,
}
