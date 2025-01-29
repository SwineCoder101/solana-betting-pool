import { useAnchorProviderWithPrivy } from '@/components/hooks/useAnchorProviderWithPrivy';
import { Program } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { IDL } from '../../anchor/sdk/src';

export function useAnchorProgram() {
  // const { wallets } = useSolanaWallets();
  const {  provider } = useAnchorProviderWithPrivy();

  // // Create a stable connection instance
  // const connection = useMemo(() => 
  //   new Connection(process.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'),
  //   []
  // );

  // // Create a stable signer
  // const signer = useMemo(() => {
  //   if (!wallet?.address) return null;
    
  //   return {
  //     publicKey: new PublicKey(wallet.address),
  //     signTransaction: wallet.signTransaction.bind(wallet),
  //     signAllTransactions: async (transactions: Transaction[]) => {
  //       return Promise.all(transactions.map(transaction => wallet.signTransaction(transaction)));
  //     },
  //   };
  // }, [wallet]);

  // const signer = getAnchorWallet();

  // Create provider
  // const provider = useMemo(() => {
  //   if (!signer) return null;
    
  //   return new AnchorProvider(
  //     connection,
  //     signer as any,
  //     { commitment: 'confirmed' }
  //   );
  // }, [connection, signer]);

  // Create program instance
  const program = useMemo(() => {
    if (!provider) return null;
    
    try {
      return new Program(
        IDL,
        provider
      );
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  }, [provider]);

  return program;
}