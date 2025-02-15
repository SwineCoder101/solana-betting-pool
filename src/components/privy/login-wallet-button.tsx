import { useLogin, usePrivy } from "@privy-io/react-auth";

interface LoginWalletButtonProps {
    connectedAddress?: string;
    className?: string;
}

export function LoginWalletButton({className = '' }: LoginWalletButtonProps) {
    const { authenticated, logout, user } = usePrivy();
    const { login } = useLogin();

    const connectedAddress = user?.wallet?.address;

    // Format address for display
    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Handle connect/disconnect
    const handleConnectWallet = async () => {
        if (authenticated) {
            await logout();
            // Navigate to the onboarding page
        } else {
            await login({ loginMethods: ['wallet'] });
        }
    };

    return (
        <button
            onClick={handleConnectWallet}
            className={`px-4 py-2 rounded font-medium transition-colors ${
                authenticated 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${className}`}
        >
            {authenticated && connectedAddress
                ? `Disconnect (${formatAddress(connectedAddress)})`
                : 'Connect Wallet'
            }
        </button>
    );
}
