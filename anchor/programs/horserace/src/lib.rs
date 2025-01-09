use anchor_lang::prelude::*;

pub mod states;
pub mod instructions;
pub mod constants;

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
    ) -> Result<()> {
        instructions::admin::create_competition::run_create_competition(
            ctx,
            token_a,
            price_feed_id,
            admin,
            house_cut_factor,
            min_payout_ratio,
        )
    }

    pub fn run_update_competition(
        ctx: Context<UpdateCompetition>,
        token_a: Pubkey,
        price_feed_id: String,
        admin: Vec<Pubkey>,
        house_cut_factor: u8,
        min_payout_ratio: u8,
    ) -> Result<()> {
        instructions::admin::update_competition::run_update_competition(
            ctx,
            token_a,
            price_feed_id,
            admin,
            house_cut_factor,
            min_payout_ratio,
        )
    }
}