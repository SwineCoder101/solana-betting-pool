import { useUserBetsStore } from '@/stores/useUserBetsStore'
import LatestBetBanner from '../sidebar/components/LatestBetBanner'
import YourBetsBanner from '../sidebar/components/YourBetsBanner'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet';

export function YourBetsModal() {
  const { userBets, setUserBets } = useUserBetsStore();
  const { embeddedWallet } = useSolanaPrivyWallet();
  return (
    <div className="w-screen bg-[#2C2C2C]">
      <YourBetsBanner userBets={userBets} setUserBets={setUserBets} embeddedWallet={embeddedWallet} />
      <LatestBetBanner />
    </div>
  )
}
