import { Program, web3 } from "@coral-xyz/anchor";
import { HorseRace } from "../../../../target/types/horse_race";
import { BN } from "@coral-xyz/anchor";

export async function updateCompetitionInstruction(
  program: Program<HorseRace>,
  competitionPubkey: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
    endTime: number,
  authority: web3.PublicKey,
){

  return program.methods
    .runUpdateCompetition(
      tokenA,
      priceFeedId,
      adminPubkeys,
      new BN(houseCutFactor),
      new BN(minPayoutRatio),
      new BN(interval),
      new BN(startTime),
      new BN(endTime)
    )
    .accounts({
      competition: competitionPubkey,
      authority,
    }).instruction();
}
