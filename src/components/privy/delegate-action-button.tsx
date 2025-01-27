import {
    usePrivy,
    useSolanaWallets,
    useDelegatedActions,
    type WalletWithMetadata,
  } from '@privy-io/react-auth';
  import { KeyRound } from 'lucide-react';
  
  export function DelegateActionButton() {
    const {user} = usePrivy();
    const {ready, wallets} = useSolanaWallets();
    const {delegateWallet} = useDelegatedActions();
  
    // Find the embedded wallet to delegate from the array of the user's wallets
    const walletToDelegate = wallets.find((wallet) => wallet.walletClientType === 'privy');
  
    // Check if the wallet is already delegated
    const isAlreadyDelegated = !!user?.linkedAccounts.find(
      (account): account is WalletWithMetadata => account.type === 'wallet' && account.delegated,
    );
  
    const onDelegate = async () => {
      if (!walletToDelegate || !ready) return;
      try {
        await delegateWallet({address: walletToDelegate.address, chainType: 'solana'});
      } catch (error) {
        console.error('Failed to delegate wallet:', error);
      }
    };
  
    if (isAlreadyDelegated) {
      return (
        <button
          className="px-4 py-2 w-full mt-2 bg-blue-100 text-blue-700 rounded cursor-default disabled:bg-gray-100 disabled:text-gray-500 flex items-center justify-center"
          disabled
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Wallet Delegated
        </button>
      );
    }
  
    return (
      <button
        className="px-4 py-2 w-full mt-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center"
        disabled={!ready || !walletToDelegate}
        onClick={onDelegate}
      >
        <KeyRound className="w-4 h-4 mr-2" />
        {!ready ? 'Loading...' : 'Delegate Wallet Access'}
      </button>
    );
  }