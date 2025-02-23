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
    #[msg("Invalid user account")]
    InvalidUserAccount,
    #[msg("Pool vault key mismatch with pool account")]
    PoolVaultMismatch,
}

#[error_code]
pub enum SettlementError {
    #[msg("Unauthorized: Not a competition admin.")]
    Unauthorized,
    #[msg("Pool has ended")]
    PoolEnded,
    #[msg("Pool has not ended yet")]
    PoolNotEnded,
    #[msg("Invalid competition account, cannot settle pool")]
    InvalidCompetitionAccount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Not enough funds in pool or treasury")]
    NotEnoughFundsInPoolOrTreasury,
    #[msg("Not enough funds")]
    NotEnoughFunds,
    #[msg("Invalid from account")]
    InvalidFromAccount,
    #[msg("Invalid to account")]
    InvalidToAccount,
    #[msg("Invalid user account")]
    InvalidUserAccount,
}

#[error_code]
pub enum PoolError {
    #[msg("invalid pool id provided, please check the latest pool id")]
    InvalidPoolId,
    #[msg("Invalid time range.")]
    InvalidTimeRange,
}

#[error_code]
pub enum CompetitionError {
    #[msg("Invalid time range.")]
    InvalidTimeRange,
    #[msg("Invalid competition id provided, please check the latest competition id")]
    InvalidCompetitionId,
}

#[error_code]
pub enum OracleError {
    #[msg("Invalid time range.")]
    InvalidTimeRange,
    #[msg("Invalid oracle id provided, please check the latest oracle id")]
    InvalidOracleId,
    #[msg("Oracle is inactive.")]
    OracleInactive,
    #[msg("Oracle is outside the time range.")]
    OutsideOracleTimeRange,
}

#[error_code]
pub enum TreasuryError {
    #[msg("Too many admins provided")]
    TooManyAdmins,
    #[msg("Invalid signature threshold")]
    InvalidSignatureThreshold,
    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized")]
    Unauthorized,
}