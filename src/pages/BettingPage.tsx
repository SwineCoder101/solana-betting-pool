import BettingChart from '../components/betting-chart/BettingChart'
import { UserBet } from '../types'

const tokenPairs = [
  {
    code: 'ethusdt',
    name: 'Ethereum',
    competitionKey: '2CGu5SqefkCCMjfXKiJVXdmDni7AdL2qwFVuVxA954gH',
    showLogo: true,
  },
  {
    code: 'btcusdt',
    name: 'Bitcoin',
    competitionKey: 'GThEtjbFVPQFU8cZwU3839vSCpXK8WKrSnTuP6DzSgJR',
    showLogo: false,
  },
  {
    code: 'solusdt',
    name: 'Solana',
    competitionKey: 'CnW86qW2P9TEuMNHXq4ad7ZHw4xe2znSBcpC3RrrpiJ7',
    showLogo: false,
  },
]

interface Props {
  userBets: UserBet[]
  setUserBets: React.Dispatch<React.SetStateAction<UserBet[]>>
}

export default function BettingPage({ userBets, setUserBets }: Props) {
  return (
    <div>
      <div className="flex gap-3.5 relative bg-[#2C2C2C]">
        <div className="flex flex-col w-full pb-20">
          {tokenPairs.map((tokenPair) => (
            <BettingChart
              key={tokenPair.code}
              tokenCode={tokenPair.code}
              tokenName={tokenPair.name}
              competitionKey={tokenPair.competitionKey}
              userBets={userBets}
              setUserBets={setUserBets}
              showLogo={tokenPair.showLogo}
            />
          ))}
        </div>

        {/* <div className="sticky top-[80px] h-full">
          <Sidebar userBets={userBets} setUserBets={setUserBets} />
        </div> */}
      </div>
    </div>
  )
}
