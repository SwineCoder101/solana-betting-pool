import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function cancelBet(
  program: Program<HorseRace>,
  user: web3.PublicKey,
  bet: web3.PublicKey,
  pool: web3.PublicKey,
  signer: web3.Signer
): Promise<{ tx: web3.TransactionSignature, betHash: web3.PublicKey }> {
  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      user,
      bet,
      pool,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([signer])
    .rpc();

  return { tx, betHash };
}