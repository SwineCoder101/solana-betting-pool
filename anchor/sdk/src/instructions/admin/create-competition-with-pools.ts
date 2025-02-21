import { Program, web3 } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { HorseRace } from '../../../../target/types/horse_race';
import { COMPETITION_SEED } from '../../constants';
import { getVersionTxFromInstructions } from '../../utils';
import { createCompetition } from './create-competition';
import { createPool } from './create-pool';

export type CompetitionPoolResponse = {
  poolKeys: web3.PublicKey[],
  competitionTx: web3.VersionedTransaction,
  poolTxs: web3.VersionedTransaction[]
}

export type CompetitionPoolParams = {
  admin: PublicKey,
  tokenA: PublicKey,
  priceFeedId: string,
  adminKeys: PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
  endTime: number,
  treasury: PublicKey,
}


export async function createCompetitionWithPoolsEntry(program: Program<HorseRace>, params: CompetitionPoolParams){

  const competitionHash = Keypair.generate().publicKey;

  const {
    competitionTx, // Return first transaction with competition creation
    poolKeys,
    poolTxs
  } =  await createCompetitionWithPools(
    program,
    params.admin,
    competitionHash,
    params.tokenA,
    params.priceFeedId,
    params.adminKeys,
    params.houseCutFactor,
    params.minPayoutRatio,
    params.interval,
    params.startTime,
    params.endTime,
  );

  return {
    competitionTx, // Return first transaction with competition creation
    poolKeys,
    poolTxs
  }
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
): Promise<CompetitionPoolResponse> {
  
  const [competitionPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(COMPETITION_SEED), competitionHash.toBuffer()],
    program.programId
  );


  const competitionTx = await getVersionTxFromInstructions(
    program.provider.connection,
    [await createCompetition(
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
    )],
    admin
  );

  const poolCount = Math.floor((endTime - startTime) / interval); // Correct calculation
  const poolInterval = interval;

  
  const poolConfigs = Array.from({ length: poolCount }, (_, i) => ({
    poolHash: web3.Keypair.generate().publicKey,
    startTime: startTime + (i * poolInterval),
    endTime: startTime + ((i + 1) * poolInterval)
  }));


  // Create pool transactions
  const poolTxResponses = await Promise.all(
    poolConfigs.map(async (config) => {
      const { ix, poolKey } = await createPool(
        program,
        admin,
        competitionPda, // Use actual competition PDA
        config.startTime,
        config.endTime,
        config.poolHash
      );
      
      return {
        tx: await getVersionTxFromInstructions(
          program.provider.connection,
          [ix],
          admin
        ),
        poolKey
      };
    })
  );

  const poolKeys = poolTxResponses.map(c => c.poolKey);
  const poolTxs = poolTxResponses.map(c => c.tx);

  return {
    competitionTx, // Return first transaction with competition creation
    poolKeys,
    poolTxs
  };
}