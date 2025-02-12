use anchor_lang::prelude::*;
use crate::states::Competition;
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateCompetition<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: The comp_hash_acc is mutable because the comp_hash is stored in the competition account.
    #[account(mut)]
    pub comp_hash_acc: UncheckedAccount<'info>,

    #[account(
        init, 
        seeds = [COMPETITION_SEED, comp_hash_acc.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + Competition::INIT_SPACE
    )]
    pub competition: Account<'info, Competition>,

    pub system_program: Program<'info, System>,
}

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
    
    let competition = &mut ctx.accounts.competition;

    competition.token_a = token_a;
    competition.price_feed_id = price_feed_id;
    competition.admin = admin;
    competition.house_cut_factor = house_cut_factor;
    competition.min_payout_ratio = min_payout_ratio;
    competition.interval = interval;
    competition.start_time = start_time;
    competition.end_time = end_time;

    let num_of_pools = ((end_time - start_time) / interval) as u8;

    emit!(CompetitionCreated {
        competition_key: competition.key(),
        token_a: competition.token_a,
        price_feed_id: competition.price_feed_id.clone(),
        admin: competition.admin.clone(),
        house_cut_factor,
        min_payout_ratio,
        num_of_pools,
        interval,
        start_time,
        end_time,
    });

    Ok(())
}

#[event]
pub struct CompetitionCreated {
    pub competition_key: Pubkey,
    pub token_a: Pubkey,
    pub price_feed_id: String,
    pub admin: Vec<Pubkey>,
    pub house_cut_factor: u8,
    pub min_payout_ratio: u8,
    pub num_of_pools: u8,
    pub interval: u64,
    pub start_time: u64,
    pub end_time: u64,
}