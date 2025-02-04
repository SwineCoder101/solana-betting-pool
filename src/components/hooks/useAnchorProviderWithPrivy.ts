import { AnchorProvider } from "@coral-xyz/anchor";
import { UnsignedTransactionRequest, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

export function useAnchorProviderWithPrivy() {
    const { wallets } = useSolanaWallets();
    const { signTransaction } = usePrivy();
    const connection = useMemo(() => new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    ), []);
  
    const getAnchorWallet = useMemo(() => {
      if (!wallets[0]?.address) return null;
      
      return {
        publicKey: new PublicKey(wallets[0].address),
        signTransaction: async (tx: UnsignedTransactionRequest) => {
          return await signTransaction(tx);
        },
        signAllTransactions: async (txs: UnsignedTransactionRequest[]) => {
          return await Promise.all(txs.map(tx => signTransaction(tx)));
        }
      } as AnchorWallet;
    }, [wallets, signTransaction]);
  
    const provider = useMemo(() => {
      if (!getAnchorWallet) return null;
      return new AnchorProvider(connection, getAnchorWallet, {
        commitment: 'confirmed',
      });
    }, [connection, getAnchorWallet]);
  
    return {
      provider,
      getAnchorWallet,
      connection
    };
  }