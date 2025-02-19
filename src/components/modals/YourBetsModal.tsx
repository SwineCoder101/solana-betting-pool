import { useUserBetsStore } from '@/stores/useUserBetsStore'
import LatestBetBanner from '../sidebar/components/LatestBetBanner'
import YourBetsBanner from '../sidebar/components/YourBetsBanner'

export function YourBetsModal() {
  const { userBets, setUserBets } = useUserBetsStore()

  return (
    <div className="w-screen bg-[#2C2C2C]">
      <YourBetsBanner userBets={userBets} setUserBets={setUserBets} />
      <LatestBetBanner />
    </div>
  )
}
