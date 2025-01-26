import { AnchorProvider } from "@coral-xyz/anchor";
import { UnsignedTransactionRequest, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

export function useAnchorProviderWithPrivy() {
    const { wallets } = useSolanaWallets();
    const { signTransaction, signMessage,sendTransaction } = usePrivy();

    // Create connection to Solana mainnet or devnet
    const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    const getAnchorWallet = () => {
        const privyWallet =  wallets[0];

        return {
            publicKey: new PublicKey(privyWallet.address),
            signTransaction: async (tx: UnsignedTransactionRequest) => {
                return await signTransaction(tx);
            },
            signAllTransactions: async (txs: UnsignedTransactionRequest[]) => {
                return await Promise.all(txs.map(tx=> signTransaction(tx)));
            }
        } as AnchorWallet;
    };

    // Create and return the provider
    const getProvider = () => {
        const wallet = getAnchorWallet();
        return new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
    };

    const provider = getProvider();

    return {
        provider,
        getAnchorWallet,
        signMessage,
        connection,
        sendTransaction
    };
}