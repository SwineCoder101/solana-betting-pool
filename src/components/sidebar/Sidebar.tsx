import { useCountdown } from '@/hooks/use-countdown'
import { ConnectedSolanaWallet } from '@privy-io/react-auth'
import { Dispatch, SetStateAction } from 'react'
import { UserBet } from '../../types'
import { BananaTime } from '../betting-chart/utils'
import FocusCoinBanner from './components/HotCoinBanner'
import LatestBetBanner from './components/LatestBetBanner'
import NewCoinBanner from './components/NewCoinBanner'
import YourBetsBanner from './components/YourBetsBanner'

interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
  embeddedWallet: ConnectedSolanaWallet | null
  startTime: BananaTime
}

export default function Sidebar({ userBets, setUserBets, embeddedWallet, startTime }: Props) {

  const startTimeNum = startTime.date.getTime();
  const endTimeNum = startTimeNum + 4 * 60 * 1000;

  const { data: countdown } = useCountdown({ startTime: startTimeNum, endTime: endTimeNum });

  return (
    <div className="flex flex-col gap-4  py-4">
      <span className="text-end text-3xl text-white pr-3">Session ends in: {countdown?.remainingSeconds ?? 0}s</span>
      <div className="flex flex-col w-[330px] h-fit border-2 border-t-black border-b-[#BABABA] border-l-black border-r-[#BABABA] bg-[#2C2C2C] ">
        <YourBetsBanner userBets={userBets} setUserBets={setUserBets} embeddedWallet={embeddedWallet} />
        <LatestBetBanner />
        <FocusCoinBanner />
        <img src="/assets/images/tv-banner.png" alt="TV Banner" className="w-full" />
        <NewCoinBanner />
      </div>
    </div>
  )
}
