use anchor_lang::{prelude::*};
use anchor_lang::solana_program::system_program;
use crate::states::BetStatus;
use crate::{
    states::{Pool, Bet},
    errors::BettingError,
};

#[derive(Accounts)]
pub struct SettlePool<'info>  {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_settle_pool(
    ctx: Context<SettlePool>,
    competition_key: Pubkey,
    lower_bound_price: u64,
    upper_bound_price: u64,
    treasury: Pubkey,
    bets: Vec<Account<Bet>>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let poolKey = pool.key();
    let treasuryInfo = AccountInfo::new(treasury, false, false, &mut 0, &mut [], &treasury, false, 0);

    // //fetch competition account struct from key
    // let competition = &mut ctx.accounts.competition;

    require_keys_eq!(ctx.accounts.authority.key(), competition_key, BettingError::Unauthorized);

    let clock = Clock::get()?;
    if clock.unix_timestamp as u64 <= pool.end_time {
        return err!(BettingError::PoolNotEnded);
    }

    for bet in &bets {
        if bet.status == BetStatus::Active {
            let winnings = get_winnings(bet.amount);
            if has_won(&bet,lower_bound_price, upper_bound_price) {
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &poolKey,
                    &bet.user,
                    winnings,
                );
            
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        ctx.accounts.user.to_account_info(),
                        ctx.accounts.pool.to_account_info(),
                    ],
                )?;
            } else {
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &poolKey,
                    &treasury,
                    winnings,
                );
            
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        ctx.accounts.user.to_account_info(),
                        ctx.accounts.pool.to_account_info(),
                    ],
                )?;
            }
            // &bet.status = BetStatus::Settled;
        }
    }

    // Mark pool as effectively "settled" or do any final logic
    // For brevity, we skip details here.

    Ok(())
}

fn has_won(bet: &Bet, lower_bound_price: u64, upper_bound_price: u64) -> bool {
    if bet.lower_bound_price >= lower_bound_price && bet.upper_bound_price <= upper_bound_price {
        true
    } else {
        false
    }
}

fn transfer_winnings(winnings: u64, from: Pubkey, to: Pubkey, from_info: AccountInfo, to_info: AccountInfo) -> Result<()> {
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &from,
        &to,
        winnings,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[from_info.clone(), to_info.clone()],
    )?;

    Ok(())
}

fn get_winnings(amount: u64) -> u64 {
    // Implement your winnings calculation here
    amount * 2
}