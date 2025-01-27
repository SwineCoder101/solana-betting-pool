import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Keypair, PublicKey } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { createBet } from '../../anchor/sdk/src/instructions/user/create-bet';
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
  const { wallets } = useSolanaWallets();
  const program = useAnchorProgram();

  const wallet = wallets[0];  

  return useMutation({
    mutationFn: async (params: CreateBetParams) => {
      if (!user?.wallet?.address || !program) {
        throw new Error('Wallet not connected');
      }

      const vtx = await createBet(
        program,
        Keypair.generate(),
        params.amount,
        params.lowerBoundPrice,
        params.upperBoundPrice,
        new PublicKey(params.poolKey),
        new PublicKey(params.competition)
      );

      // Convert to versioned transaction
      // const versionedTx = await convertToVersionedTransaction(
      //   program.provider.connection,
      //   tx
      // );

      // Sign the versioned transaction
      const signedTx = await wallet.signTransaction(vtx);

      // Send and confirm
      const signature = await program.provider.connection.sendTransaction(signedTx);
      await program.provider.connection.confirmTransaction(signature);

      return signature;
    },
    onError: (error) => {
      console.error('Failed to create bet:', error);
    },
    onSuccess: (signature) => {
      console.log('Bet created successfully:', signature);
    },
  });
} 