use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;

use crate::constants::POOL_VAULT_SEED;

/// Mocked function to determine if user is eligible
pub fn is_eligible(_user: &Signer) -> bool {
    // For now, always return true
    true
}

/// Mocked function to determine if user has won
pub fn has_won(_bet: &AccountInfo, _pool: &AccountInfo) -> bool {
    // For now, always true
    true
}

/// Mocked function to compute user winnings
pub fn get_winnings(_bet_amount: u64) -> u64 {
    // For now, let's return bet_amount * 1
    _bet_amount
}

/// Transfer lamports **FROM** a PDA vault **TO** a user.
/// 
/// - `pool` is the account storing the vault bump + the seeds (i.e. `vault_bump`).
/// - `pool_vault` is the zero-data system-owned account (the vault).
/// - `recipient` is the recipient from which the lamports will be transferred.
/// - `amount` is how many lamports to transfer.
pub fn transfer_from_vault_to_recipient<'info>(
    pool: &Account<'info, crate::states::Pool>,
    pool_vault: &AccountInfo<'info>,
    recipient: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {

    let pool_key = pool.key();
    
    let ix = transfer(
        &pool_vault.key(),
        &recipient.key(),
        amount,
    );

    let seeds = &[
        POOL_VAULT_SEED,
        pool_key.as_ref(),
        &[pool.vault_bump],
    ];

    anchor_lang::solana_program::program::invoke_signed(
        &ix,
        &[
            pool_vault.clone(),
            recipient.clone(),
        ],
        &[seeds],
    )?;

    Ok(())
}

/// Transfer lamports **FROM** a user **TO** the PDA vault.
/// 
/// - `user` is the sender (`Signer<'info>` typically).
/// - `pool_vault` is the vault (a zero-data system-owned account).
/// - `system_program` is the system program reference.
/// - `amount` is how many lamports to transfer.
pub fn transfer_from_user_to_vault<'info>(
    user: &AccountInfo<'info>,
    pool_vault: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    amount: u64,
) -> Result<()> {


    let ix = system_instruction::transfer(
        &user.key(),
        &pool_vault.key(),
        amount,
    );

    invoke(
        &ix,
        &[
            user.clone(),
            pool_vault.clone(),
            system_program.to_account_info(),
        ],
    )?;

    Ok(())
}
