import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { POOL_SEED } from "../constants";


export type PoolData = {
  poolHash: string,
  competitionKey: string,
  startTime: number,
  endTime: number,
  treasury: string,
}

export type PoolProgramData = {
  poolHash: PublicKey,
  competitionKey: PublicKey,
  startTime: BN | number,
  endTime: BN | number,
  treasury: PublicKey,
}

export function convertPoolToProgramData(poolData: PoolData): PoolProgramData {
  return {
  competitionKey: new PublicKey(poolData.competitionKey),
  startTime: new BN(poolData.startTime),
  endTime: new BN(poolData.endTime),
  treasury: new PublicKey(poolData.treasury),
  poolHash: new PublicKey(poolData.poolHash),
};
}

export function convertProgramToPoolData(programData: PoolProgramData): PoolData {
  return {
    poolHash: programData.poolHash.toString(),
    competitionKey: programData.competitionKey.toString(),
    startTime: typeof programData.startTime === 'number' ? programData.startTime : programData.startTime.toNumber(),
    endTime: typeof programData.endTime === 'number' ? programData.endTime : programData.endTime.toNumber(),
    treasury: programData.treasury.toString(),
  };
}

//------------------------------------------------------- Data Finders
export const findPoolAddress = (programId: string, id: number): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED), new BN(id).toArrayLike(Buffer, 'le', 8)],
    new PublicKey(programId)
  )[0];
};

// ------------------------------------------------------- Data Fetchers
export async function getPoolData(program: Program<HorseRace>, id: number): Promise<PoolData> {
  const poolAddress = findPoolAddress(program.programId.toString(), id);
  const fetchedData = await program.account.pool.fetch(poolAddress);
  return convertProgramToPoolData(fetchedData);
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