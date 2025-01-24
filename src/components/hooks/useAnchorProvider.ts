import { AnchorProvider } from "@coral-xyz/anchor";
import { UnsignedTransactionRequest, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

export function useAnchorProvider() {
    const { wallets, createWallet } = useSolanaWallets();
    const { signTransaction, signMessage } = usePrivy();

    // Create connection to Solana mainnet or devnet
    const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    const getEmbeddedWallet = async () => {
        if (!wallets || wallets.length === 0) {
            return await createWallet();
        }
        return wallets[0];
    };

    const getAnchorWallet = async () => {
        const privyWallet = await getEmbeddedWallet();

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
    const getProvider = async () => {
        const wallet = await getAnchorWallet();
        return new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
    };

    return {
        getProvider,
        getAnchorWallet,
        signMessage,
        connection
    };
}