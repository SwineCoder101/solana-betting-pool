import LatestBetBanner from './components/LatestBetBanner'
import YourBetsBanner from './components/YourBetsBanner'
import { UserBet } from '../../types'
import { Dispatch } from 'react'
import { SetStateAction } from 'react'
import FocusCoinBanner from './components/HotCoinBanner'
import NewCoinBanner from './components/NewCoinBanner'
import { ConnectedSolanaWallet } from '@privy-io/react-auth'

interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
  embeddedWallet: ConnectedSolanaWallet | null
}

export default function Sidebar({ userBets, setUserBets, embeddedWallet }: Props) {
  return (
    <div className="flex flex-col gap-4  py-4">
      <span className="text-end text-3xl text-white pr-3">Session ends in: 12s</span>
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
