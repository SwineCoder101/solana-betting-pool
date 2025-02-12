use anchor_lang::prelude::*;
use crate::errors::TreasuryError;
use crate::states::Treasury;
use crate::constants::TREASURY_SEED;

#[derive(Accounts)]
#[instruction(max_admins: u8, min_signatures: u8)]
pub struct CreateTreasury<'info> {
    #[account(
        init,
        payer = payer,
        space = Treasury::space(max_admins as usize),
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_treasury(
    ctx: Context<CreateTreasury>,
    max_admins: u8,
    min_signatures: u8,
    initial_admins: Vec<Pubkey>,
) -> Result<()> {
    require!(
        initial_admins.len() <= max_admins as usize,
        TreasuryError::TooManyAdmins
    );
    require!(
        min_signatures <= initial_admins.len() as u8,
        TreasuryError::InvalidSignatureThreshold
    );

    let treasury = &mut ctx.accounts.treasury;
    treasury.admin_authorities = initial_admins;
    treasury.min_signatures = min_signatures;
    treasury.total_deposits = 0;
    treasury.total_withdrawals = 0;
    treasury.bump = ctx.bumps.treasury;

    Ok(())
} 