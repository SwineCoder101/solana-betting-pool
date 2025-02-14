import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { createBet } from '../../../anchor/sdk/src/instructions/user/create-bet';
import { useAnchorProgram } from '../use-anchor-program';

interface CreateBetParams {
  amount: number;
  lowerBoundPrice: number;
  upperBoundPrice: number;
  poolKey: string;
  competition: string;
}

export function useCreateBet() {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { program, connection } = useAnchorProgram();
  const wallet = wallets[0];

  return useMutation({
    mutationKey: ['createBet'],
    mutationFn: async (params: CreateBetParams) => {
      if (!user?.wallet?.address || !wallet) {
        throw new Error('Wallet not connected');
      }
      if (!program) {
        throw new Error('Program not initialized');
      }

      try {
        const vtx = await createBet(
          program,
          new PublicKey(user.wallet.address),
          params.amount,
          params.lowerBoundPrice,
          params.upperBoundPrice,
          1,
          new PublicKey(params.poolKey),
          new PublicKey(params.competition)
        );

        const signedTx = await wallet.signTransaction(vtx);
        const signature = await connection.sendTransaction(signedTx);
        await connection.confirmTransaction(signature);

        return {
          signature,
          params
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create bet';
        console.error('Error in createBet:', error);
        throw new Error(message);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to create bet:', error.message);
    },
    onSuccess: (data) => {
      console.log('Bet created successfully:', data.signature);
    },
  });
} 