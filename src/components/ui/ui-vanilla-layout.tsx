import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import AdminFeatures from '../admin/admin-features';
import { LoginWalletButton } from "../privy/login-wallet-button";
import { WalletManager } from "../privy/wallet-manager";
import { useBackend } from "@/hooks/use-backend";

interface WalletInfo {
    address: string;
    balance: number;
    type: 'embedded' | 'external';
}

export function VanillaLayout() {
    const [activeTab, setActiveTab] = useState<'wallet' | 'admin'>('wallet');
    const [walletInfo, setWalletInfo] = useState<WalletInfo[]>([]);
    const { authenticated, user } = usePrivy();
    const { wallets } = useSolanaWallets();
    const { isLive, isLoading } = useBackend();

    const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    const fetchWalletBalances = async () => {
        if (!authenticated) return;

        const allWallets = [
            ...(user?.wallet ? [{ address: user.wallet.address, type: 'external' as const }] : []),
            ...(wallets?.map(w => ({ address: w.address, type: 'embedded' as const })) || [])
        ];

        const balancePromises = allWallets.map(async (wallet) => {
            try {
                const balance = await connection.getBalance(new PublicKey(wallet.address));
                return {
                    address: wallet.address,
                    balance: balance / LAMPORTS_PER_SOL,
                    type: wallet.type
                };
            } catch (error) {
                console.error(`Error fetching balance for ${wallet.address}:`, error);
                return {
                    address: wallet.address,
                    balance: 0,
                    type: wallet.type
                };
            }
        });

        const newBalances = await Promise.all(balancePromises);
        setWalletInfo(newBalances);
    };

    useEffect(() => {
        fetchWalletBalances();
        // Set up an interval to refresh balances
        const interval = setInterval(fetchWalletBalances, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [authenticated, wallets, user?.wallet]);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className={"min-h-screen bg-gray-100"}>
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Wallet Information */}
                        <div className="flex items-center space-x-4">
                            {authenticated && walletInfo.map((wallet) => (
                                <div 
                                    key={wallet.address} 
                                    className="text-sm bg-gray-100 rounded-lg px-3 py-1"
                                >
                                    <span className="font-medium">
                                        {wallet.type === 'external' ? 'External' : 'Embedded'}:
                                    </span>
                                    <span className="ml-2 font-mono">
                                        {formatAddress(wallet.address)}
                                    </span>
                                    <span className="ml-2">
                                        {wallet.balance.toFixed(4)} SOL
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            {/* Login Button */}
                            <LoginWalletButton 
                                connectedAddress={user?.wallet?.address}
                                className="ml-4"
                            />
                            
                            {/* Backend Status Indicator */}
                            <div className="flex items-center gap-2 text-sm">
                                <span>Backend:</span>
                                {isLoading ? (
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                ) : isLive ? (
                                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Backend Connected" />
                                ) : (
                                    <div className="w-3 h-3 bg-red-500 rounded-full" title="Backend Offline" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    {authenticated && (
                        <div className="flex space-x-4 mt-4">
                            <button
                                onClick={() => setActiveTab('wallet')}
                                className={`px-4 py-2 rounded-t-lg transition-colors ${
                                    activeTab === 'wallet'
                                        ? 'bg-gray-100 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Wallet Manager
                            </button>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-2 rounded-t-lg transition-colors ${
                                    activeTab === 'admin'
                                        ? 'bg-gray-100 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Admin Panel
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {authenticated ? (
                    activeTab === 'wallet' ? (
                        <WalletManager />
                    ) : (
                        <AdminFeatures />
                    )
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-700">
                            Please connect your wallet to continue
                        </h2>
                    </div>
                )}
            </main>
        </div>
    );
}