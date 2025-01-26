import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from '../use-anchor-program';
import { getBetData, getAllBetDataByUser, BetData } from '../../../anchor/sdk/src/states/bet-account';

export function useBetData(betPubkey: PublicKey | null) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['bet', betPubkey?.toString()],
    queryFn: async (): Promise<BetData | null> => {
      if (!program || !betPubkey) return null;
      return getBetData(program, betPubkey);
    },
    enabled: !!program && !!betPubkey,
  });
}

export function useUserBets(userPubkey: PublicKey | null) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['userBets', userPubkey?.toString()],
    queryFn: async (): Promise<BetData[]> => {
      if (!program || !userPubkey) return [];
      return getAllBetDataByUser(program, userPubkey);
    },
    enabled: !!program && !!userPubkey,
  });
} 