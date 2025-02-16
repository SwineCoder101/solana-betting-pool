use anchor_lang::{prelude::*, solana_program::system_program};
use crate::{
    constants::POOL_VAULT_SEED, errors::BettingError, states::{Bet, BetStatus, Pool}, utils::*
};
use anchor_lang::solana_program::clock::Clock;
#[derive(Accounts)]
#[instruction(amount: u64, lower_bound_price: u64, upper_bound_price: u64, pool_key: Pubkey, competition: Pubkey)]
pub struct CreateBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: The pool_hash_acc is mutable because the pool_hash is stored in the pool account.
    #[account(mut)]
    pub bet_hash_acc: UncheckedAccount<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", user.key().as_ref(), pool_key.as_ref(), bet_hash_acc.key().as_ref()],
        bump,
    )]
    pub bet: Account<'info, Bet>,


    /// CHECK: The pool_vault is mutable because the pool_vault is stored in the pool account.
    #[account(
            init,
            payer = user,
            seeds = [
                POOL_VAULT_SEED,
                pool.key().as_ref(),
            ],
            bump,
            space = 0,
            owner = system_program::ID
        )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_create_bet(
    ctx: Context<CreateBet>,
    amount: u64,
    lower_bound_price: u64,
    upper_bound_price: u64,
    pool_key: Pubkey,
    competition: Pubkey,
    leverage_multiplier: u64,
) -> Result<()> {
    // Check eligibility
    if !is_eligible(&ctx.accounts.user) {
        return err!(BettingError::NotEligible);
    }

    if ctx.accounts.pool.end_time < Clock::get()?.unix_timestamp as u64 {
        return Err(BettingError::CompetitionEnded.into());
    };

    if ctx.accounts.pool.end_time < Clock::get()?.unix_timestamp as u64 {
        return Err(BettingError::PoolEnded.into());
    }

    // Transfer lamports from user to pool
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.pool.vault_key,
        amount,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.pool_vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
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
    bet_account.leverage_multiplier = leverage_multiplier;
    bet_account.created_at = Clock::get()?.unix_timestamp as u64;
    bet_account.updated_at = Clock::get()?.unix_timestamp as u64;
    bet_account.pool_vault_key = ctx.accounts.pool.vault_key;

    emit!(BetCreated {
        bet_key: bet_account.key(),
        user: ctx.accounts.user.key(),
        amount,
        lower_bound_price,
        upper_bound_price,
        pool_key,
        pool_vault_key: ctx.accounts.pool.vault_key,
        competition,
        leverage_multiplier,
        created_at: Clock::get()?.unix_timestamp as u64,
    });
    Ok(())
}

#[event]
pub struct BetCreated {
    pub bet_key: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub lower_bound_price: u64,
    pub upper_bound_price: u64,
    pub pool_vault_key: Pubkey,
    pub pool_key: Pubkey,
    pub competition: Pubkey,
    pub leverage_multiplier: u64,
    pub created_at: u64,
}