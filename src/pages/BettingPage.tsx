import BettingChart from '../components/betting-chart/BettingChart'
import { MockData } from '../mockdata'
import { UserBet } from '../types'

const tokenPairs = [
  {
    code: 'ethusdt',
    name: 'Ethereum',
    showLogo: true,
  },
  {
    code: 'btcusdt',
    name: 'Bitcoin',
    showLogo: false,
  },
  {
    code: 'solusdt',
    name: 'Solana',
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
              competitionKey={MockData.competition.competitionKey}
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
