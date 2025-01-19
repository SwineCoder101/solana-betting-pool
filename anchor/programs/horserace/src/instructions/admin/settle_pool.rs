use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use crate::{
    states::{Pool, Bet, BetStatus},
    utils::*,
    errors::BettingError,
};

#[derive(Accounts)]
pub struct SettlePool {
    // #[account(mut)]
    // pub authority: Signer<'info>, // The "admin" or competition owner

    // #[account(mut, has_one = authority @ BettingError::Unauthorized)]
    // pub pool: Account<'info, Pool>,

    // #[account(mut)]
    // pub bets: Vec<Account<'info, Bet>>,

    // pub system_program: Program<'info, System>,
}

pub fn run_settle_pool(
    ctx: Context<SettlePool>,
    competition_key: Pubkey,
) -> Result<()> {
    // let pool = &mut ctx.accounts.pool;

    // // Check if the signer's key matches the competition_key if needed
    // require_keys_eq!(ctx.accounts.authority.key(), competition_key, BettingError::Unauthorized);

    // Check if pool has ended
    // let clock = Clock::get()?;
    // if clock.unix_timestamp as u64 <= pool.end_time {
    //     return err!(BettingError::PoolNotEnded);
    // }

    // For each bet, we figure out if user won
    // for bet in &mut ctx.accounts.bets {
    //     if bet.status == BetStatus::Active {
    //         // Check if user has won
    //         if has_won(bet, pool) {
    //             let winnings = get_winnings(bet.amount);
    //             // Transfer from pool's treasury to user
    //             // Implement the transfer logic here
    //         } else {
    //             // Transfer bet.amount to treasury
    //             // Implement the transfer logic here
    //         }
    //         bet.status = BetStatus::Settled;
    //     }
    // }

    // Mark pool as effectively "settled" or do any final logic
    // For brevity, we skip details here.

    Ok(())
}

// Dummy implementations for has_won and get_winnings
// Replace these with your actual logic
fn has_won(bet: &Bet, pool: &Pool) -> bool {
    // Implement your winning logic here
    true
}

fn get_winnings(amount: u64) -> u64 {
    // Implement your winnings calculation here
    amount * 2
}