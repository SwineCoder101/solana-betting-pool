import { tokens } from '@/data/data-constants';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnchorProgram } from './use-anchor-program';
import { CompetitionPoolParams, createCompetitionWithPoolsEntry } from '../../anchor/sdk/src/instructions/admin/create-competition-with-pools';
import { useSolanaPrivyWallet } from './use-solana-privy-wallet';

export type CreateCompetitionParams = {
  tokenSymbol: string;
  houseCutFactor: number;
  minPayoutRatio: number;
  interval: number;
  startTime: number;
  endTime: number;
  adminKeys?: string[];
  treasury?: string;
};

export function useCreateCompetition() {
  const { program } = useAnchorProgram();
  const queryClient = useQueryClient();
  const { user } = usePrivy();
  const { embeddedWallet} = useSolanaPrivyWallet();

  return useMutation({
    mutationFn: async (params: CreateCompetitionParams) => {
      if (!program || !user?.wallet?.address) {
        throw new Error('Program or wallet not initialized');
      }

      // Find token data from constants
      const tokenData = tokens.find(t => t.symbol === params.tokenSymbol);
      if (!tokenData) {
        throw new Error('Invalid token symbol');
      }

      // Convert admin keys to PublicKeys if provided
      const adminKeys = params.adminKeys 
        ? params.adminKeys.map(key => new PublicKey(key))
        : [];

      // Create competition params
      const competitionParams: CompetitionPoolParams = {
        admin: new PublicKey(user.wallet.address),
        tokenA: new PublicKey(tokenData.tokenAddress),
        priceFeedId: tokenData.priceFeedId,
        adminKeys,
        houseCutFactor: params.houseCutFactor,
        minPayoutRatio: params.minPayoutRatio,
        interval: params.interval,
        startTime: params.startTime,
        endTime: params.endTime,
        treasury: params.treasury 
          ? new PublicKey(params.treasury)
          : new PublicKey(user.wallet.address),
      };
      const { competitionTx, poolTxs } = await createCompetitionWithPoolsEntry(program, competitionParams);

      const signedCompetitionTx = await embeddedWallet?.signTransaction(competitionTx);
      const signedPoolTxs = await Promise.all(poolTxs.map(tx => embeddedWallet?.signTransaction(tx)));
      
      const compTx = await program.provider.connection.sendRawTransaction(signedCompetitionTx?.serialize() as Uint8Array);
      await program.provider.connection.confirmTransaction({
        signature: compTx,
        ...(await program.provider.connection.getLatestBlockhash()),
      });
      for (const signedPoolTx of signedPoolTxs) {
        if (!signedPoolTx) continue;
        const rawPoolTx = await program.provider.connection.sendRawTransaction(signedPoolTx.serialize() as Uint8Array);
        await program.provider.connection.confirmTransaction({
          signature: rawPoolTx,
          ...(await program.provider.connection.getLatestBlockhash()),
        });
      }

      return compTx;
    },
    onSuccess: () => {
      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['allCompetitions'],
        refetchType: 'active',
        exact: true 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['activeCompetitions'],
        refetchType: 'active',
        exact: true 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['allPools'],
        refetchType: 'active',
        exact: true 
      });

      // Optional: Force an immediate refetch
      queryClient.refetchQueries({ 
        queryKey: ['allCompetitions'],
        exact: true 
      });
    },
    onError: (error) => {
      console.error('Failed to create competition:', error);
    }
  });
}