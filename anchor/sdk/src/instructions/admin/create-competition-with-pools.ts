import { Program, web3 } from '@coral-xyz/anchor';
import { HorseRace } from '../../../../target/types/horse_race';
import { Keypair } from '@solana/web3.js';
import { createCompetition } from './create-competition';
import { createPool, CreatePoolResponse } from './create-pool';
import { COMPETITION_SEED } from '../../constants';

export type CompetitionPoolResponse = {
  poolKeys: web3.PublicKey[],
  tx: web3.TransactionSignature
}

export async function createCompetitionWithPools(
  program: Program<HorseRace>,
  authority: web3.Keypair,
  competitionHash: web3.PublicKey,
  tokenA: web3.PublicKey,
  priceFeedId: string,
  adminPubkeys: web3.PublicKey[],
  houseCutFactor: number,
  minPayoutRatio: number,
  interval: number,
  startTime: number,
  endTime: number,
  treasury: web3.PublicKey,
): Promise<CompetitionPoolResponse> {

  const [competitionPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(COMPETITION_SEED), competitionHash.toBuffer()],
    program.programId
  );

  console.log('Creating competition with hash:', competitionHash.toBase58());
  console.log('Competition:', competitionPda.toBase58());
  console.log('from:', authority.publicKey.toBase58());

  const tx = await createCompetition(
    program,
    authority,
    competitionHash,
    competitionPda,
    tokenA,
    priceFeedId,
    adminPubkeys,
    houseCutFactor,
    minPayoutRatio,
    interval,
    startTime,
    endTime,
  );

  const numOfPools = Math.floor((endTime - startTime) / interval);

  const pools: CreatePoolResponse[] = await Promise.all(
    Array.from({ length: numOfPools }, (_, i) => {
      const poolStartTime = startTime + i * interval;
      const poolEndTime = poolStartTime + interval;

      const poolHash = Keypair.generate().publicKey;
      return createPool(
        program,
        authority,
        competitionPda,
        poolStartTime,
        poolEndTime,
        treasury,
        poolHash,
      );
    })
  );

  const poolKeys = pools.map((pool) => pool.poolKey);

  return {
    tx,
    poolKeys
  };
}