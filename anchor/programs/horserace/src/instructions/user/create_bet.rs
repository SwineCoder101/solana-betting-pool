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

    #[account(
        init,
        payer = user,
        space = 8 + 
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub pool: SystemAccount<'info>,

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
