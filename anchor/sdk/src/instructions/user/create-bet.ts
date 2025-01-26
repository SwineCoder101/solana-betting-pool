import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export async function createBet(
  program: Program<HorseRace>,
  signer: Keypair,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  poolKey: PublicKey,
  competitionKey: PublicKey,
): Promise<Transaction> {
  const betHash = Keypair.generate().publicKey;

  console.log('Creating bet with amount:', amount);
  console.log('Lower bound price:', lowerBoundPrice);
  console.log('Upper bound price:', upperBoundPrice);
  console.log('Pool:', poolKey.toBase58());
  console.log('Competition:', competitionKey.toBase58());
  console.log('User:', signer.publicKey.toBase58());
  console.log('Bet hash:', betHash.toBase58());

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
    .runCreateBet(
      new anchor.BN(amount),
      new anchor.BN(lowerBoundPrice),
      new anchor.BN(upperBoundPrice),
      poolKey,
      competitionKey
    )
    .accountsStrict({
      user: signer.publicKey,
      bet: betPDA,
      pool: poolKey,
      betHashAcc: betHash,
      systemProgram: web3.SystemProgram.programId,
    }).transaction();

  return tx;
}