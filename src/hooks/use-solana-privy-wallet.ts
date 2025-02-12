import { useFundWallet, useSolanaWallets, usePrivy, ConnectedSolanaWallet } from "@privy-io/react-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

interface WalletBalance {
  address: string;
  balanceSol: number;
  balanceUsd: number;
  isEmbedded: boolean;
}

export const useSolanaPrivyWallet = () => {
  const { wallets, ready, exportWallet, createWallet } = useSolanaWallets();
  const { fundWallet } = useFundWallet();
  const { authenticated } = usePrivy();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const SOL_PRICE_USD = 198.73;
  const [mainWallet, setMainWallet] = useState<ConnectedSolanaWallet | null>(null);
  const [embeddedWallet, setEmbeddedWallet] = useState<ConnectedSolanaWallet | null>(null);

  const refreshWalletState = useCallback(() => {
    const _mainWallet = wallets.find((wallet) => wallet.connectorType !== "embedded");
    const _embeddedWallet = wallets.find((wallet) => wallet.connectorType === "embedded");
    if (_mainWallet) {
      setMainWallet(_mainWallet);
    }
    if (_embeddedWallet) {
      setEmbeddedWallet(_embeddedWallet);
    }
  }, [wallets]);

  useEffect(() => {
    refreshWalletState();
  }, [wallets, refreshWalletState]);

  // Create connection to Solana
  const connection = useMemo(() => new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
  ), []);

  const fetchBalances = useCallback(async () => {
    if (!wallets) return;
    
    setLoading(true);
    try {
      const balancePromises = wallets.map(async (wallet) => {
        try {
          const balance = await connection.getBalance(
            new PublicKey(wallet.address)
          );
          const balanceSol = balance / LAMPORTS_PER_SOL;
          return {
            address: wallet.address,
            balanceSol,
            balanceUsd: balanceSol * SOL_PRICE_USD,
            isEmbedded: wallet.walletClientType === 'privy'
          };
        } catch (error) {
          console.error(`Error fetching balance for ${wallet.address}:`, error);
          return {
            address: wallet.address,
            balanceSol: 0,
            balanceUsd: 0,
            isEmbedded: wallet.walletClientType === 'privy'
          };
        }
      });

      const newBalances = await Promise.all(balancePromises);
      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  }, [wallets, connection]);

  useEffect(() => {
    if (authenticated && wallets) {
      fetchBalances();
      // Set up polling for balance updates
      const interval = setInterval(fetchBalances, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated, wallets, fetchBalances]);

  return {
    wallets, 
    ready, 
    exportWallet, 
    createWallet, 
    mainWallet, 
    embeddedWallet, 
    fundWallet,
    balances,
    loading,
    fetchBalances,
    refreshWalletState
  };
};
