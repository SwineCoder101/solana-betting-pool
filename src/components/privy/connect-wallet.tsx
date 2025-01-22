import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

const ConnectWalletPrivyButton = () => {
    const {connectWallet, user, ready, authenticated} = usePrivy();

    const {wallets, createWallet} = useSolanaWallets();


    const handleConnect = async () => {
        const response = await connectWallet();
        console.log("Response", response);
        console.log("Wallets", wallets);
        console.log("authenticated", authenticated);

        if (wallets.length === 0) {
            console.log("Creating wallet");
            const wallet = await createWallet();
            console.log('Created Wallet: ', wallet);
        }

    }

    useEffect(() => {
        console.log("User", user);
        console.log("Ready", ready);
        console.log("Authenticated", authenticated);
    }, [user, authenticated]);

    return (
        <div className="connect-wallet">
            <button className="connect-wallet__button" onClick={handleConnect}>Connect Wallet</button>
            {user && <div className="connect-wallet__user">User: {user.wallet?.address}</div>}
            {ready && <div className="connect-wallet__ready">Ready: {ready.toString()}</div>}
            {authenticated && <div className="connect-wallet__authenticated">Authenticated: {authenticated.toString()}</div>}
        </div>
    );
};

export default ConnectWalletPrivyButton;