import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { LoginWalletButton } from "./login-wallet-button";
import { transferSolBetweenWallets } from "@/util/solana";
import { DelegateActionButton } from "./delegate-action-button";

interface WalletBalance {
    address: string;
    balance: number;
    isEmbedded: boolean;
}

export function WalletManager() {
    const { authenticated, ready, user } = usePrivy();
    const { wallets, createWallet } = useSolanaWallets();
    const [balances, setBalances] = useState<WalletBalance[]>([]);
    const [fundAmount, setFundAmount] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // Get the connected external wallet address
    const connectedAddress = user?.wallet?.address;

    // Create connection to Solana
    const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    // Fetch balances for all wallets
    const fetchBalances = async () => {
        if (!wallets) return;
        
        const balancePromises = wallets.map(async (wallet) => {
            try {
                const balance = await connection.getBalance(
                    new PublicKey(wallet.address)
                );
                return {
                    address: wallet.address,
                    balance: balance / LAMPORTS_PER_SOL,
                    isEmbedded: wallet.walletClientType === 'privy'
                };
            } catch (error) {
                console.error(`Error fetching balance for ${wallet.address}:`, error);
                return {
                    address: wallet.address,
                    balance: 0,
                    isEmbedded: wallet.walletClientType === 'privy'
                };
            }
        });

        const newBalances = await Promise.all(balancePromises);
        setBalances(newBalances);
    };

    useEffect(() => {
        if (authenticated && wallets) {
            fetchBalances();
        }
    }, [authenticated, wallets]);

    // Handle wallet creation
    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            await createWallet();
            await fetchBalances();
        } catch (error) {
            console.error("Error creating wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle funding between wallets
    const handleFund = async (fromAddress: string, toAddress: string) => {
        const amount = parseFloat(fundAmount[toAddress] || "0");
        if (!amount || amount <= 0) {
            alert(`Please enter a valid amount, amount appears to be ${amount}`);
            return;
        }

        const sourceWallet = wallets?.find(w => w.address === fromAddress);
        const sourceBalance = balances.find(b => b.address === fromAddress)?.balance || 0;

        if (amount > sourceBalance) {
            alert(`Insufficient balance for, ${fromAddress}`);
            return;
        }

        setLoading(true);
        try {
            const versionTx = await transferSolBetweenWallets(new PublicKey(fromAddress), new PublicKey(toAddress), amount);
            const signature = await sourceWallet?.sendTransaction(versionTx, connection);
            console.log('Transaction signature', signature);
            await fetchBalances();
        } catch (error) {
            console.error("Error funding wallet:", error);
            alert("Transfer failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!ready) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Wallet Manager</h2>
                <div className="flex items-center space-x-4">
                    <div className="space-x-2 text-sm">
                        <span>Status: {authenticated ? "Authenticated" : "Not Authenticated"}</span>
                        <span>Ready: {ready ? "Yes" : "No"}</span>
                        <span>User: {user?.wallet?.address}</span>
                        <span>Privy User: {user?.id}</span>
                    </div>
                    <LoginWalletButton connectedAddress={connectedAddress} />
                </div>
            </div>

            {authenticated && (
                <>
                    <DelegateActionButton />
                    <button
                        onClick={handleCreateWallet}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {loading ? "Creating..." : "Create New Embedded Wallet"}
                    </button>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Your Wallets</h3>
                        {balances.map((walletBalance) => (
                            <div
                                key={walletBalance.address}
                                className="p-4 border rounded-lg space-y-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-mono text-sm">
                                            {walletBalance.address}
                                        </p>
                                        <p className="text-sm">
                                            Balance: {walletBalance.balance.toFixed(4)} SOL
                                        </p>
                                        <p className="text-sm">
                                            Type: {walletBalance.isEmbedded ? "Embedded" : "External"}
                                        </p>
                                    </div>
                                    {walletBalance.isEmbedded && (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Amount in SOL"
                                                className="px-2 py-1 border rounded"
                                                value={fundAmount[walletBalance.address] || ""}
                                                onChange={(e) => setFundAmount({
                                                    ...fundAmount,
                                                    [walletBalance.address]: e.target.value
                                                })}
                                            />
                                            <button
                                                onClick={() => handleFund(wallets[0].address, walletBalance.address)}
                                                disabled={loading}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                                            >
                                                Fund
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}