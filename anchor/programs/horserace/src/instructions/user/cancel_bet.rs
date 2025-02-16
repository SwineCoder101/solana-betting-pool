use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::{POOL_SEED, POOL_VAULT_SEED}, errors::BettingError, states::{Bet, BetStatus, Pool}, utils::*
};

#[derive(Accounts)]
pub struct CancelBet<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: The bet_hash_acc is mutable because the bet_hash is stored in the bet account.
    #[account(
        mut,
        has_one = user @ BettingError::BetOwnershipMismatch,
        constraint = bet.status == BetStatus::Active @ BettingError::BetOwnershipMismatch
    )]
    pub bet: Account<'info, Bet>,

    /// CHECK: The pool_vault is mutable because the pool_vault is stored in the pool account.
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED,
            pool.key().as_ref(),
        ],
        bump = pool.vault_bump,
        owner = system_program::ID
    )]
    pub pool_vault: AccountInfo<'info>,

    /// CHECK: The pool is mutable because the pool is stored in the pool account.
    #[account(
        mut,
        seeds = [
            POOL_SEED,
            pool.competition_key.as_ref(),
            pool.pool_hash.as_ref()
        ],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_cancel_bet(ctx: Context<CancelBet>) -> Result<()> {
    let amount = ctx.accounts.bet.amount;

    require_keys_eq!(
        ctx.accounts.pool_vault.key(),
        ctx.accounts.pool.vault_key,
        BettingError::PoolVaultMismatch
    );

    transfer_from_vault_to_recipient(
        &ctx.accounts.pool,
        &ctx.accounts.pool_vault,
        &ctx.accounts.user.to_account_info(),
        amount,
    )?;

    // Mark bet as cancelled
    ctx.accounts.bet.status = BetStatus::Cancelled;
    ctx.accounts.bet.updated_at = Clock::get()?.unix_timestamp as u64;

    emit!(BetCancelled {
        bet_key: ctx.accounts.bet.key(),
        user: ctx.accounts.user.key(),
        amount: ctx.accounts.bet.amount,
        lower_bound_price: ctx.accounts.bet.lower_bound_price,
        upper_bound_price: ctx.accounts.bet.upper_bound_price,
        pool_key: ctx.accounts.pool.key(),
        competition: ctx.accounts.pool.competition_key,
        cancelled_at: Clock::get()?.unix_timestamp,
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
    pub cancelled_at: i64,
}

