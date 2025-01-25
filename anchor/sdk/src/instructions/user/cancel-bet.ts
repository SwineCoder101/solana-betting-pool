<<<<<<< Updated upstream
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js';
=======
import { Program, web3 } from '@coral-xyz/anchor';
>>>>>>> Stashed changes
import { HorseRace } from '../../../../target/types/horse_race';

export async function cancelBet(
  program: Program<HorseRace>,
<<<<<<< Updated upstream
  signer: Keypair,
  poolKey: PublicKey,
  betHash: PublicKey,
): Promise<{ tx: TransactionSignature, betHash: PublicKey }> {
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
=======
  user: web3.PublicKey,
  bet: web3.PublicKey,
  pool: web3.PublicKey,
  signer: web3.Signer
): Promise<web3.TransactionSignature> {
  const tx = await program.methods
    .runCancelBet()
    .accountsStrict({
      user,
      bet,
      pool,
      systemProgram: web3.SystemProgram.programId,
>>>>>>> Stashed changes
    })
    .signers([signer])
    .rpc();

  return { tx, betHash };
}