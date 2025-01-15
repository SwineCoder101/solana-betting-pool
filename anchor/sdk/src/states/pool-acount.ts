import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { HorseRace } from "../../../target/types/horse_race";
import { POOL_SEED } from "../constants";

export type PoolData = {
  id: number,
  competitionKey: string,
  competitionId: number,
  startTime: number,
  endTime: number,
  treasury: string,
}

export type PoolProgramData = {
  id: number,
  competitionKey: PublicKey,
  competitionId: number,
  startTime: BN | number,
  endTime: BN | number,
  treasury: PublicKey,
}

export function convertPoolToProgramData(poolData: PoolData): PoolProgramData {
  return {
    id: poolData.id,
    competitionKey: new PublicKey(poolData.competitionKey),
    competitionId: poolData.competitionId,
    startTime: new BN(poolData.startTime),
    endTime: new BN(poolData.endTime),
    treasury: new PublicKey(poolData.treasury),
  };
}

export function convertProgramToPoolData(programData: PoolProgramData): PoolData {
  return {
    id: programData.id,
    competitionKey: programData.competitionKey.toString(),
    competitionId: programData.competitionId,
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