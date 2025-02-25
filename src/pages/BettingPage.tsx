import Sidebar from '@/components/sidebar/Sidebar'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet'
import { useUserBetsStore } from '@/stores/useUserBetsStore'
import BettingChart from '../components/betting-chart/BettingChart'
import { tokenPairs } from '@/data/data-constants'
import { getStartTime } from '@/components/betting-chart/utils'
import { useState } from 'react'

export default function BettingPage() {
  const { embeddedWallet } = useSolanaPrivyWallet();
  const { userBets, setUserBets } = useUserBetsStore();
  const [startTime, setStartTime] = useState(getStartTime())
  
  return (
    <div>
      <div className="flex gap-3.5 relative bg-[#2C2C2C] md:bg-[#4F4F4F]">
      <div className="flex flex-col w-full pb-20">
          {tokenPairs.filter((tkp) => tkp.competitionKey).map((tokenPair, index) => (
            <BettingChart
              key={tokenPair.code}
              tokenCode={tokenPair.code}
              tokenName={tokenPair.name}
              competitionKey={tokenPair.competitionKey}
              userBets={userBets}
              setUserBets={setUserBets}
              showLogo={tokenPair.showLogo}
              priceFeedId={tokenPair.priceFeedId}
              embeddedWallet={embeddedWallet}
              startTime={startTime}
              setStartTime={setStartTime}
              idx={index}
            />
          ))}
        </div>

        <div className="h-full hidden md:block sticky top-[75px]">
          <Sidebar userBets={userBets} setUserBets={setUserBets} embeddedWallet={embeddedWallet} startTime={startTime}/>
        </div>
      </div>
    </div>
  )
}
