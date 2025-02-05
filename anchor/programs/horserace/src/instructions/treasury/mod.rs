use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::states::Treasury;

#[derive(Accounts)]
pub struct DepositToTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [Treasury::SEED_PREFIX],
        bump = treasury.bump
    )]
    /// CHECK: This is the PDA that will receive the funds
    pub treasury_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFromTreasury<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [Treasury::SEED_PREFIX],
        bump = treasury.bump
    )]
    /// CHECK: This is the PDA that holds the funds
    pub treasury_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,
    
    /// Multiple admin signers required based on min_signatures
    #[account(
        constraint = treasury.is_admin(&authority.key())
    )]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<DepositToTreasury>, amount: u64) -> Result<()> {
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

    treasury.total_deposits = treasury.total_deposits.checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    Ok(())
}

pub fn withdraw(ctx: Context<WithdrawFromTreasury>, amount: u64) -> Result<()> {
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