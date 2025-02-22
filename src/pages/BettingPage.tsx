import Sidebar from '@/components/sidebar/Sidebar'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet'
import { useUserBetsStore } from '@/stores/useUserBetsStore'
import BettingChart from '../components/betting-chart/BettingChart'
import { useState } from 'react'

const tokenPairs = [
  {
    code: 'ethusdt',
    name: 'Ethereum',
    competitionKey: '2CGu5SqefkCCMjfXKiJVXdmDni7AdL2qwFVuVxA954gH',
    priceFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    showLogo: true,
  },
  {
    code: 'btcusdt',
    name: 'Bitcoin',
    competitionKey: 'GThEtjbFVPQFU8cZwU3839vSCpXK8WKrSnTuP6DzSgJR',
    priceFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    showLogo: false,
  },
  {
    code: 'solusdt',
    name: 'Solana',
    competitionKey: 'CnW86qW2P9TEuMNHXq4ad7ZHw4xe2znSBcpC3RrrpiJ7',
    priceFeedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    showLogo: false,
  },
]

export default function BettingPage() {
  const { embeddedWallet } = useSolanaPrivyWallet();
  const { userBets, setUserBets } = useUserBetsStore()

  
  return (
    <div>
      <div className="flex gap-3.5 relative bg-[#2C2C2C] md:bg-[#4F4F4F]">
      <div className="flex flex-col w-full pb-20">
          {tokenPairs.map((tokenPair, index) => (
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
              idx={index}
            />
          ))}
        </div>

        <div className="h-full hidden md:block sticky top-[75px]">
          <Sidebar userBets={userBets} setUserBets={setUserBets} />
        </div>
      </div>
    </div>
  )
}
