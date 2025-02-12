use anchor_lang::{prelude::*, solana_program::system_program};
use crate::errors::SettlementError;
use crate::states::{BetStatus};
use crate::{states::{Pool, Bet, Competition}, errors::BettingError};

#[derive(Accounts)]
pub struct SettlePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub competition: Account<'info, Competition>,

    #[account(mut, address = pool.treasury)]
    pub treasury: SystemAccount<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_settle_pool_by_price<'info>(
    ctx: Context<'_, '_, 'info, 'info, SettlePool<'info>>,
    lower_bound_price: u64,
    upper_bound_price: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let competition_admins = &ctx.accounts.competition.admin;
    let competition_key = ctx.accounts.competition.key();

    // Store the pool balance before any modifications
    let pool_info = pool.to_account_info();
    let pool_balance = pool_info.to_account_info().lamports();

    let mut number_of_winning_bets = 0;
    let mut number_of_losing_bets = 0;

    let mut winning_bets_balance = 0;
    let mut losing_bets_balance = 0;

    #[allow(unused_mut)]
    let mut has_winning_range = false;

    require_keys_eq!(
        competition_key,
        pool.competition_key,
        SettlementError::InvalidCompetitionAccount
    );

    if !competition_admins.contains(&ctx.accounts.authority.key()) {
        return err!(SettlementError::Unauthorized);
    }

    let mut remaining_accounts_iter = ctx.remaining_accounts.iter();
    let number_of_bets = (ctx.remaining_accounts.len() / 2) as u8;
    
    while let Some(bet_account_info) = remaining_accounts_iter.next() {
        let mut bet = Account::<Bet>::try_from(bet_account_info)?;
        if bet.status != BetStatus::Active {
            continue;
        }

        let user_account_info = remaining_accounts_iter.next()
            .ok_or(BettingError::InvalidUserAccount)?;

        let winnings = get_winnings(bet.amount);
        let won = has_won(&bet, lower_bound_price, upper_bound_price);

        if won {
            require_keys_eq!(
                *user_account_info.key,
                bet.user,
                BettingError::InvalidUserAccount
            );

            number_of_winning_bets += 1;
            winning_bets_balance += winnings;

            // Deduct winnings from the pool and add them to the user account
            **pool.to_account_info().try_borrow_mut_lamports()? -= winnings as u64;
            **user_account_info.try_borrow_mut_lamports()? += winnings;
        } else {
            number_of_losing_bets += 1;
            losing_bets_balance += bet.amount;

            // Deduct winnings from the pool and send them to the treasury
            **pool.to_account_info().try_borrow_mut_lamports()? -= winnings;
            **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += winnings;
        }

        bet.status = BetStatus::Settled;
        bet.serialize(&mut *bet_account_info.try_borrow_mut_data()?)?;

        emit!(BetSettled {
            bet_key: bet_account_info.key(),
            user: bet.user,
            amount: if won { winnings as i64 } else { -(bet.amount as i64) },
            lower_bound_price: bet.lower_bound_price,
            upper_bound_price: bet.upper_bound_price,
            has_winning_range: won,
            winning_lower_bound_price: lower_bound_price,
            winning_upper_bound_price: upper_bound_price,
        });
    }

    has_winning_range = number_of_winning_bets > 0;

    emit!(PoolSettled {
        pool_key: pool.key(),
        competition: competition_key,
        lower_bound_price,
        upper_bound_price,
        has_winning_range,
        pool_balance_before: pool_balance,
        winning_bets_balance,
        losing_bets_balance,
        number_of_bets,
        number_of_winning_bets,
        number_of_losing_bets,
    });

    Ok(())
}

fn has_won(bet: &Bet, lower_bound_price: u64, upper_bound_price: u64) -> bool {
    bet.lower_bound_price >= lower_bound_price && bet.upper_bound_price <= upper_bound_price
}

fn get_winnings(amount: u64) -> u64 {
    amount
}

#[event]
pub struct BetSettled {
    pub bet_key: Pubkey,
    pub user: Pubkey,
    pub amount: i64,
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
