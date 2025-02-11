// import { SolanaProvider } from '../components/solana/solana-provider'
import BananaApp from '@/BananaApp'
import Providers from '@/components/privy/privy-provider'

  // const client = new QueryClient()

export function App() {
  return (
    // <QueryClientProvider client={client}>
    //   {/* <ClusterProvider> */}
    //     <SolanaPrivyProvider>
    //       <AppRoutes />
    //     </SolanaPrivyProvider>
    //   {/* </ClusterProvider> */}
    // </QueryClientProvider>
    <Providers>
      {/* <AppRoutes /> */}
      {/* <VanillaLayout /> */}
      <BananaApp />
    </Providers>
  )
}
