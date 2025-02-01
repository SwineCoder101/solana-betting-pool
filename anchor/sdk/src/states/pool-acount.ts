import { Program, BN, ProgramAccount } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { POOL_SEED } from "../constants";


export type PoolData = {
  poolKey: string,
  poolHash: string,
  competitionKey: string,
  startTime: number,
  endTime: number,
  treasury: string,
}

export type PoolProgramData = {
  poolKey?: PublicKey,
  poolHash: PublicKey,
  competitionKey: PublicKey,
  startTime: BN | number,
  endTime: BN | number,
  treasury: PublicKey,
}

export function convertPoolToProgramData(poolData: PoolData): PoolProgramData {
  return {
    poolKey: new PublicKey(poolData.poolKey),
    competitionKey: new PublicKey(poolData.competitionKey),
    startTime: new BN(poolData.startTime),
    endTime: new BN(poolData.endTime),
    treasury: new PublicKey(poolData.treasury),
    poolHash: new PublicKey(poolData.poolHash),
};
}

export function convertProgramToPoolData(programData: ProgramAccount<PoolProgramData>): PoolData {
  return {
    poolKey: programData.publicKey.toBase58(),
    poolHash: programData.account.poolHash.toString(),
    competitionKey: programData.account.competitionKey.toString(),
    startTime: typeof programData.account.startTime === 'number' ? programData.account.startTime : programData.account.startTime.toNumber(),
    endTime: typeof programData.account.endTime === 'number' ? programData.account.endTime : programData.account.endTime.toNumber(),
    treasury: programData.account.treasury.toString(),
  };
}

//------------------------------------------------------- Data Finders
export const findPoolAddress = (programId: string, competitionKey: string, poolHash: string): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED), Buffer.from(competitionKey), Buffer.from(poolHash)],
    new PublicKey(programId)
  )[0];
};

// ------------------------------------------------------- Data Fetchers
export async function getPoolData(program: Program<HorseRace>, poolPubkey: PublicKey): Promise<PoolData> {
  const pool = await getPoolAccount(program, poolPubkey);
  return convertProgramToPoolData({publicKey: poolPubkey, account: pool});
}

export async function getBalanceOfPool(program: Program<HorseRace>, poolPubkey: PublicKey) {
  const balance = await program.provider.connection.getBalance(poolPubkey);
  return balance;
}

export async function getPoolAccount(
  program: Program<HorseRace>,
  poolPubkey: PublicKey
) {
  return program.account.pool.fetch(poolPubkey);
}

export async function getPoolAccounts(
  program: Program<HorseRace>,
  poolPubkeys: PublicKey[]
) {
  return program.account.pool.fetchMultiple(poolPubkeys);
}

export async function getPoolBalance(poolPubkey: PublicKey, program: Program<HorseRace>) {
  return program.provider.connection.getBalance(poolPubkey);
}

export async function getPoolAccountsFromCompetition(program: Program<HorseRace>, competitionKey: PublicKey) {
  const pools = await program.account.pool.all();
  return pools.filter(pool => pool.account.competitionKey === competitionKey);
}

export async function getAllPoolDataByCompetition(program: Program<HorseRace>, competition: PublicKey): Promise<PoolData[]> {
  const pools = await program.account.pool.all();
  return pools.filter((pool) => pool.account.competitionKey.toBase58() === competition.toBase58()).map((pool) => convertProgramToPoolData(pool));
}

export async function getAllPoolDataByUser(program: Program<HorseRace>, user: PublicKey): Promise<PoolData[]> {
  const pools = await program.account.pool.all();
  return pools.filter((pool) => pool.account.treasury.toBase58() === user.toBase58()).map((pool) => convertProgramToPoolData(pool));
}

export async function findPoolKeyFromStartEndTime(program: Program<HorseRace>, competitionKey: PublicKey, startTime: number, endTime: number): Promise<PublicKey> {
  const pools = await getAllPoolDataByCompetition(program, competitionKey);
  const poolKeyStr = pools.find(pool => pool.startTime === startTime && pool.endTime === endTime)?.poolKey;
  if (!poolKeyStr) {
    throw new Error("Pool not found");
  }
  return new PublicKey(poolKeyStr);
}
