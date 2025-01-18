import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { COMPETITION_SEED } from "../constants";

export type CompetitionData = {
  tokenA : string,
  priceFeedId : string,
  admin: string[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
  endTime: number,

}

export type CompetitionProgramData = {
  tokenA: PublicKey,
  priceFeedId: string,
  admin: PublicKey[],
  houseCutFactor: BN | number,
  minPayoutRatio: BN | number,
  interval: BN | number,
  startTime: BN | number,
  endTime: BN | number
}

export function convertCompetitionToProgramData(competitionData: CompetitionData) : CompetitionProgramData{
  return {
    tokenA: new PublicKey(competitionData.tokenA),
    priceFeedId: competitionData.priceFeedId,
    admin: competitionData.admin.map(a => new PublicKey(a)),
    houseCutFactor: new BN(competitionData.houseCutFactor),
    minPayoutRatio: new BN(competitionData.minPayoutRatio),
    interval: new BN(competitionData.interval),
    startTime: new BN(competitionData.startTime),
    endTime: new BN(competitionData.endTime)
  }
}

export function convertProgramToCompetitionData(programData : CompetitionProgramData) : CompetitionData {
  console.log(typeof programData.minPayoutRatio);
  
  return {
    tokenA : programData.tokenA.toString(),
    priceFeedId: programData.priceFeedId,
    admin: programData.admin.map(a=> a.toString()),
    houseCutFactor: typeof programData.houseCutFactor === 'number' ? programData.houseCutFactor : programData.houseCutFactor.toNumber(),
    minPayoutRatio: typeof programData.minPayoutRatio === 'number' ? programData.minPayoutRatio : programData.minPayoutRatio.toNumber(),
    interval: typeof programData.interval === 'number' ? programData.interval : programData.interval.toNumber(),
    startTime: typeof programData.startTime === 'number' ? programData.startTime : programData.startTime.toNumber(),
    endTime: typeof programData.endTime === 'number' ? programData.endTime : programData.endTime.toNumber()
   }
}

//------------------------------------------------------- Data Finders
export const findCompetitonAddress = (competitionHash: PublicKey,programId?: string): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(COMPETITION_SEED), Buffer.from(competitionHash.toBuffer())],
    new PublicKey(programId || "")
  )[0];
};

// ------------------------------------------------------- Data Fetchers
export async function getCompetitionData(competitionHash: PublicKey, program: Program<HorseRace>) : Promise<CompetitionData> {
  const compAddress = findCompetitonAddress(competitionHash, program.programId.toString());
  const fetchedData = await program.account.competition.fetch(compAddress);
  return convertProgramToCompetitionData(fetchedData);
}

export async function getCompetitionAccount(
  program: Program<HorseRace>,
  competitionPubkey: PublicKey
) {
  return program.account.competition.fetch(competitionPubkey);
}
