import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        appearance: { theme: "light", accentColor: "#676FFF", walletChainType: "solana-only" },
        externalWallets: { solana: { connectors: solanaConnectors } },
      }}
    >
      <div>{children}</div>
    </PrivyProvider>
  );
}
