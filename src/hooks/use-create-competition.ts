import { useMutation } from '@tanstack/react-query';
import { createCompetitionWithPools } from '../../anchor/sdk/src/instructions/admin/create-competition-with-pools';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey, Signer } from '@solana/web3.js';
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
  signer: Signer;
}

export function useCreateCompetition() {
  const { user } = usePrivy();
  const program = useAnchorProgram();

  return useMutation({
    mutationFn: async (params: CreateCompetitionParams) => {
      if (!user?.wallet?.address || !program) {
        throw new Error('Wallet not connected');
      }

      const { poolKeys } = await createCompetitionWithPools(
        program,
        new PublicKey(user.wallet.address),
        new PublicKey(params.competitionHash),
        new PublicKey(params.tokenA),
        params.priceFeedId,
        params.adminKeys.map(key => new PublicKey(key)),
        params.houseCutFactor,
        params.minPayoutRatio,
        params.interval,
        params.startTime,
        params.endTime,
        new PublicKey(params.treasury),
        params.signer
      );

      return { poolKeys };
    },
    onError: (error) => {
      console.error('Failed to create competition:', error);
    },
    onSuccess: (result) => {
      console.log('Competition created successfully with pools:', result.poolKeys);
    },
  });
} 