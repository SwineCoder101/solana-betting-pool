use anchor_lang::prelude::*;
use crate::states::Competition;

#[derive(Accounts)]
pub struct CreateCompetition<'info> {
    #[account(
        init, 
        payer = authority,
        space = 8 + 32 + (4 + 200) + (4 + 32*5) + 1 + 1, // Adjust space as needed
        // If you want a PDA with a known seed, you can do seeds = [b"competition"], bump
    )]
    pub competition: Account<'info, Competition>,

    #[account(mut)]
    pub authority: Signer<'info>, // The account that pays for the creation

    pub system_program: Program<'info, System>,
}

pub fn run_create_competition(
    ctx: Context<CreateCompetition>,
    token_a: Pubkey,
    price_feed_id: String,
    admin: Vec<Pubkey>,
    house_cut_factor: u8,
    min_payout_ratio: u8,
) -> Result<()> {
    // Business logic:
    // 1. Only the signer (authority) can create the competition
    // 2. Possibly check if `admin` contains the same authority, or check the "deployer" logic

    let competition = &mut ctx.accounts.competition;

    competition.token_a = token_a;
    competition.price_feed_id = price_feed_id;
    competition.admin = admin;
    competition.house_cut_factor = house_cut_factor;
    competition.min_payout_ratio = min_payout_ratio;

    Ok(())
}
