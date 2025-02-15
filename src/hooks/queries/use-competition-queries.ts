import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import {
  CompetitionData,
  getAllCompetitions,
  getCompetitionData
} from '../../../anchor/sdk/src/states/competition-account';
import { useAnchorProgram } from '../use-anchor-program';

export function useCompetitionData(competitionPubkey: PublicKey | null) {
  const { program } = useAnchorProgram();

  return useQuery({
    queryKey: ['competition', competitionPubkey?.toString()],
    queryFn: async (): Promise<CompetitionData | null> => {
      if (!program || !competitionPubkey) return null;
      return getCompetitionData(competitionPubkey,program);
    },
    enabled: !!program && !!competitionPubkey,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useAllCompetitions() {
  const { program } = useAnchorProgram();
  
  console.log("useAllCompetitions hook called, program state:", !!program);

  if (!program) {
    console.log("Program not initialized yet in useAllCompetitions");
    return useQuery({
      queryKey: ['allCompetitions'],
      queryFn: async () => [],
      enabled: false,
    });
  }
  
  return useQuery({
    queryKey: ['allCompetitions'],
    queryFn: async (): Promise<CompetitionData[]> => {
      if (!program) {
        console.log("Program not available in queryFn");
        throw new Error("Program not initialized");
      }
      console.log("Fetching competition accounts...");
      const results = await getAllCompetitions(program);
      console.log("Competition accounts fetched:", results.length);
      console.log("competition: ", results[0]);
      return results;
    },
    enabled: !!program,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useActiveCompetitions() {
  const {program} = useAnchorProgram();
  
  return useQuery({
    queryKey: ['activeCompetitions'],
    queryFn: async (): Promise<CompetitionData[]> => {
      if (!program) return [];
      const competitions = await getAllCompetitions(program);
      console.log("competition: ", competitions[0]);
      const now = Math.floor(Date.now() / 1000);
      return competitions.filter(comp => 
        comp.startTime <= now && comp.endTime >= now
      );
    },
    enabled: !!program,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useActiveCompetitionsWithPools() {
  const { data: competitions } = useAllCompetitions();
  const now = Math.floor(Date.now() / 1000);
  
  return {
    data: competitions?.filter(comp => comp.endTime > now) || [],
  };
} 