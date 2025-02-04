import { useFundWallet, useSolanaWallets } from "@privy-io/react-auth";



export const useSolanaPrivyWallet = () => {
  const { wallets, ready, exportWallet, createWallet } = useSolanaWallets();
  const { fundWallet } = useFundWallet();

  const mainWallet = wallets.find((wallet) => wallet.connectorType !== "embedded");
  const embeddedWallet = wallets.find((wallet) => wallet.connectorType === "embedded");

  return {wallets, ready, exportWallet, createWallet, mainWallet, embeddedWallet, fundWallet};
};
