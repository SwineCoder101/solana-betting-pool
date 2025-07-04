import { BN, Program, web3 } from '@coral-xyz/anchor';
import { TransactionInstruction } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';


export interface CompetitionParam {
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
  endTime: number,
}

export async function createCompetitiionEntry(program: Program<HorseRace>, param: CompetitionParam) {

  return await createCompetition(
    program,
    param.authority,
    param.competitionHash,
    param.competitionPubkey,
    param.tokenA,
    param.priceFeedId,
    param.adminPubkeys,
    param.houseCutFactor,
    param.minPayoutRatio,
    param.interval,
    param.startTime,
    param.endTime,
  )

}

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
  endTime: number,
): Promise<TransactionInstruction> {
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
    }).instruction();
}
