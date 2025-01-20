use anchor_lang::prelude::*;
use crate::{
    states::{Bet, BetStatus},
    utils::*,
    errors::BettingError,
};

#[derive(Accounts)]
#[instruction(amount: u64, lower_bound_price: u64, upper_bound_price: u64, pool_key: Pubkey, competition: Pubkey)]
pub struct CreateBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// The Bet account (to be created).  
    /// If you want seeds, define them. We'll omit seeds for now.
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 32 + 8 + 8 + 32 + 1 // Adjust for Bet struct sizes
    )]
    pub bet: Account<'info, Bet>,

    /// The Pool account where funds are stored
    #[account(mut)]
    pub pool: SystemAccount<'info>, // or an Account<'info, Pool> if you want to store info

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn run_create_bet(
    ctx: Context<CreateBet>,
    amount: u64,
    lower_bound_price: u64,
    upper_bound_price: u64,
    pool_key: Pubkey,
    competition: Pubkey,
) -> Result<()> {
    // Check eligibility
    if !is_eligible(&ctx.accounts.user) {
        return err!(BettingError::NotEligible);
    }

    // Transfer lamports from user to pool
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.pool.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.pool.to_account_info(),
        ],
    )?;

    // Create the bet account data
    let bet_account = &mut ctx.accounts.bet;
    bet_account.user = ctx.accounts.user.key();
    bet_account.amount = amount;
    bet_account.competition = competition;
    bet_account.lower_bound_price = lower_bound_price;
    bet_account.upper_bound_price = upper_bound_price;
    bet_account.pool_key = pool_key;
    bet_account.status = BetStatus::Active;

    Ok(())
}
