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
  leverage: number;
  leverageMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
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

const ACCOUNT_DISCRIMINATOR_SIZE = 8;
const PUBLIC_KEY_SIZE = 32;
const U64_SIZE = 8;

function getPoolKeyOffset(): number {
  return ACCOUNT_DISCRIMINATOR_SIZE + // Account discriminator
         PUBLIC_KEY_SIZE +           // user
         U64_SIZE +                 // amount
         PUBLIC_KEY_SIZE +          // competition
         U64_SIZE +                // lower_bound_price
         U64_SIZE;                // upper_bound_price
}

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

export async function convertProgramToBetData(account: any): Promise<BetData> {
  return {
    publicKey: account.publicKey?.toString() || '',
    user: account.user.toString(),
    amount: account.amount.toNumber(),
    lowerBoundPrice: account.lowerBoundPrice.toNumber(),
    upperBoundPrice: account.upperBoundPrice.toNumber(),
    poolKey: account.poolKey.toString(),
    competition: account.competition.toString(),
    status: convertToBetStatus(account.status),
    leverage: account.leverage.toNumber(),
    leverageMultiplier: account.leverageMultiplier.toNumber(),
    createdAt: new Date(account.createdAt.toNumber() * 1000),
    updatedAt: new Date(account.updatedAt.toNumber() * 1000),
  };
}

// ------------------------------------------------------- Data Fetchers
export async function getBetData(program: Program<HorseRace>, betPubkey: PublicKey): Promise<BetData> {
  const betAccount = await program.account.bet.fetch(betPubkey);
  return {
    publicKey: betPubkey.toString(),
    user: betAccount.user.toString(),
    amount: betAccount.amount.toNumber(),
    competition: betAccount.competition.toString(),
    lowerBoundPrice: betAccount.lowerBoundPrice.toNumber(),
    upperBoundPrice: betAccount.upperBoundPrice.toNumber(),
    poolKey: betAccount.poolKey.toString(),
    status: convertToBetStatus(betAccount.status),
    leverage: betAccount.leverage.toNumber(),
    leverageMultiplier: betAccount.leverageMultiplier.toNumber(),
    createdAt: new Date(betAccount.createdAt.toNumber() * 1000),
    updatedAt: new Date(betAccount.updatedAt.toNumber() * 1000),
  };
}

export async function getBetsForUserAndPool(
  program: Program<HorseRace>,
  userPubkey: PublicKey,
  poolPubkey: PublicKey
): Promise<BetData[]> {
  const bets = await program.account.bet.all();
  return await Promise.all(bets.filter((bet) => bet.account.user.toBase58() === userPubkey.toBase58() && bet.account.poolKey.toBase58() === poolPubkey.toBase58()).map(async (bet) => convertProgramToBetData(bet.account)));
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
  const accounts = await program.account.bet.all([
    {
      memcmp: {
        offset: 8,
        bytes: userPubkey.toBase58(),
      },
    },
  ]);

  return accounts.map((account) => ({
    publicKey: account.publicKey.toString(),
    user: account.account.user.toString(),
    amount: account.account.amount.toNumber(),
    lowerBoundPrice: account.account.lowerBoundPrice.toNumber(),
    upperBoundPrice: account.account.upperBoundPrice.toNumber(),
    poolKey: account.account.poolKey.toString(),
    competition: account.account.competition.toString(),
    status: convertToBetStatus(account.account.status),
    leverage: account.account.leverage.toNumber(),
    leverageMultiplier: account.account.leverageMultiplier.toNumber(),
    createdAt: new Date(account.account.createdAt.toNumber() * 1000),
    updatedAt: new Date(account.account.updatedAt.toNumber() * 1000),
  }));
}

export async function getAllBetAccounts(program: Program<HorseRace>): Promise<BetData[]> {
  const accounts = await program.account.bet.all();
  return await Promise.all(accounts.map(async (account) => convertProgramToBetData(account.account)));
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
  const accounts = await program.account.bet.all([
    {
      memcmp: {
        offset: getPoolKeyOffset(),
        bytes: poolPubkey.toBase58(),
      },
    },
  ]);

  return accounts.map((account) => ({
    publicKey: account.publicKey.toString(),
    user: account.account.user.toString(),
    amount: account.account.amount.toNumber(),
    lowerBoundPrice: account.account.lowerBoundPrice.toNumber(),
    upperBoundPrice: account.account.upperBoundPrice.toNumber(),
    poolKey: account.account.poolKey.toString(),
    competition: account.account.competition.toString(),
    status: convertToBetStatus(account.account.status),
    leverage: account.account.leverage.toNumber(),
    leverageMultiplier: account.account.leverageMultiplier.toNumber(),
    createdAt: new Date(account.account.createdAt.toNumber() * 1000),
    updatedAt: new Date(account.account.updatedAt.toNumber() * 1000),
  }));
}

export async function getAllBetDataByUser(program: Program<HorseRace>, user: PublicKey): Promise<BetData[]> {
  const bets = await program.account.bet.all();
  return await Promise.all(bets.filter((bet) => bet.account.user.toBase58() === user.toBase58()).map(async (bet) => convertProgramToBetData(bet.account)));
}