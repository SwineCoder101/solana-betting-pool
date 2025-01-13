import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClusterProvider } from '../components/cluster/cluster-data-access'
// import { SolanaProvider } from '../components/solana/solana-provider'
import { AppRoutes } from './app-routes'
import { SolanaPrivyProvider } from '@/components/solana/solana-privy-provider'
import { PrivyProvider } from '@privy-io/react-auth'
import Providers from '@/components/privy/privy-provider'
import VanillaLayout from '@/components/ui/ui-vanilla-layout'

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
      <VanillaLayout />
    </Providers>
  )
}
