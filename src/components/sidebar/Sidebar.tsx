import LatestBetBanner from './components/LatestBetBanner'
import YourBetsBanner from './components/YourBetsBanner'
import { UserBet } from '../../types'
import { Dispatch } from 'react'
import { SetStateAction } from 'react'
import FocusCoinBanner from './components/HotCoinBanner'
import NewCoinBanner from './components/NewCoinBanner'

interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
}

export default function Sidebar({ userBets, setUserBets }: Props) {
  return (
    <div className="flex flex-col gap-4 pt-7.5">
      <span className="text-end text-3xl text-white">SESSION ENDS IN: 12s</span>

      <div className="flex flex-col w-[330px] h-fit border-2 border-t-black border-b-[#BABABA] border-l-black border-r-[#BABABA] bg-[#2C2C2C] ">
        <YourBetsBanner userBets={userBets} setUserBets={setUserBets} />
        <LatestBetBanner />
        <FocusCoinBanner />
        <img src="/assets/images/tv-banner.png" alt="TV Banner" className="w-full" />
        <NewCoinBanner />
      </div>
    </div>
  )
}
