use anchor_lang::prelude::*;
use crate::states::PoolOracleTransformer;

#[derive(Accounts)]
#[instruction(pool: Pubkey, price_feed: String, start_time: u64, end_time: u64)]
pub struct CreatePoolOracleTransformer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + PoolOracleTransformer::INIT_SPACE,
        seeds = [
            b"pool_oracle",
            pool.as_ref(),
            price_feed.as_bytes()
        ],
        bump
    )]
    pub pool_oracle: Account<'info, PoolOracleTransformer>,

    pub system_program: Program<'info, System>,
}

pub fn run_init_pool_oracle(
    ctx: Context<CreatePoolOracleTransformer>,
    pool: Pubkey,
    price_feed: String,
    start_time: u64,
    end_time: u64,
) -> Result<()> {
    let pool_oracle = &mut ctx.accounts.pool_oracle;
    let bump = ctx.bumps.pool_oracle;

    pool_oracle.pool = pool;
    pool_oracle.price_feed = price_feed;
    pool_oracle.active = true;
    pool_oracle.start_time = start_time;
    pool_oracle.end_time = end_time;
    pool_oracle.min_price = 0;
    pool_oracle.max_price = 0;
    pool_oracle.bump = bump;

    Ok(())
} 