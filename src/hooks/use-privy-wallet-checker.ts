import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useSolanaPrivyWallet } from './use-solana-privy-wallet';

interface PrivyWalletCheck {
  embeddedWallet: ConnectedSolanaWallet | null;
  mainWallet: ConnectedSolanaWallet | null;
}

export function usePrivyWalletChecker(): PrivyWalletCheck {
  const { wallets } = useSolanaPrivyWallet();

  const embeddedWallet = wallets.find(
    (wallet): wallet is ConnectedSolanaWallet => 
      wallet.connectorType === "embedded"
  ) || null;

  const mainWallet = wallets.find(
    (wallet): wallet is ConnectedSolanaWallet => 
      wallet.connectorType !== "embedded"
  ) || null;

  return {
    embeddedWallet,
    mainWallet,
  };
} 