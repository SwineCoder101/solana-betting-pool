import { Program, BN, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';

export async function createCompetition(
  program: Program<HorseRace>,
  authority: web3.PublicKey,
  competitionHash: web3.PublicKey,
  competitionPubkey: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
  endTime: number
): Promise<web3.TransactionSignature> {
  return program.methods
    .runCreateCompetition(
      tokenA,
      priceFeedId,
      adminPubkeys,
      new BN(houseCutFactor),
      new BN(minPayoutRatio),
      new BN(interval),
      new BN(startTime),
      new BN(endTime)
    )
    .accountsStrict({
      competition: competitionPubkey,
      compHashAcc: competitionHash,
      authority,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}