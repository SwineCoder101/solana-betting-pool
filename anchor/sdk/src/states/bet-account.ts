import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";

export enum BetStatus {
  Active,
  Cancelled,
  Settled,
}

export interface BetData {
  publicKey: string;
  user: string;
  amount: number;
  lowerBoundPrice: number;
  upperBoundPrice: number;
  poolKey: string;
  competition: string;
  status: BetStatus;
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
export function convertToBetStatus(status: StatusEnumProgram): BetStatus {
  if ('active' in status) {
    return BetStatus.Active;
  } else if ('cancelled' in status) {
    return BetStatus.Cancelled;
  } else if ('settled' in status) {
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
    publicKey: programData.user.toString(),
    user: programData.user.toString(),
    amount: typeof programData.amount === 'number' ? programData.amount : programData.amount.toNumber(),
    lowerBoundPrice: typeof programData.lowerBoundPrice === 'number' ? programData.lowerBoundPrice : programData.lowerBoundPrice.toNumber(),
    upperBoundPrice: typeof programData.upperBoundPrice === 'number' ? programData.upperBoundPrice : programData.upperBoundPrice.toNumber(),
    poolKey: programData.poolKey.toString(),
    competition: programData.competition.toString(),
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
  // Get all bet accounts
  const accounts = await program.account.bet.all();
  
  // Filter accounts where user matches
  const betAccounts = accounts.filter((account) => {
    const accountUser = account.account.user.toBase58();
    const matches = accountUser === userPubkey.toBase58();
    return matches;
  });

  return betAccounts.map(account => ({
    ...convertProgramToBetData(account.account),
    publicKey: account.publicKey.toBase58()
  }));
}

export async function getAllBetAccounts(program: Program<HorseRace>): Promise<BetData[]> {
  const accounts = await program.account.bet.all();
  return accounts.map(account => convertProgramToBetData(account.account));
}

export async function getActiveBetAccountsForPool(
  program: Program<HorseRace>,
  poolPubkey: PublicKey,
): Promise<BetData[]> {
  const accounts = await getBetAccountsForPool(program, poolPubkey);
  return accounts.filter(account => account.status === BetStatus.Active);
}

export async function getBetAccountsForPool(
  program: Program<HorseRace>,
  poolPubkey: PublicKey,
): Promise<BetData[]> {
  // Get all bet accounts
  const accounts = await program.account.bet.all();
  
  // Filter accounts where poolKey matches
  const betAccounts = accounts.filter((account) => {
    const accountPoolKey = account.account.poolKey.toBase58();
    const matches = accountPoolKey === poolPubkey.toBase58();
    return matches;
  });

  betAccounts.forEach(acc => {
    console.log('Account:', {
      pubkey: acc.publicKey.toBase58(),
      poolKey: acc.account.poolKey.toBase58(),
      user: acc.account.user.toBase58()
    });
  });

  return betAccounts.map(account => ({
    ...convertProgramToBetData(account.account),
    publicKey: account.publicKey.toBase58()
  }));
}

export async function getAllBetDataByUser(program: Program<HorseRace>, user: PublicKey): Promise<BetData[]> {
  const bets = await program.account.bet.all();
  return bets.filter((bet) => bet.account.user.toBase58() === user.toBase58()).map((bet) => convertProgramToBetData(bet.account));
}