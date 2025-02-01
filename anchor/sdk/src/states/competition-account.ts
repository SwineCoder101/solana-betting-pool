import { Program, BN, ProgramAccount } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { COMPETITION_SEED } from "../constants";

export type CompetitionData = {
  competitionKey: string,
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
  competitionKey?: PublicKey,
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

export function convertProgramToCompetitionData(programData : ProgramAccount<CompetitionProgramData>) : CompetitionData {
  console.log(typeof programData.account.minPayoutRatio);
  
  return {
    competitionKey: programData.publicKey.toBase58(),
    tokenA : programData.account.tokenA.toString(),
    priceFeedId: programData.account.priceFeedId,
    admin: programData.account.admin.map(a=> a.toString()),
    houseCutFactor: typeof programData.account.houseCutFactor === 'number' ? programData.account.houseCutFactor : programData.account.houseCutFactor.toNumber(),
    minPayoutRatio: typeof programData.account.minPayoutRatio === 'number' ? programData.account.minPayoutRatio : programData.account.minPayoutRatio.toNumber(),
    interval: typeof programData.account.interval === 'number' ? programData.account.interval : programData.account.interval.toNumber(),
    startTime: typeof programData.account.startTime === 'number' ? programData.account.startTime : programData.account.startTime.toNumber(),
    endTime: typeof programData.account.endTime === 'number' ? programData.account.endTime : programData.account.endTime.toNumber()
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
  return convertProgramToCompetitionData({publicKey: compAddress, account: fetchedData});
}

export async function getCompetitionAccount(
  program: Program<HorseRace>,
  competitionPubkey: PublicKey
) {
  return program.account.competition.fetch(competitionPubkey);
}

export async function getAllCompetitions(program: Program<HorseRace>) : Promise<CompetitionData[]> {
  const competitionAccounts = await program.account.competition.all();
  return competitionAccounts.map((comp) => convertProgramToCompetitionData({publicKey: comp.publicKey, account: comp.account}));
}

export async function getAllLiveCompetitions(program: Program<HorseRace>) : Promise<CompetitionData[]> {
  const competitionAccounts = await program.account.competition.all();

  const filteredComp =  competitionAccounts.filter((comp) => {
    return comp.account.endTime > Date.now();
  });

  return filteredComp.map((comp) => convertProgramToCompetitionData({publicKey: comp.publicKey, account: comp.account}));
}
