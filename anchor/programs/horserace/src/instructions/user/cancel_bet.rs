use anchor_lang::prelude::*;
use crate::{
    states::{Bet, BetStatus},
    errors::BettingError,
};

#[derive(Accounts)]
pub struct CancelBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        has_one = user @ BettingError::BetOwnershipMismatch,
        constraint = bet.status == BetStatus::Active @ BettingError::BetOwnershipMismatch
    )]
    pub bet: Account<'info, Bet>,

    /// The Pool account from which funds are returned
    #[account(mut)]
    pub pool: SystemAccount<'info>, // or Account<'info, Pool>

    pub system_program: Program<'info, System>,
}

pub fn run_cancel_bet(ctx: Context<CancelBet>) -> Result<()> {
    // Transfer lamports back to the user from the pool
    let amount = ctx.accounts.bet.amount;

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.pool.key(),
        &ctx.accounts.user.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.pool.to_account_info(),
            ctx.accounts.user.to_account_info(),
        ],
    )?;

    // Mark bet as Cancelled
    ctx.accounts.bet.status = BetStatus::Cancelled;

    Ok(())
}
