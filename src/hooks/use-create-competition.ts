import { useMutation } from '@tanstack/react-query';
import { createCompetitionWithPools } from '../../anchor/sdk/src/instructions/admin/create-competition-with-pools';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
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

export function useCreateCompetition() {
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const program = useAnchorProgram();
  const wallet = wallets[0];

  return useMutation({
    mutationFn: async (params: CreateCompetitionParams) => {
      if (!user?.wallet?.address || !program || !wallet) {
        throw new Error('Wallet not connected');
      }

      // Get all instructions
      const { instructions, poolKeys } = await createCompetitionWithPools(
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
        new PublicKey(params.treasury)
      );

      // Create a new transaction and add all instructions
      const tx = new Transaction();
      instructions.forEach(ix => tx.add(ix));

      // Get latest blockhash
      const latestBlockhash = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = new PublicKey(user.wallet.address);

      // Convert to versioned transaction
      const versionedTx = new VersionedTransaction(tx.compileMessage());

      // Sign with wallet
      const signedTx = await wallet.signTransaction(versionedTx);

      // Send and confirm
      const signature = await program.provider.connection.sendTransaction(signedTx);
      await program.provider.connection.confirmTransaction(signature, 'confirmed');

      return {
        signature,
        poolKeys: poolKeys.map(key => key.toString())
      };
    },
    onError: (error) => {
      console.error('Failed to create competition:', error);
    },
    onSuccess: (result) => {
      console.log('Competition and pools created successfully:', result);
    },
  });
} 