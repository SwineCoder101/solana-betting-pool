import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useSolanaPrivyWallet } from './use-solana-privy-wallet';
import { useEffect, useState } from 'react';

interface PrivyWalletCheck {
  embeddedWallet: ConnectedSolanaWallet | null;
  mainWallet: ConnectedSolanaWallet | null;
  refreshWalletState: () => void;
}

export function usePrivyWalletChecker(): PrivyWalletCheck {
  const { wallets } = useSolanaPrivyWallet();
  const [embeddedWallet, setEmbeddedWallet] = useState<ConnectedSolanaWallet | null>(null);
  const [mainWallet, setMainWallet] = useState<ConnectedSolanaWallet | null>(null);


  const refreshWalletState = () => {
    const embeddedWallet = wallets.find(
      (wallet): wallet is ConnectedSolanaWallet => 
        wallet.connectorType === "embedded"
    ) || null;

    const mainWallet = wallets.find(
      (wallet): wallet is ConnectedSolanaWallet => 
        wallet.connectorType !== "embedded"
    ) || null;

    setEmbeddedWallet(embeddedWallet);
    setMainWallet(mainWallet);
  }

  useEffect(() => {
    refreshWalletState();
  }, [wallets]);

  return {
    embeddedWallet,
    mainWallet,
    refreshWalletState,
  };
} 