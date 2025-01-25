import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from '../use-anchor-program';
import { 
  getCompetitionData, 
  getAllCompetitions,
  CompetitionData 
} from '../../../anchor/sdk/src/states/competition-account';

export function useCompetitionData(competitionPubkey: PublicKey | null) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['competition', competitionPubkey?.toString()],
    queryFn: async (): Promise<CompetitionData | null> => {
      if (!program || !competitionPubkey) return null;
      return getCompetitionData(competitionPubkey, program);
    },
    enabled: !!program && !!competitionPubkey,
  });
}

export function useAllCompetitions() {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['competitions'],
    queryFn: async (): Promise<CompetitionData[]> => {
      if (!program) return [];
      return getAllCompetitions(program);
    },
    enabled: !!program,
  });
}

export function useActiveCompetitions() {
  const program = useAnchorProgram();
  
  return useQuery({
    queryKey: ['activeCompetitions'],
    queryFn: async (): Promise<CompetitionData[]> => {
      if (!program) return [];
      const competitions = await getAllCompetitions(program);
      const now = Math.floor(Date.now() / 1000);
      return competitions.filter(comp => 
        comp.startTime <= now && comp.endTime >= now
      );
    },
    enabled: !!program,
  });
} 