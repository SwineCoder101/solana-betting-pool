import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from '../use-anchor-program';
import { getBetData, getAllBetDataByUser, BetData, getAllBetAccounts } from '../../../anchor/sdk/src/states/bet-account';

export function useBetData(betPubkey: PublicKey | null) {
  const programResult = useAnchorProgram();
  const program = programResult.program;
  return useQuery({
    queryKey: ['bet', betPubkey?.toString()],
    queryFn: async (): Promise<BetData | null> => {
      if (!program || !betPubkey) return null;
      return getBetData(program, betPubkey);
    },
    enabled: !!program && !!betPubkey,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useAllBets() {
  const { program } = useAnchorProgram();
  
  return useQuery({
    queryKey: ['allBets'],
    queryFn: async (): Promise<BetData[]> => {
      if (!program) {
        console.log("Program not available in queryFn");
        throw new Error("Program not initialized");
      }
      console.log("Fetching bet accounts...");
      const results = await getAllBetAccounts(program);

      console.log("bet: ", results[0]);
      console.log("Bet accounts fetched:", results.length);
      return results;
    },
    enabled: !!program,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useUserBets(userPubkey: PublicKey | null) {
  const {program} = useAnchorProgram();

  return useQuery({
    queryKey: ['userBets', userPubkey?.toString()],
    queryFn: async (): Promise<BetData[]> => {
      if (!program || !userPubkey) return [];
      return getAllBetDataByUser(program, userPubkey);
    },
    enabled: !!program && !!userPubkey,
    retry: 3,
    retryDelay: 1000,
  });
} 