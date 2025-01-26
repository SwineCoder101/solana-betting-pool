import { Program, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { COMPETITION_SEED } from '../../constants';
import { getVersionTxFromInstructions } from '../../utils';
import { createCompetition } from './create-competition';
import { createPool } from './create-pool';

export type CompetitionPoolResponse = {
  poolKeys: web3.PublicKey[],
  tx: web3.VersionedTransaction,
}

export async function createCompetitionWithPools(
  program: Program<HorseRace>,
  admin: PublicKey,
  competitionHash: PublicKey,
  tokenA: PublicKey,
  priceFeedId: string,
  adminKeys: PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
  endTime: number,
  treasury: PublicKey,
): Promise<CompetitionPoolResponse> {


  const [competitionPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(COMPETITION_SEED), competitionHash.toBuffer()],
    program.programId
  );


  // Get competition creation instruction
  const competitionIx = await createCompetition(
    program,
    admin,
    competitionHash,
    competitionPda,
    tokenA,
    priceFeedId,
    adminKeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime
  );

  // Calculate pool intervals
  const poolCount = Math.floor(interval / 60); // One pool per minute
  const poolInterval = interval / poolCount;
  
  // Generate pool hashes and time ranges
  const poolConfigs = Array.from({ length: poolCount }, (_, i) => ({
    poolHash: web3.Keypair.generate().publicKey,
    startTime: startTime + (i * poolInterval),
    endTime: startTime + ((i + 1) * poolInterval)
  }));

  // Create pool instructions in parallel
  const poolCreations = poolConfigs.map(({ poolHash, startTime: poolStartTime, endTime: poolEndTime }) => 
    createPool(
      program,
      admin,
      competitionHash,
      poolStartTime,
      poolEndTime,
      treasury,
      poolHash
    )
  );

  const poolResponses = await Promise.all(poolCreations);
  const poolInstructions = poolResponses.map(response => response.ix);

  const poolKeys = poolConfigs.map(config => config.poolHash);

  const allInstructions = [competitionIx, ...poolInstructions];

  const tx = await getVersionTxFromInstructions(program.provider.connection, allInstructions);

  return {
    tx,
    poolKeys
  };
}