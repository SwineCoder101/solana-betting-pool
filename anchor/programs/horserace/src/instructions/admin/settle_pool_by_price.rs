use anchor_lang::{prelude::*, solana_program::system_program};
use crate::states::BetStatus;
use crate::{states::{Pool, Bet}, errors::BettingError};

#[derive(Accounts)]
pub struct SettlePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut, address = pool.treasury)]
    pub treasury: SystemAccount<'info>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn run_settle_pool_by_price<'info>(
    ctx: Context<'_, '_, 'info, 'info, SettlePool<'info>>,
    competition_key: Pubkey,
    lower_bound_price: u64,
    upper_bound_price: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require_keys_eq!(
        ctx.accounts.authority.key(),
        competition_key,
        BettingError::Unauthorized
    );

    let clock = Clock::get()?;
    if clock.unix_timestamp as u64 <= pool.end_time {
        return err!(BettingError::PoolNotEnded);
    }

    let mut remaining_accounts_iter = ctx.remaining_accounts.iter();

    while let Some(bet_account_info) = remaining_accounts_iter.next() {
        let mut bet = Account::<Bet>::try_from(bet_account_info)?;

        if bet.status != BetStatus::Active {
            continue;
        }

        let user_account_info = remaining_accounts_iter.next()
            .ok_or(BettingError::InvalidUserAccount)?;

        let winnings = get_winnings(bet.amount);

        if has_won(&bet, lower_bound_price, upper_bound_price) {
            require_keys_eq!(
                *user_account_info.key,
                bet.user,
                BettingError::InvalidUserAccount
            );

            **ctx.accounts.pool.to_account_info().try_borrow_mut_lamports()? -= winnings;
            **user_account_info.try_borrow_mut_lamports()? += winnings;
        } else {
            **ctx.accounts.pool.to_account_info().try_borrow_mut_lamports()? -= winnings;
            **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += winnings;
        }

        bet.status = BetStatus::Settled;
        bet.serialize(&mut *bet_account_info.try_borrow_mut_data()?)?;
    }

    Ok(())
}

fn has_won(bet: &Bet, lower_bound_price: u64, upper_bound_price: u64) -> bool {
    bet.lower_bound_price >= lower_bound_price && bet.upper_bound_price <= upper_bound_price
}

fn get_winnings(amount: u64) -> u64 {
    amount
}
