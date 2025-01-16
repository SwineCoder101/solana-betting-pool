use anchor_lang::{prelude::*, solana_program::system_program};

#[derive(Accounts)]
pub struct InitPoolIdCounter<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [b"id_counter"],
        bump,
        payer = authority,
        space = 8 + PoolIdCounter::INIT_SPACE
    )]
    pub id_counter: Account<'info, IdCounter>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>, 
}

pub fn run_init_id_counter(ctx: Context<InitPoolIdCounter>) -> Result<()> {
    let pool_id_counter = &mut ctx.accounts.id_counter;
    pool_id_counter.next_id = 0;
    Ok(())
}