use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct PoolOracleTransformer {
    pub pool: Pubkey,
    pub max_price: u64,
    pub min_price: u64,
    #[max_len(64)]
    pub price_feed: String,
    pub active: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub bump: u8,
}