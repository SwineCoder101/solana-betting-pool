import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';

export async function createBet(
  program: Program<HorseRace>,
  signer: Keypair,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  poolKey: PublicKey,
  competitionKey: PublicKey,
): Promise<VersionedTransaction> {
  
  const betHash = Keypair.generate().publicKey;

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
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}