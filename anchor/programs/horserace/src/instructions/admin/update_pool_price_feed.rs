use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::get_feed_id_from_hex;
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;
use crate::errors::OracleError;
use crate::{
    states::PoolOracleTransformer,
};

#[derive(Accounts)]
pub struct UpdatePoolPriceFeed<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"pool_oracle",
            pool_oracle.pool.as_ref(),
            pool_oracle.price_feed.as_bytes()
        ],
        bump = pool_oracle.bump
    )]
    pub pool_oracle: Account<'info, PoolOracleTransformer>,

    pub price_update: Account<'info, PriceUpdateV2>,
}

pub fn run_update_pool_price_feed(ctx: Context<UpdatePoolPriceFeed>) -> Result<()> {
    let pool_oracle = &mut ctx.accounts.pool_oracle;
    let price_update = &ctx.accounts.price_update;
    let clock = Clock::get()?;

    require!(pool_oracle.active, OracleError::OracleInactive);
    require!(
        clock.unix_timestamp as u64 >= pool_oracle.start_time 
        && clock.unix_timestamp as u64 <= pool_oracle.end_time,
        OracleError::OutsideOracleTimeRange
    );

    let feed_id = get_feed_id_from_hex(&pool_oracle.price_feed)?;
    
    let maximum_age: u64 = 30;
    let price = price_update.get_price_no_older_than(&clock, maximum_age, &feed_id)?;

    let current_price = (price.price as f64 * 10f64.powi(price.exponent)) as u64;

    if current_price < pool_oracle.min_price || pool_oracle.min_price == 0 {
        pool_oracle.min_price = current_price;
    }
    if current_price > pool_oracle.max_price {
        pool_oracle.max_price = current_price;
    }

    msg!(
        "Updated oracle prices for pool {}: min={}, max={}, current={}",
        pool_oracle.pool,
        pool_oracle.min_price,
        pool_oracle.max_price,
        current_price
    );

    Ok(())
} 