import { Program, web3, BN } from '@coral-xyz/anchor'
import { HorseRace } from '../../types/horse_race'
import { TreasuryAccount } from '../../states/treasury-account'
import { TransactionInstruction } from '@solana/web3.js'

export interface DepositToTreasuryParams {
  amount: BN
  depositor?: web3.PublicKey
}

export async function depositToTreasury(
  program: Program<HorseRace>,
  params: DepositToTreasuryParams,
): Promise<TransactionInstruction> {
  const { amount, depositor = program.provider.publicKey } = params
  const [treasuryKey] = await TreasuryAccount.getPda(program)

  return program.methods
    .runDepositToTreasury(amount)
    .accountsStrict({
      treasury: treasuryKey,
      treasuryAccount: treasuryKey,
      depositor,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction()
} 