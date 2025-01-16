use anchor_lang::prelude::*;

pub mod states;
pub mod instructions;
pub mod constants;
pub mod errors;
pub mod utils;

use instructions::*;

declare_id!("3U8ZsW8cd3GNcu69AhksaNEoeBCh8sHywvCHbm7mxaHz");

#[program]
pub mod horse_race {
    use super::*;

    pub fn run_create_competition(
        ctx: Context<CreateCompetition>,
        token_a: Pubkey,
        price_feed_id: String,
        admin: Vec<Pubkey>,
        house_cut_factor: u8,
        min_payout_ratio: u8,
        interval: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        instructions::admin::create_competition::run_create_competition(
            ctx,
            token_a,
            price_feed_id,
            admin,
            house_cut_factor,
            min_payout_ratio,
            interval,
            start_time,
            end_time,
        )
    }

    pub fn run_update_competition(
        ctx: Context<UpdateCompetition>,
        token_a: Pubkey,
        price_feed_id: String,
        admin: Vec<Pubkey>,
        house_cut_factor: u8,
        min_payout_ratio: u8,
        interval: u64,
        start_time: u64,
        end_time: u64,
        
    ) -> Result<()> {
        instructions::admin::update_competition::run_update_competition(
            ctx,
            token_a,
            price_feed_id,
            admin,
            house_cut_factor,
            min_payout_ratio,
            interval,
            start_time,
            end_time,
        )
    }

    /// Create a Bet
    pub fn run_create_bet(
        ctx: Context<CreateBet>,
        amount: u64,
        lower_bound_price: u64,
        upper_bound_price: u64,
        pool_key: Pubkey,
        competition: Pubkey,
    ) -> Result<()> {
        instructions::user::create_bet::run_create_bet(
            ctx,
            amount,
            lower_bound_price,
            upper_bound_price,
            pool_key,
            competition,
        )
    }

    /// Cancel a Bet
    pub fn run_cancel_bet(
        ctx: Context<CancelBet>,
    ) -> Result<()> {
        instructions::user::cancel_bet::run_cancel_bet(ctx)
    }

    /// Create a Pool
    pub fn run_create_pool(
        ctx: Context<CreatePool>,
        competition_key: Pubkey,
        start_time: u64,
        end_time: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        instructions::admin::create_pool::run_create_pool(
            ctx,
            competition_key,
            start_time,
            end_time,
            treasury,
        )
    }

    /// Settle a Pool
    pub fn run_settle_pool(
        ctx: Context<SettlePool>,
        competition_key: Pubkey,
    ) -> Result<()> {
        instructions::admin::settle_pool::run_settle_pool(ctx, competition_key)
    }

    pub fn run_init_pool_counter_id(ctx: Context<InitPoolIdCounter>) -> Result<()> {
        instructions::admin::init_pool_id_counter::run_init_pool_id_counter(ctx)
    }

}