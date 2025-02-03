import { AnchorProvider } from "@coral-xyz/anchor";
import { UnsignedTransactionRequest, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo } from 'react';

export function useAnchorProviderWithPrivy() {
    const { wallets } = useSolanaWallets();
    const { signTransaction, signMessage, sendTransaction } = usePrivy();

    // Create memoized connection to prevent unnecessary re-renders
    const connection = useMemo(() => 
        new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
            'confirmed'
        ),
        []
    );

    // Create memoized wallet instance
    const anchorWallet = useMemo(() => {
        const privyWallet = wallets[0];
        
        if (!privyWallet?.address) {
            return null;
        }

        return {
            publicKey: new PublicKey(privyWallet.address),
            signTransaction: async (tx: UnsignedTransactionRequest) => signTransaction(tx),
            signAllTransactions: async (txs: UnsignedTransactionRequest[]) => 
                Promise.all(txs.map(tx => signTransaction(tx)))
        } as AnchorWallet;
    }, [wallets, signTransaction]);

    // Create memoized provider
    const provider = useMemo(() => {
        if (!anchorWallet) {
            return null;
        }

        return new AnchorProvider(
            connection,
            anchorWallet,
            { commitment: 'confirmed' }
        );
    }, [connection, anchorWallet]);

    return {
        provider,
        anchorWallet,
        signMessage,
        connection,
        sendTransaction
    };
}