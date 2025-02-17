use anchor_lang::{prelude::*, solana_program::system_program};
use crate::constants::{POOL_VAULT_SEED, TREASURY_VAULT_SEED};
use crate::errors::SettlementError;
use crate::states::{BetStatus, Treasury};
use crate::utils;
use crate::{states::{Pool, Bet, Competition}, errors::BettingError};

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
    

    // The system account that physically holds the pool’s lamports
    #[account(
        seeds = [
            POOL_VAULT_SEED,
            pool.key().as_ref()
        ],
        bump = pool.vault_bump,
        owner = system_program::ID
    )]
    pub pool_vault: SystemAccount<'info>,

    // The Treasury anchor account
    #[account(mut)]
    pub pool_treasury: Account<'info, Treasury>,

    // The system account that physically holds the treasury’s lamports
    #[account(
        mut,
        seeds = [TREASURY_VAULT_SEED],
        bump = pool_treasury.vault_bump,
        owner = system_program::ID
    )]
    pub treasury_vault: SystemAccount<'info>,



    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}


pub fn run_settle_pool_by_price<'info>(
    ctx: Context<'_, '_, '_, 'info, SettlePool<'info>>,
    lower_bound_price: u64,
    upper_bound_price: u64,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let pool_vault_info = &ctx.accounts.pool_vault.to_account_info();
    let treasury_vault_info = &ctx.accounts.treasury_vault.to_account_info();
    let mut remaining_iter = ctx.remaining_accounts.iter();

    // 1) Check authority is in competition admins
    if !ctx.accounts.competition.admin.contains(&ctx.accounts.authority.key()) {
        return err!(SettlementError::Unauthorized);
    }

    let mut has_any_bet_won = false;
    let mut total_winnings = 0;
    let mut total_losing_bets = 0;
    let mut number_of_winning_bets = 0;
    let mut number_of_losing_bets = 0;

    // 2) Process each Bet + associated user
    while let Some(bet_account_info) = remaining_iter.next() {
        let user_account_info = remaining_iter
            .next()
            .ok_or(BettingError::InvalidUserAccount)?;

        let mut bet = Account::<Bet>::try_from(bet_account_info)?;
        if bet.status != BetStatus::Active {
            continue;
        }

        let won = has_won(&bet, lower_bound_price, upper_bound_price);
        let winnings = get_winnings(bet.amount, bet.leverage_multiplier);

        if won {
            total_winnings += winnings;
            number_of_winning_bets += 1;
            // If pool vault can’t cover it, pull from treasury
            let pool_vault_balance = pool_vault_info.lamports();
            if pool_vault_balance < winnings {
                // top up from treasury vault
                let shortfall = winnings - pool_vault_balance;
                require!(
                    treasury_vault_info.lamports() >= shortfall,
                    SettlementError::NotEnoughFundsInPoolOrTreasury
                );
                utils::direct_transfer(
                    treasury_vault_info,
                    pool_vault_info,
                    shortfall
                )?;
            }

            // now pay user from pool vault
            utils::direct_transfer(pool_vault_info, user_account_info, winnings)?;
        } else {
            total_losing_bets += bet.amount;
            number_of_losing_bets += 1;
            // user lost → add their "amount * multiplier" to treasury 
            utils::direct_transfer(pool_vault_info, treasury_vault_info, winnings)?;
        }

        // Mark bet as settled
        bet.status = BetStatus::Settled;
        bet.serialize(&mut &mut bet_account_info.try_borrow_mut_data()?[..])?;

        has_any_bet_won = has_any_bet_won || won;

        // Emit
        emit!(BetSettled { 
            bet_key: bet.key(),
            user: bet.user,
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
        lower_bound_price: lower_bound_price,
        upper_bound_price: upper_bound_price,
        has_winning_range: has_any_bet_won,
        pool_balance_before: pool_vault_info.lamports(),
        winning_bets_balance: total_winnings,
        losing_bets_balance: total_losing_bets,
        number_of_bets: number_of_losing_bets + number_of_winning_bets,
        number_of_winning_bets: number_of_winning_bets,
        number_of_losing_bets: number_of_losing_bets,
    });
    Ok(())
}


fn has_won(bet: &Bet, lower_bound_price: u64, upper_bound_price: u64) -> bool {
    bet.lower_bound_price >= lower_bound_price && bet.upper_bound_price <= upper_bound_price
}

fn get_winnings(amount: u64, leverage_multiplier: u64) -> u64 {
    amount * leverage_multiplier
}

#[event]
pub struct BetSettled {
    pub bet_key: Pubkey,
    pub user: Pubkey,
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
    pub winning_bets_balance: u64,
    pub losing_bets_balance: u64,
    pub number_of_bets: u8,
    pub number_of_winning_bets: u8,
    pub number_of_losing_bets: u8,
}
