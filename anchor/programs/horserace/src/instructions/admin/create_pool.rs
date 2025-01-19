use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::POOL_SEED, errors::PoolError, states::Pool
};

#[derive(Accounts)]
pub struct CreatePool<'info> {

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: The pool_hash_acc is mutable because the pool_hash is stored in the pool account.
    #[account(mut)]
    pub pool_hash_acc: UncheckedAccount<'info>,

    /// CHECK: The competition_acc is mutable because the competition_key is stored in the pool account.
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
    pool_account.competition_key = ctx.accounts.competition_acc.key();
    pool_account.start_time = start_time;
    pool_account.end_time = end_time;
    pool_account.treasury = treasury;
    Ok(())
}
