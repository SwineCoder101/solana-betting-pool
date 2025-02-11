// import { SolanaProvider } from '../components/solana/solana-provider'
import BananaApp from '@/BananaApp'
import Providers from '@/components/privy/privy-provider'
import { VanillaLayout } from '@/components/ui/ui-vanilla-layout'

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
