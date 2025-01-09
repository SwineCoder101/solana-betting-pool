import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { COMPETITION_SEED } from "../constants";

export type CompetitionData = {
  tokenA : string,
  priceFeedId : string,
  admin: string[],
  houseCutFactor: number,
  minPayoutRatio: number,
}

export type CompetitionProgramData = {
  tokenA: PublicKey,
  priceFeedId: string,
  admin: PublicKey[],
  houseCutFactor: BN,
  minPayoutRatio: BN,
}

export function convertCompetitionToProgramData(competitionData: CompetitionData) : CompetitionProgramData{
  return {
    tokenA: new PublicKey(competitionData.tokenA),
    priceFeedId: competitionData.priceFeedId,
    admin: competitionData.admin.map(a => new PublicKey(a)),
    houseCutFactor: new BN(competitionData.houseCutFactor),
    minPayoutRatio: new BN(competitionData.minPayoutRatio)
  }
}

export function convertProgramToCompetitionData(programData : CompetitionProgramData) : CompetitionData {
  return {
    tokenA : programData.tokenA.toString(),
    priceFeedId: programData.priceFeedId,
    admin: programData.admin.map(a=> a.toString()),
    houseCutFactor: programData.houseCutFactor.toNumber(),
    minPayoutRatio: programData.minPayoutRatio.toNumber()
  }
}

//------------------------------------------------------- Data Finders
export const findCompetitonAddress = (programId?: string): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(COMPETITION_SEED)],
    new PublicKey(programId || "")
  )[0];
};

// ------------------------------------------------------- Data Fetchers
export async function getCompetitionData(program: Program<HorseRace>) : Promise<CompetitionData> {
  const compAddress = findCompetitonAddress(program.programId.toString());
  const fetchedData = await program.account.competition.fetch(compAddress);
  return convertProgramToCompetitionData(fetchedData);
}

export async function getCompetitionAccount(
  program: Program<HorseRace>,
  competitionPubkey: PublicKey
) {
  return program.account.competition.fetch(competitionPubkey);
}
