use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::{POOL_SEED, POOL_VAULT_SEED}, errors::BettingError, states::{Bet, BetStatus, Pool}
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
        init,
        payer = authority,
        seeds = [
            POOL_VAULT_SEED,
            pool.key().as_ref(),
        ],
        bump,
        space = 0,
        owner = system_program::ID
    )]
    pub pool_vault: AccountInfo<'info>,

    /// CHECK: The pool_hash_acc is mutable because the pool_hash is stored in the pool account.
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
    let pool_key = ctx.accounts.pool.key();

    require_keys_eq!(
        pool_key,
        ctx.accounts.pool.vault_key,
        BettingError::PoolVaultMismatch
    );

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.pool_vault.key(),
        &ctx.accounts.user.key(),
        amount,
    );

    let seeds = [
            POOL_VAULT_SEED,
            pool_key.as_ref(),
    ];

    anchor_lang::solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.pool_vault.to_account_info(),
            ctx.accounts.user.to_account_info(),
        ],
        &[&seeds],
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

