import { useMutation } from '@tanstack/react-query';
import { createBet } from '../../anchor/sdk/src/instructions/user/create-bet';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from './use-anchor-program';

interface CreateBetParams {
  amount: number;
  lowerBoundPrice: number;
  upperBoundPrice: number;
  poolKey: string;
  competition: string;
}

export function useCreateBet() {
  const { user } = usePrivy();
  const program = useAnchorProgram();

  return useMutation({
    mutationFn: async (params: CreateBetParams) => {
      if (!user?.wallet?.address || !program) {
        throw new Error('Wallet not connected');
      }

      const tx = await createBet(
        program,
        new PublicKey(user.wallet.address),
        params.amount,
        params.lowerBoundPrice,
        params.upperBoundPrice,
        new PublicKey(params.poolKey),
        new PublicKey(params.competition)
      );

      return tx;
    },
    onError: (error) => {
      console.error('Failed to create bet:', error);
    },
    onSuccess: (tx) => {
      console.log('Bet created successfully:', tx);
    },
  });
} 