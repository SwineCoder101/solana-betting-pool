use anchor_lang::prelude::*;

pub mod states;
pub mod instructions;
pub mod constants;
pub mod errors;
pub mod utils;

use instructions::*;

declare_id!("99ieFmE1u6Pws1Nneo2ksKvZjNsbDtiEbhGSfGUth3BN");

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
        leverage_multiplier: u64,
    ) -> Result<()> {
        instructions::user::create_bet::run_create_bet(
            ctx,
            amount,
            lower_bound_price,
            upper_bound_price,
            pool_key,
            competition,
            leverage_multiplier,
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
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        instructions::admin::create_pool::run_create_pool(
            ctx,
            start_time,
            end_time,
        )
    }

    /// Settle a Pool
    pub fn run_settle_pool_by_price<'info>(
        ctx: Context<'_, '_, 'info, 'info, SettlePool<'info>>,
        lower_bound_price: u64,
        upper_bound_price: u64,
    ) -> Result<()> {
        instructions::admin::settle_pool_by_price::run_settle_pool_by_price(ctx, lower_bound_price, upper_bound_price)
    }

    /// Update a Pool Price Feed
    pub fn run_update_pool_price_feed(
        ctx: Context<UpdatePoolPriceFeed>,
    ) -> Result<()> {
        instructions::admin::update_pool_price_feed::run_update_pool_price_feed(ctx)
    }

    pub fn run_create_pool_oracle_transformer(
        ctx: Context<CreatePoolOracleTransformer>,
        pool: Pubkey,
        price_feed: String,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        instructions::admin::create_pool_oracle_transformer::run_init_pool_oracle(ctx, pool, price_feed, start_time, end_time)
    }

    pub fn run_create_treasury(
        ctx: Context<CreateTreasury>,
        max_admins: u8,
        min_signatures: u8,
        initial_admins: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::admin::create_treasury(ctx, max_admins, min_signatures, initial_admins)
    }

    pub fn run_deposit_to_treasury(
        ctx: Context<DepositToTreasury>,
        amount: u64,
    ) -> Result<()> {
        instructions::admin::deposit_to_treasury(ctx, amount)
    }

    pub fn run_withdraw_from_treasury(
        ctx: Context<WithdrawFromTreasury>,
        amount: u64,
    ) -> Result<()> {
        instructions::admin::withdraw_from_treasury(ctx, amount)
    }
}
