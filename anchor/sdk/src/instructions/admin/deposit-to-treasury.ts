import { Program, web3, BN } from '@coral-xyz/anchor'
import { TreasuryAccount } from '../../states/treasury-account'
import { TransactionInstruction } from '@solana/web3.js'
import { HorseRace } from '../../types/horse_race'

export interface DepositToTreasuryParams {
  amount: BN
  depositor?: web3.PublicKey
}

export async function depositToTreasury(
  program: Program<HorseRace>,
  params: DepositToTreasuryParams,
): Promise<TransactionInstruction> {
  const { amount, depositor = program.provider.publicKey } = params
  const [treasuryKey] = await TreasuryAccount.getTreasuryPda(program)
  const [treasuryVaultKey] = await TreasuryAccount.getTreasuryVaultPda(program)
  
  return program.methods
    .runDepositToTreasury(amount)
    .accountsStrict({
      treasury: treasuryKey,
      depositor,
      systemProgram: web3.SystemProgram.programId,
      treasuryVault: treasuryVaultKey,
    })
    .instruction()
} 