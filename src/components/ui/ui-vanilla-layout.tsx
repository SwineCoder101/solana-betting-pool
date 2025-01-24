import React from 'react';
import Providers from '../privy/privy-provider';
import { WalletManager } from '../privy/connect-wallet';

const VanillaLayout: React.FC = () => {
  return (
    <Providers>
      <div className="vanilla-layout">
        <h1>Welcome to Solana DApp</h1>
        <WalletManager />
      </div>
    </Providers>
  );
};

export default VanillaLayout;