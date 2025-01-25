import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from '../use-anchor-program';
import { 
  getPoolData, 
  getPoolsByCompetition,
  PoolData 
} from '../../../anchor/sdk/src/states/pool-account';

export function usePoolData(poolPubkey: PublicKey | null) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['pool', poolPubkey?.toString()],
    queryFn: async (): Promise<PoolData | null> => {
      if (!program || !poolPubkey) return null;
      return getPoolData(program, poolPubkey);
    },
    enabled: !!program && !!poolPubkey,
  });
}

export function useCompetitionPools(competitionPubkey: PublicKey | null) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['competitionPools', competitionPubkey?.toString()],
    queryFn: async (): Promise<PoolData[]> => {
      if (!program || !competitionPubkey) return [];
      return getPoolsByCompetition(program, competitionPubkey);
    },
    enabled: !!program && !!competitionPubkey,
  });
}

export function useActivePools() {
  const program = useAnchorProgram();
  
  return useQuery({
    queryKey: ['activePools'],
    queryFn: async (): Promise<PoolData[]> => {
      if (!program) return [];
      const now = Math.floor(Date.now() / 1000);
      
      // Get all competitions first
      const competitions = await program.account.competition.all();
      
      // Get pools for each competition
      const allPools = await Promise.all(
        competitions.map(comp => 
          getPoolsByCompetition(program, comp.publicKey)
        )
      );
      
      // Flatten and filter active pools
      return allPools
        .flat()
        .filter(pool => pool.startTime <= now && pool.endTime >= now);
    },
    enabled: !!program,
  });
} 