use anchor_lang::prelude::*;
use crate::state::Competition;

#[derive(Accounts)]
pub struct UpdateCompetition<'info> {
    #[account(
        mut,
        // If using a PDA: seeds = [b"competition"], bump = competition_bump
        // has_one = authority (if needed)
    )]
    pub competition: Account<'info, Competition>,

    pub authority: Signer<'info>, // The account that initiates the update
}

pub fn run_update_competition(
    ctx: Context<UpdateCompetition>,
    token_a: Pubkey,
    price_feed_id: String,
    admin: Vec<Pubkey>,
    house_cut_factor: u8,
    min_payout_ratio: u8,
) -> Result<()> {
    // Logic:
    // 1. Check if the authority is the same as the "deployer" or if it is in the `admin` array
    // 2. Then update the competition config

    let competition = &mut ctx.accounts.competition;

    // Example check:
    require!(
        competition.admin.contains(&ctx.accounts.authority.key()),
        CustomError::Unauthorized
    );

    competition.token_a = token_a;
    competition.price_feed_id = price_feed_id;
    competition.admin = admin;
    competition.house_cut_factor = house_cut_factor;
    competition.min_payout_ratio = min_payout_ratio;

    Ok(())
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized: Not a whitelisted admin or deployer.")]
    Unauthorized,
}
