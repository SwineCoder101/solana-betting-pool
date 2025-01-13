import React from 'react';
import ConnectWalletPrivyButton from '../privy/connect-wallet';
import Providers from '../privy/privy-provider';

const VanillaLayout: React.FC = () => {
  return (
    <Providers>
      <div className="vanilla-layout">
        <h1>Welcome to Solana DApp</h1>
        <ConnectWalletPrivyButton />
      </div>
    </Providers>
  );
};

export default VanillaLayout;