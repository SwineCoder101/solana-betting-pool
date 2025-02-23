use anchor_lang::{prelude::*, system_program};
use crate::errors::TreasuryError;
use crate::states::Treasury;
use crate::constants::{TREASURY_SEED, TREASURY_VAULT_SEED};
#[derive(Accounts)]
#[instruction(max_admins: u8, min_signatures: u8)]
pub struct CreateTreasury<'info> {
    
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: The treasury_account is mutable because the treasury_account is stored in the treasury account.
    #[account(
        init,
        payer = payer,
        seeds = [TREASURY_VAULT_SEED],
        bump,
        space = 0,
        owner = system_program::ID
      )]
      pub treasury_vault: AccountInfo<'info>,

      /// CHECK: The treasury is mutable because the treasury is stored in the treasury account.
      #[account(
        init,
        payer = payer,
        space = Treasury::space(max_admins as usize),
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
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
    treasury.vault_key = ctx.accounts.treasury_vault.key();
    treasury.vault_bump = ctx.bumps.treasury_vault;

    Ok(())
} 