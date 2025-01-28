import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { createCompetitionWithPools } from '../../anchor/sdk/src/instructions/admin/create-competition-with-pools';
import { useAnchorProgram } from './use-anchor-program';

interface CreateCompetitionParams {
  competitionHash: string;
  tokenA: string;
  priceFeedId: string;
  adminKeys: string[];
  houseCutFactor: number;
  minPayoutRatio: number;
  interval: number;
  startTime: number;
  endTime: number;
  treasury: string;
}

interface CreateCompetitionResult {
  signature: string;
  poolKeys: string[];
  params: CreateCompetitionParams;
}

export function useCreateCompetition() {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { program, connection } = useAnchorProgram();
  const wallet = wallets[0];

  return useMutation<CreateCompetitionResult, Error, CreateCompetitionParams>({
    mutationKey: ['createCompetition'],
    mutationFn: async (params: CreateCompetitionParams) => {
      try {
        // Validate all required elements
        if (!user?.wallet?.address) throw new Error('User wallet not connected');
        if (!program) throw new Error('Program not initialized');
        if (!wallet) throw new Error('Solana wallet not connected');

        // Convert parameters
        const adminPublicKeys = params.adminKeys.map(k => new PublicKey(k));
        const competitionHash = new PublicKey(params.competitionHash);
        const tokenA = new PublicKey(params.tokenA);
        const treasury = new PublicKey(params.treasury);

        // Create competition transaction
        const { competitionTx, poolKeys } = await createCompetitionWithPools(
          program,
          new PublicKey(user.wallet.address),
          competitionHash,
          tokenA,
          params.priceFeedId,
          adminPublicKeys,
          params.houseCutFactor,
          params.minPayoutRatio,
          params.interval,
          params.startTime,
          params.endTime,
          treasury
        );

        // Sign and send transaction
        const signedTx = await wallet.signTransaction(competitionTx);
        const signature = await wallet.sendTransaction(signedTx, connection);

        // Return serializable result
        return {
          signature,
          poolKeys: poolKeys.map(key => key.toBase58()),
          params
        };
      } catch (error) {
        // Convert error to serializable format
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create competition error:', error);
        throw new Error(message);
      }
    },
    onError: (error: Error) => {
      console.error('Competition mutation error:', error.message);
    },
    onSuccess: (data) => {
      console.log('Successfully created competition:', {
        signature: data.signature,
        poolCount: data.poolKeys.length
      });
    }
  });
}