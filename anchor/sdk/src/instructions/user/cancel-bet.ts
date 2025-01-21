import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';
import { Keypair } from '@solana/web3.js';

export async function cancelBet(
  program: Program<HorseRace>,
  signer: Keypair,
  bet: web3.PublicKey,
  pool: web3.PublicKey
): Promise<web3.TransactionSignature> {
  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      user: signer.publicKey,
      bet,
      pool,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([signer])
    .rpc();

  return tx;
}