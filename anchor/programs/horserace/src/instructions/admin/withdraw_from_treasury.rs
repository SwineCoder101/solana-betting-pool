use anchor_lang::prelude::*;
use crate::states::Treasury;
use crate::errors::TreasuryError;
use crate::constants::TREASURY_SEED;

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
    
    // Verify we have enough funds
    let treasury_balance = ctx.accounts.treasury_account.lamports();
    require!(treasury_balance >= amount, TreasuryError::InsufficientFunds);

    // Transfer funds from treasury to recipient
    **ctx.accounts.treasury_account.try_borrow_mut_lamports()? = treasury_balance
        .checked_sub(amount)
        .ok_or(TreasuryError::Overflow)?;
    
    **ctx.accounts.recipient.try_borrow_mut_lamports()? = ctx.accounts.recipient
        .lamports()
        .checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    treasury.total_withdrawals = treasury.total_withdrawals
        .checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    Ok(())
}
