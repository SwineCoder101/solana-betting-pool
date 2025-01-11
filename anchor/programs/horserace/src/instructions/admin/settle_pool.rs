use anchor_lang::prelude::*;
use crate::{
    states::{Pool, Bet, BetStatus},
    utils::*,
    errors::BettingError,
};

#[derive(Accounts)]
pub struct SettlePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, // The "admin" or competition owner

    #[account(
        mut,
        // If you want seeds, define them. 
        // We'll omit seeds for this example.
    )]
    pub pool: Account<'info, Pool>,

    // We only need system program for transfers, or additional accounts as needed
    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    /// All bet accounts referencing this pool would be fetched on client side
    /// or you can pass them in as remaining_accounts
}

pub fn run_settle_pool(
    ctx: Context<SettlePool>,
    competition_key: Pubkey,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Check if the signer's key matches the competition_key if needed
    require_keys_eq!(ctx.accounts.authority.key(), competition_key, BettingError::Unauthorized);

    // Check if pool has ended
    let clock = Clock::get()?;
    if clock.unix_timestamp as u64 <= pool.end_time {
        return err!(BettingError::PoolNotEnded);
    }

    // For each bet (passed in or found off-chain), we figure out if user won
    // In an actual flow, you'd read from remaining_accounts or from an off-chain loop
    // For demonstration, let's just pretend we have the bets
    // Or see the SDK approach below to handle this off-chain.

    // e.g.:
    // for bet_account_info in ctx.remaining_accounts {
    //   let mut bet_data: Account<Bet> = Account::try_from(bet_account_info)?;
    //   if bet_data.status == BetStatus::Active {
    //       // Check if user has won
    //       if has_won(&bet_account_info, &ctx.accounts.pool.to_account_info()) {
    //           let winnings = get_winnings(bet_data.amount);
    //           // Transfer from pool's treasury to user
    //       } else {
    //           // Transfer bet_data.amount to treasury
    //       }
    //       bet_data.status = BetStatus::Settled;
    //   }
    // }

    // Mark pool as effectively "settled" or do any final logic
    // For brevity, we skip details here.

    Ok(())
}
