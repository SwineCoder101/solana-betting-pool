use anchor_lang::prelude::*;

#[error_code]
pub enum BettingError {
    #[msg("User is not eligible to create a bet.")]
    NotEligible,
    #[msg("User does not own this bet.")]
    BetOwnershipMismatch,
    #[msg("Invalid time range.")]
    InvalidTimeRange,
    #[msg("Unauthorized: Not the competition owner.")]
    Unauthorized,
    #[msg("Pool not finished yet.")]
    PoolNotEnded,
}