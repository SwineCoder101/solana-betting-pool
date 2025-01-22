use anchor_lang::prelude::*;

#[error_code]
pub enum BettingError {
    #[msg("User is not eligible to create a bet.")]
    NotEligible,
    #[msg("User does not own this bet.")]
    BetOwnershipMismatch,

    #[msg("Unauthorized: Not the competition owner.")]
    Unauthorized,
    #[msg("Pool not finished yet.")]
    PoolNotEnded,
    #[msg("Competition has ended")]
    CompetitionEnded,
    #[msg("Pool has ended")]
    PoolEnded,
}

#[error_code]
pub enum PoolError {
    #[msg("invalid pool id provided, please check the latest pool id")]
    InvalidPoolId,
    #[msg("Invalid time range.")]
    InvalidTimeRange,
}