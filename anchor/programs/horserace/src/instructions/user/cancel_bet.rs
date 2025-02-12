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

    #[account(mut)]
    pub pool: SystemAccount<'info>, // or Account<'info, Pool>

    pub system_program: Program<'info, System>,
}

pub fn run_cancel_bet(ctx: Context<CancelBet>) -> Result<()> {
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

    ctx.accounts.bet.status = BetStatus::Cancelled;

    emit!(BetCancelled {
        bet_key: ctx.accounts.bet.key(),
        user: ctx.accounts.user.key(),
        amount,
        lower_bound_price: ctx.accounts.bet.lower_bound_price,
        upper_bound_price: ctx.accounts.bet.upper_bound_price,
        pool_key: ctx.accounts.pool.key(),
        competition: ctx.accounts.bet.competition,
        cancelled_at: Clock::get()?.unix_timestamp as u64,
    });

    Ok(())
}


#[event]
pub struct BetCancelled {
    pub bet_key: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub lower_bound_price: u64,
    pub upper_bound_price: u64,
    pub pool_key: Pubkey,
    pub competition: Pubkey,
    pub cancelled_at: u64,
}

