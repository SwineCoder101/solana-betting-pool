import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function cancelBet(
  program: Program<HorseRace>,
  user: web3.PublicKey,
  bet: web3.PublicKey,
  pool: web3.PublicKey
): Promise<web3.TransactionSignature> {
  const tx = await program.methods
    .runCancelBet()
    .accounts({
      user,
      bet,
      pool,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([])
    .rpc();

  return tx;
}