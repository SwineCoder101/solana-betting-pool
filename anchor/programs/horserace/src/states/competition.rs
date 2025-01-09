use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Competition {
    pub token_a: Pubkey,         // The token used for bets
    #[max_len(64)]
    pub price_feed_id: String,   // The price feed identifier
    pub house_cut_factor: u8,    // e.g., how much the house takes in fees
    pub min_payout_ratio: u8,    // e.g., minimum ratio for payouts
    #[max_len(4)]
    pub admin: Vec<Pubkey>,      // Whitelisted admin array
}