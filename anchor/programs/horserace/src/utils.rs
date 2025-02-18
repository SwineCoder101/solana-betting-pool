use anchor_lang::{prelude::*, system_program};
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::{invoke, invoke_signed};

use crate::constants::{POOL_VAULT_SEED, TREASURY_VAULT_SEED};
use crate::errors::{SettlementError, TreasuryError};
use crate::states::Treasury;

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

pub fn deposit_to_treasury<'info>(
    treasury: &mut Account<'info, Treasury>,
    treasury_account: &AccountInfo<'info>,
    depositor: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    amount: u64
) -> Result<()> {
    // Do a system transfer from `depositor` to `treasury_account`.
    system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            system_program::Transfer {
                from: depositor.clone(),
                to: treasury_account.clone(),
            },
        ),
        amount,
    )?;

    // Update the treasury account data
    treasury.total_deposits = treasury
        .total_deposits
        .checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    Ok(())
}


// withdrawal utilities

/// Emitted when there aren’t enough funds in the treasury to withdraw.
#[event]
pub struct InsufficientFunds {
    pub treasury_balance: u64,
    pub amount_requested: u64,
    pub recipient: Pubkey,
    pub treasury: Pubkey,
}

/// Emitted after a successful withdrawal.
#[event]
pub struct Withdrawal {
    pub amount: u64,
    pub recipient: Pubkey,
    pub treasury: Pubkey,
}

/// Withdraw lamports directly from the treasury PDA to a recipient.
/// 
/// - `treasury` is the Anchor account that tracks totals (and the bump).
/// - `treasury_account` is the PDA that physically holds the lamports.
/// - `recipient` is an UncheckedAccount to receive lamports.
/// - `amount` is how many lamports to withdraw.
/// 
/// This does a direct lamport reassign rather than a SystemProgram transfer.
pub fn withdraw_lamports_from_treasury<'info>(
    treasury: &mut Account<'info, Treasury>,
    treasury_account: &AccountInfo<'info>,
    recipient: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    // Ensure there are enough lamports in the treasury vault.
    let vault_balance = treasury_account.lamports();
    require!(vault_balance >= amount, TreasuryError::InsufficientFunds);

    // Build a system transfer instruction.
    let ix = system_instruction::transfer(
        &treasury_account.key(),
        &recipient.key(),
        amount,
    );

    // The treasury vault PDA was derived using [TREASURY_VAULT_SEED] and the bump stored in treasury.vault_bump.
    let seeds: &[&[u8]] = &[TREASURY_VAULT_SEED, &[treasury.vault_bump]];

    invoke_signed(
        &ix,
        &[treasury_account.clone(), recipient.clone()],
        &[seeds],
    )?;

    treasury.total_withdrawals = treasury.total_withdrawals
        .checked_add(amount)
        .ok_or(TreasuryError::Overflow)?;

    emit!(Withdrawal {
        amount,
        recipient: recipient.key(),
        treasury: treasury.key(),
    });

    Ok(())
}

pub fn direct_transfer_ref(
    from_info: &AccountInfo,
    to_info: &AccountInfo,
    amount: u64,
) -> Result<()> {
    let from_balance = from_info.lamports();
    require!(from_balance >= amount, SettlementError::NotEnoughFunds);

    **from_info.try_borrow_mut_lamports()? = from_balance
        .checked_sub(amount)
        .ok_or(SettlementError::Overflow)?;

    **to_info.try_borrow_mut_lamports()? = to_info
        .lamports()
        .checked_add(amount)
        .ok_or(SettlementError::Overflow)?;

    Ok(())
}