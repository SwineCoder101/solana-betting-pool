#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod solanabettingapplication {
    use super::*;

  pub fn close(_ctx: Context<CloseSolanabettingapplication>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solanabettingapplication.count = ctx.accounts.solanabettingapplication.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solanabettingapplication.count = ctx.accounts.solanabettingapplication.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSolanabettingapplication>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.solanabettingapplication.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSolanabettingapplication<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Solanabettingapplication::INIT_SPACE,
  payer = payer
  )]
  pub solanabettingapplication: Account<'info, Solanabettingapplication>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSolanabettingapplication<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub solanabettingapplication: Account<'info, Solanabettingapplication>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub solanabettingapplication: Account<'info, Solanabettingapplication>,
}

#[account]
#[derive(InitSpace)]
pub struct Solanabettingapplication {
  count: u8,
}
