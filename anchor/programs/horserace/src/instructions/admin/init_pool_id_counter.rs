use anchor_lang::{prelude::*, solana_program::system_program};

use super::PoolIdCounter;

#[derive(Accounts)]
    pub struct InitPoolIdCounter<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [b"pool_id_counter"],
        bump,
        payer = authority,
        space = 8 + PoolIdCounter::INIT_SPACE
    )]
    pub pool_id_counter: Account<'info, PoolIdCounter>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>, 
}

pub fn run_init_pool_id_counter(ctx: Context<InitPoolIdCounter>) -> Result<()> {
    let pool_id_counter = &mut ctx.accounts.pool_id_counter;
    pool_id_counter.next_id = 0;
    Ok(())
}