pub fn get_winnings(amount: u64, leverage_multiplier: u64, scale: u64) -> u64 {
    let product: u128 = (amount as u128) * (leverage_multiplier as u128);
    (product / (scale as u128)) as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_winnings_1_5_multiplier() {
        let bet_amount = 1_000_000_000u64;
        let multiplier_fixed = 1_500_000u64; // represents 1.5
        let scale = 1_000_000u64; // 6 decimal places
        let winnings = get_winnings(bet_amount, multiplier_fixed, scale);
        assert_eq!(winnings, 1_500_000_000u64);
    }

    #[test]
    fn test_get_winnings_rounding() {
        let bet_amount = 1_000_000_000u64;
        let multiplier_fixed = 1_333_333u64; // represents approximately 1.333333
        let scale = 1_000_000u64;
        let winnings = get_winnings(bet_amount, multiplier_fixed, scale);
        assert_eq!(winnings, 1_333_333_000u64);
    }
}
