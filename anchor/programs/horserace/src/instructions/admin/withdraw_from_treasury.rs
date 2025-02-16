use anchor_lang::prelude::*;
use crate::states::Treasury;
use crate::errors::TreasuryError;
use crate::constants::TREASURY_SEED;
use crate::utils;

#[derive(Accounts)]
pub struct WithdrawFromTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = treasury.bump
    )]
    /// CHECK: This is the PDA that holds the funds
    pub treasury_account: UncheckedAccount<'info>,
    
    /// CHECK: This is safe because we only use it to transfer funds to
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,
    
    /// CHECK: This is safe because we only use it to transfer funds to
    #[account(mut)]
    pub pool: UncheckedAccount<'info>,
    
    /// CHECK: This is verified in the constraint
    #[account(
        constraint = treasury.is_admin(&authority.key()) @ TreasuryError::Unauthorized
    )]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn withdraw_from_treasury(ctx: Context<WithdrawFromTreasury>, amount: u64) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;

    utils::withdraw_lamports_from_treasury(
        treasury,
        &ctx.accounts.treasury_account.to_account_info(),
        &ctx.accounts.recipient.to_account_info(),
        amount,
    )?;

    Ok(())
}


