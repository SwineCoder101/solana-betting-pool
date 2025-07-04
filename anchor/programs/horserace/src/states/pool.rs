use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Pool {
    pub pool_hash: Pubkey,
    pub competition: Pubkey,
    pub start_time: u64,
    pub end_time: u64,
    pub bump: u8,
    pub vault_key: Pubkey,
    pub vault_bump: u8,
}