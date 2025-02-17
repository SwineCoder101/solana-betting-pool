use anchor_lang::prelude::*;

#[account]
pub struct Treasury {
    pub admin_authorities: Vec<Pubkey>,
    pub min_signatures: u8,
    pub total_deposits: u64,
    pub total_withdrawals: u64,
    pub vault_key: Pubkey,
    pub vault_bump: u8,
    pub bump: u8,
}

impl Treasury {
    
    pub fn space(max_admins: usize) -> usize {
        8 +  // discriminator
        4 + (32 * max_admins) + // Vec<Pubkey> for admin_authorities
        1 + // min_signatures
        8 + // total_deposits
        8 + // total_withdrawals
        1   // bump
    }

    pub fn is_admin(&self, authority: &Pubkey) -> bool {
        self.admin_authorities.contains(authority)
    }
} 