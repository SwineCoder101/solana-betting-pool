import { Program, web3 } from '@coral-xyz/anchor'
import { HorseRace } from '../../types/horse_race'
import { TreasuryAccount } from '../../states/treasury-account'
import { TransactionInstruction } from '@solana/web3.js'

export interface WithdrawFromTreasuryParams {
  amount: bigint
  recipient: web3.PublicKey
  pool: web3.PublicKey
  authority?: web3.PublicKey
}

export async function withdrawFromTreasury(
  program: Program<HorseRace>,
  params: WithdrawFromTreasuryParams,
): Promise<TransactionInstruction> {
  const { amount, recipient, pool, authority = program.provider.publicKey } = params
  const [treasuryKey] = await TreasuryAccount.getPda(program)

  return await program.methods
    .runWithdrawFromTreasury(amount)
    .accountsStrict({
      treasury: treasuryKey,
      treasuryAccount: treasuryKey,
      recipient,
      pool,
      authority,
      systemProgram: web3.SystemProgram.programId,
    }).instruction();
} 