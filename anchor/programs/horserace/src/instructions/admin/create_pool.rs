use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::POOL_SEED, errors::{BettingError, PoolError}, states::Pool
};


#[account]
pub struct PoolIdCounter {
    pub next_id: u8,
}

impl PoolIdCounter {
    pub const INIT_SPACE: usize = 8 + 1;
}

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"id_counter"],
        bump,
    )]
    pub pool_id_counter: Account<'info, PoolIdCounter>,


    #[account(
        init,
        seeds = [POOL_SEED.as_ref(), pool_id_counter.next_id.to_le_bytes().as_ref()],
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
    competition_key: Pubkey,
    start_time: u64,
    end_time: u64,
    treasury: Pubkey,
) -> Result<()> {
    // Basic checks
    if end_time <= start_time {
        return err!(BettingError::InvalidTimeRange);
    }

    let pool_account = &mut ctx.accounts.pool;
    let pool_id_counter = &mut ctx.accounts.pool_id_counter;
    // For example, increment an ID here or pass it in as well
    pool_account.id = 0; // placeholder, you might want to store next ID in another account
    pool_account.competition_key = competition_key;
    pool_account.competition_id = 0; // example placeholder
    pool_account.start_time = start_time;
    pool_account.end_time = end_time;
    pool_account.treasury = treasury;
    pool_id_counter.next_id = pool_id_counter.next_id.checked_add(1).ok_or(PoolError::InvalidPoolId)?;
    Ok(())
}
