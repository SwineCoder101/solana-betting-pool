import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function createBet(
  program: Program<HorseRace>,
  user: web3.PublicKey,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  poolKey: web3.PublicKey,
  competition: web3.PublicKey
): Promise<web3.TransactionSignature> {
  const bet = web3.Keypair.generate();

  const tx = await program.methods
    .runCreateBet(
      new anchor.BN(amount),
      new anchor.BN(lowerBoundPrice),
      new anchor.BN(upperBoundPrice),
      poolKey,
      competition
    )
    .accounts({
      user,
      bet: bet.publicKey,
      pool: poolKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([bet])
    .rpc();

  return tx;
}