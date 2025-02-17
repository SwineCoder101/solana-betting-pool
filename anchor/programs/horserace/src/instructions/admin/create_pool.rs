use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::{POOL_SEED, POOL_VAULT_SEED}, errors::PoolError, states::Pool
};

#[derive(Accounts)]
pub struct CreatePool<'info> {

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: The pool_hash_acc is mutable because the pool_hash is stored in the pool account.
    #[account(mut)]
    pub pool_hash_acc: UncheckedAccount<'info>,

    /// CHECK: The competition_acc is mutable because the competition is stored in the pool account.
    #[account(mut)]
    pub competition_acc: UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [POOL_SEED.as_ref(), competition_acc.key().as_ref(), pool_hash_acc.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + Pool::INIT_SPACE
    )]
    pub pool: Account<'info, Pool>,

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

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_create_pool(
    ctx: Context<CreatePool>,
    start_time: u64,
    end_time: u64,
    treasury: Pubkey,
) -> Result<()> {

    if end_time <= start_time {
        return err!(PoolError::InvalidTimeRange);
    }

    let pool_account = &mut ctx.accounts.pool;
    pool_account.competition = ctx.accounts.competition_acc.key();
    pool_account.start_time = start_time;
    pool_account.end_time = end_time;
    pool_account.treasury = treasury;
    pool_account.pool_hash = ctx.accounts.pool_hash_acc.key();
    pool_account.bump = ctx.bumps.pool;
    pool_account.vault_key = ctx.accounts.pool_vault.key();
    pool_account.vault_bump = ctx.bumps.pool_vault;

    emit!(PoolCreated {
        pool_hash: ctx.accounts.pool_hash_acc.key(),
        competition: ctx.accounts.competition_acc.key(),
        start_time,
        end_time,
        vault_key: ctx.accounts.pool_vault.key(),
    });

    Ok(())
}

#[event]
pub struct PoolCreated {
    pub pool_hash: Pubkey,
    pub vault_key: Pubkey,
    pub competition: Pubkey,
    pub start_time: u64,
    pub end_time: u64,
}
