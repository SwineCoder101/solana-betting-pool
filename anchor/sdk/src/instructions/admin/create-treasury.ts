import { Program, web3 } from '@coral-xyz/anchor'
import { HorseRace } from '../../types/horse_race'
import { TreasuryAccount } from '../../states/treasury-account'
import { TransactionInstruction } from '@solana/web3.js'

export interface CreateTreasuryParams {
  maxAdmins: number
  minSignatures: number
  initialAdmins: web3.PublicKey[]
  payer?: web3.PublicKey
}

export async function createTreasury(
  program: Program<HorseRace>,
  params: CreateTreasuryParams,
): Promise<TransactionInstruction> {
  const { maxAdmins, minSignatures, initialAdmins, payer = program.provider.publicKey } = params
  const [treasuryKey] = await TreasuryAccount.getPda(program)

  return await program.methods
    .runCreateTreasury(maxAdmins, minSignatures, initialAdmins)
    .accountsStrict({
      treasury: treasuryKey,
      payer,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();
} 