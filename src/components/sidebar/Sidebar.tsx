import LatestBetBanner from './components/LatestBetBanner'
import YourBetsBanner from './components/YourBetsBanner'
import { UserBet } from '../../types'
import { Dispatch } from 'react'
import { SetStateAction } from 'react'

interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
}

export default function Sidebar({ userBets, setUserBets }: Props) {
  return (
    <div className="flex flex-col gap-4 pt-7.5">
      <span className="text-end text-3xl">SESSION ENDS IN: 12s</span>

      <div className="flex flex-col w-[330px] h-fit border-2 border-t-black border-b-[#BABABA] border-l-black border-r-[#BABABA] bg-[#2C2C2C] ">
        <YourBetsBanner userBets={userBets} setUserBets={setUserBets} />
        <LatestBetBanner />
        <img src="/assets/images/focus-coin-banner.png" alt="Focus coin banner" className="w-full" />
        <img src="/assets/images/tv-banner.png" alt="TV Banner" className="w-full" />
        <img src="/assets/images/new-banner.png" alt="New banner" className="w-full" />
      </div>
    </div>
  )
}
