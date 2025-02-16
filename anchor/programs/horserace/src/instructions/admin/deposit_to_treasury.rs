use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::states::Treasury;
use crate::constants::TREASURY_SEED;
use crate::utils;
#[derive(Accounts)]
pub struct DepositToTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = treasury.bump
    )]
    /// CHECK: This is the PDA that will receive the funds
    pub treasury_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn deposit_to_treasury(ctx: Context<DepositToTreasury>, amount: u64) -> Result<()> {
    
    // Transfer funds from depositor to treasury account
    utils::deposit_to_treasury(
        &mut ctx.accounts.treasury,
        &ctx.accounts.treasury_account.to_account_info(),
        &ctx.accounts.depositor.to_account_info(),
        &ctx.accounts.system_program,
        amount,
    )?;

    Ok(())
}
