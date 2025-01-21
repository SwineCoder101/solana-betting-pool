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
  status: StatusEnumProgram,
}

/* eslint-disable @typescript-eslint/ban-types */
export type StatusEnumProgram =
  | { active: {} }
  | { cancelled: {} }
  | { settled: {} }


export function convertBetToProgramData(betData: BetData): BetProgramData {
  return {
    user: new PublicKey(betData.user),
    amount: new BN(betData.amount),
    competition: new PublicKey(betData.competition),
    lowerBoundPrice: new BN(betData.lowerBoundPrice),
    upperBoundPrice: new BN(betData.upperBoundPrice),
    poolKey: new PublicKey(betData.poolKey),
    status: convertToBetProgramStatus(betData.status),
  };
}

export function convertToBetStatus(status): BetStatus {
  if (status.active !== undefined) {
    return BetStatus.Active;
  } else if (status.cancelled !== undefined) {
    return BetStatus.Cancelled;
  } else if (status.settled !== undefined) {
    return BetStatus.Settled;
  } else {
    throw new Error("Unknown BetStatus");
  }
}

export function convertToBetProgramStatus(status: BetStatus): StatusEnumProgram {
  switch (status) {
    case BetStatus.Active:
      return { active: {} };
    case BetStatus.Cancelled:
      return { cancelled: {} };
    case BetStatus.Settled:
      return { settled: {} };
    default:
      throw new Error("Unknown BetStatus");
  }
}

export function convertProgramToBetData(programData: BetProgramData): BetData {
  return {
    user: programData.user.toString(),
    amount: typeof programData.amount === 'number' ? programData.amount : programData.amount.toNumber(),
    competition: programData.competition.toString(),
    lowerBoundPrice: typeof programData.lowerBoundPrice === 'number' ? programData.lowerBoundPrice : programData.lowerBoundPrice.toNumber(),
    upperBoundPrice: typeof programData.upperBoundPrice === 'number' ? programData.upperBoundPrice : programData.upperBoundPrice.toNumber(),
    poolKey: programData.poolKey.toString(),
    status: convertToBetStatus(programData.status),
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

export async function getBetAccountsForUser(
  program: Program<HorseRace>,
  userPubkey: PublicKey
): Promise<BetData[]> {
  const accounts = await program.account.bet.all();
  const betAccounts = accounts.filter((account) => account.account.user.equals(userPubkey));
  return betAccounts.map((account) => convertProgramToBetData(account.account));
}

export async function getBetAccountsForPool(
  program: Program<HorseRace>,
  poolPubkey: PublicKey
): Promise<BetData[]> {
  const accounts = await program.account.bet.all();
  const betAccounts = accounts.filter((account) => account.account.poolKey.equals(poolPubkey));
  return betAccounts.map((account) => convertProgramToBetData(account.account));
} 