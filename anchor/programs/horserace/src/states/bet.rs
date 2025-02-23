use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
#[derive(InitSpace, Debug)]
pub enum BetStatus {
    Active,
    Cancelled,
    Settled,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Bet {
    pub user: Pubkey,
    pub amount: u64,
    pub competition: Pubkey,
    pub lower_bound_price: u64,
    pub upper_bound_price: u64,
    pub pool_key: Pubkey,
    pub pool_vault_key: Pubkey,
    pub status: BetStatus,
    pub leverage_multiplier: u64,
    pub created_at: u64,
    pub updated_at: u64,
}