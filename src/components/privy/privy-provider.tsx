import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import React from "react";
const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;
  return (
    <React.StrictMode>
      <PrivyProvider
        appId={privyAppId}
        clientId={privyClientId}
        config={{
          loginMethods: ['wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: '',
          },
          solanaClusters: [{
            name: 'mainnet-beta', rpcUrl: 'https://api.mainnet-beta.solana.com'}, {name: 'testnet', rpcUrl: 'https://api.testnet.solana.com'}, {name: 'devnet' , rpcUrl: 'https://api.devnet.solana.com'} ],
          externalWallets: { solana: { connectors: solanaConnectors } },
          embeddedWallets: { 
            createOnLogin: 'all-users'
        } 
        }}
      >
        {children}
      </PrivyProvider>
    </React.StrictMode>
  );
}
