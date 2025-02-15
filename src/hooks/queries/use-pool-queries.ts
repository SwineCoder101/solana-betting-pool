import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from '../use-anchor-program';
import { getAllCompetitions, getAllPoolDataByCompetition, getAllPools, getPoolData, PoolData } from '../../../anchor/sdk/src';


export function usePoolData(poolPubkey: PublicKey | null) {
  const { program } = useAnchorProgram();

  return useQuery({
    queryKey: ['pool', poolPubkey?.toString()],
    queryFn: async (): Promise<PoolData | null> => {
      if (!program || !poolPubkey) return null;
      return getPoolData(program, poolPubkey);
    },
    enabled: !!program && !!poolPubkey,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useCompetitionPools(competitionPubkey: PublicKey | null) {
  const {program} = useAnchorProgram();

  return useQuery({
    queryKey: ['competitionPools', competitionPubkey?.toString()],
    queryFn: async (): Promise<PoolData[]> => {
      if (!program || !competitionPubkey) return [];
      return getAllPoolDataByCompetition(program ,competitionPubkey);
    },
    enabled: !!program && !!competitionPubkey,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useActivePools() {
  const {program} = useAnchorProgram();
  
  return useQuery({
    queryKey: ['activePools'],
    queryFn: async (): Promise<PoolData[]> => {
      if (!program) return [];
      const now = Math.floor(Date.now() / 1000);
      
      // Get all competitions first
      const competitions = await getAllCompetitions(program);
      
      // Get pools for each competition
      const allPools = await Promise.all(
        competitions.map(comp => 
          getAllPoolDataByCompetition(program, new PublicKey(comp.competitionKey))
        )
      );
      
      // Flatten and filter active pools
      return allPools
        .flat()
        .filter(pool => pool.startTime <= now && pool.endTime >= now);
    },
    enabled: !!program,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useAllPools() {
  const { program } = useAnchorProgram();
  
  console.log("useAllPools hook called, program state:", !!program);
  
  return useQuery({
    queryKey: ['allPools'],
    queryFn: async (): Promise<PoolData[]> => {
      if (!program) {
        console.log("Program not available in queryFn");
        throw new Error("Program not initialized");
      }
      console.log("Fetching pool accounts...");
      const results = await getAllPools(program);
      console.log("pool: ", results[0]);
      console.log("Pool accounts fetched:", results.length);
      return results;
    },
    enabled: !!program,
    retry: true,
    retryDelay: 1000,
  });
} 