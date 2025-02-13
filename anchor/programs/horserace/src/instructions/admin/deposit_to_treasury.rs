use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::states::Treasury;
use crate::errors::TreasuryError;
use crate::constants::TREASURY_SEED;
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
    pub system_program: Program<'info, System>,
}

pub fn deposit_to_treasury(ctx: Context<DepositToTreasury>, amount: u64) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    
    // Transfer funds from depositor to treasury account
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.depositor.to_account_info(),
                to: ctx.accounts.treasury_account.to_account_info(),
            }
        ),
        amount
    )?;

    treasury.total_deposits = treasury.total_deposits
        .checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    Ok(())
}
