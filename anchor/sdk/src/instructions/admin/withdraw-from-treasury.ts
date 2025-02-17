import { Program, web3, BN } from '@coral-xyz/anchor'
import { HorseRace } from '../../types/horse_race'
import { TreasuryAccount } from '../../states/treasury-account'
import { TransactionInstruction } from '@solana/web3.js'

export interface WithdrawFromTreasuryParams {
  amount: BN
  recipient: web3.PublicKey
  pool: web3.PublicKey
  authority?: web3.PublicKey
}

export async function withdrawFromTreasury(
  program: Program<HorseRace>,
  params: WithdrawFromTreasuryParams,
): Promise<TransactionInstruction> {
  const { amount, recipient, pool, authority = program.provider.publicKey } = params
  const [treasuryKey] = await TreasuryAccount.getTreasuryPda(program)
  const [treasuryVaultKey] = await TreasuryAccount.getTreasuryVaultPda(program, treasuryKey)

  return program.methods
    .runWithdrawFromTreasury(amount)
    .accountsStrict({
      treasury: treasuryKey,
      treasuryAccount: treasuryVaultKey,
      recipient,
      pool,
      authority,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction()
} 