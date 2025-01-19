use anchor_lang::prelude::*;

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
