import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { UserBet } from '../types'
import AppBar from './header/AppBar'
import AppHeader from './header/AppHeader'
import { OnboardingFlow } from './onboarding/OnboardingFlow'

export default function Layout() {
  const {user, authenticated} = usePrivy();

  //TODO: Re-enable invite logic when we have completed testing solana integrations
  // const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  // const invite = searchParams.get("invite")

  const [userBets, setUserBets] = useState<UserBet[]>([])

  const onHandleCompleteOnboarding = (val: boolean) =>{
    console.log('complete onboarding', val);
  }
  // Then show onboarding if user is invited
  // if (invite) {
    // if they don't have a wallet created
    if(!user?.wallet?.address || !authenticated ){
      return <OnboardingFlow onComplete={() => onHandleCompleteOnboarding(true)} />
    }
    if(!user?.wallet?.address || !authenticated ){
      return <div className="yellow-shadow">You are on the Early Access waiting list</div>
    }
  // }

  // if (!authenticated){
  //   navigate(ROUTES.WTF)
  // }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header darkMode={isBettingPage} /> */}
      {authenticated && <AppHeader />}

      {/* <main className="flex flex-col overflow-auto pb-[60px] sm:pb-0"> */}
        <Outlet context={{ userBets, setUserBets }} />
      {/* </main> */}

      {/* <div className="sm:hidden fixed bottom-0 left-0 right-0">
        <AppBar />
      </div> */}
      
      <div className="md:hidden bottom-0 left-0 right-0">
        <AppBar />
      </div>


    </div>
  )
}
