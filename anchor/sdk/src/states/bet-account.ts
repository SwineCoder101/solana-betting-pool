import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";

export enum BetStatus {
  Active,
  Cancelled,
  Settled,
}

export type BetData = {
  user: string,
  amount: number,
  competition: string,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  poolKey: string,
  status: BetStatus,
}

export type BetProgramData = {
  user: PublicKey,
  amount: BN | number,
  competition: PublicKey,
  lowerBoundPrice: BN | number,
  upperBoundPrice: BN | number,
  poolKey: PublicKey,
  status: BetStatus,
}

export function convertBetToProgramData(betData: BetData): BetProgramData {
  return {
    user: new PublicKey(betData.user),
    amount: new BN(betData.amount),
    competition: new PublicKey(betData.competition),
    lowerBoundPrice: new BN(betData.lowerBoundPrice),
    upperBoundPrice: new BN(betData.upperBoundPrice),
    poolKey: new PublicKey(betData.poolKey),
    status: betData.status,
  };
}

export function convertProgramToBetData(programData: BetProgramData): BetData {
  return {
    user: programData.user.toString(),
    amount: typeof programData.amount === 'number' ? programData.amount : programData.amount.toNumber(),
    competition: programData.competition.toString(),
    lowerBoundPrice: typeof programData.lowerBoundPrice === 'number' ? programData.lowerBoundPrice : programData.lowerBoundPrice.toNumber(),
    upperBoundPrice: typeof programData.upperBoundPrice === 'number' ? programData.upperBoundPrice : programData.upperBoundPrice.toNumber(),
    poolKey: programData.poolKey.toString(),
    status: programData.status,
  };
}

// ------------------------------------------------------- Data Fetchers
export async function getBetData(program: Program<HorseRace>, betPubkey: PublicKey): Promise<BetData> {
  const fetchedData = await program.account.bet.fetch(betPubkey);
  return convertProgramToBetData(fetchedData);
}

export async function getBetAccount(
  program: Program<HorseRace>,
  betPubkey: PublicKey
) {
  return program.account.bet.fetch(betPubkey);
}