import { usePrivy } from "@privy-io/react-auth";

const ConnectWalletPrivy = () => {
    const {connectWallet} = usePrivy();

    const handleConnect = async () => {
        await connectWallet(); 
    }

    return (
        <div className="connect-wallet">
            <button className="connect-wallet__button" onClick={handleConnect}>Connect Wallet</button>
        </div>
    );
};


export default ConnectWalletPrivy;