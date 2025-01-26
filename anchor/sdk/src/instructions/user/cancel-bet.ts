import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';

export async function cancelBet(
  program: Program<HorseRace>,
  signer: Keypair,
  poolKey: PublicKey,
  betHash: PublicKey,
): Promise<Transaction> {
  const [betPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      signer.publicKey.toBuffer(),
      poolKey.toBuffer(),
      betHash.toBuffer(),
    ],
    program.programId
  );

  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      bet: betPDA,
      user: signer.publicKey,
      pool: poolKey,
      systemProgram: SystemProgram.programId,
    }).transaction();

  return tx;
}