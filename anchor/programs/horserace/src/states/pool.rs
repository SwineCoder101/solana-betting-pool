use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Pool {
    pub id: u8,
    pub competition_key: Pubkey,
    pub competition_id: u8,
    pub start_time: u64,
    pub end_time: u64,
    pub treasury: Pubkey,
}