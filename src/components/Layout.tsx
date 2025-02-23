import { Outlet,  useNavigate, useSearchParams } from 'react-router-dom'
import AppHeader from './header/AppHeader'
import AppBar from './header/AppBar'
import { useState } from 'react'
import { UserBet } from '../types'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { usePrivy } from '@privy-io/react-auth'
import { ROUTES } from '@/routes'

export default function Layout() {
  const {user} = usePrivy();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invite = searchParams.get("invite")
  const { authenticated } = usePrivy();

  const [userBets, setUserBets] = useState<UserBet[]>([])

  const onHandleCompleteOnboarding = (val: boolean) =>{
    console.log('complete onboarding', val);
  }
  // Liam can u help here?
  console.log("authenticated", authenticated, !user?.wallet?.address)
  // Then show onboarding if user is invited
  if (invite) {
    // if they don't have a wallet created
    if(!user?.wallet?.address || !authenticated ){
      return <OnboardingFlow onComplete={() => onHandleCompleteOnboarding(true)} />
    }
    if(user?.wallet?.address || !authenticated ){
      return <div className="yellow-shadow">You are on the Early Access waiting list</div>
    }
  }

  if (!authenticated){
    navigate(ROUTES.WTF)
  }

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
