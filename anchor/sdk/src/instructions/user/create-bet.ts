import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { getVersionTxFromInstructions } from '../../utils';
import { findPoolKeyFromStartEndTime } from '../../states';


export type CreateBetParams = {
  user: PublicKey,
  amount: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  startTime?: number,
  endTime?: number,
  competitionKey: PublicKey,
  poolKey?: PublicKey,
}

export async function createBetEntry(program: Program<HorseRace>, params: CreateBetParams): Promise<VersionedTransaction> {
  const { user, amount, lowerBoundPrice, upperBoundPrice, startTime, endTime, competitionKey } = params;

  if (!startTime || !endTime) {
    throw new Error('startTime and endTime are required');
  }

  if (!params.poolKey) {
    params.poolKey = await findPoolKeyFromStartEndTime(program, competitionKey, startTime, endTime);
  }
  return createBet(program, user, amount, lowerBoundPrice, upperBoundPrice, params.poolKey, competitionKey);
}

export async function createBet(
  program: Program<HorseRace>,
  user: PublicKey,
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
      user.toBuffer(),
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
      user,
      bet: betPDA,
      pool: poolKey,
      betHashAcc: betHash,
      systemProgram: web3.SystemProgram.programId,
    }).instruction();


    const vtx = await getVersionTxFromInstructions(program.provider.connection, [tx]);

  return vtx;
}