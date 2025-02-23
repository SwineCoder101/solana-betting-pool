import { Outlet, useLocation } from 'react-router-dom'
import AppBar from './header/AppBar'
import { useState } from 'react'
import { UserBet } from '../types'
import AppHeader from './header/AppHeader'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { usePrivy } from '@privy-io/react-auth'

export default function Layout() {
  const {user} = usePrivy();
  const { authenticated } = usePrivy();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const location = useLocation()
  const isBettingPage = location.pathname === '/'

  // Liam can u help here?
  console.log("authenticated", authenticated, user?.wallet?.address)
  // Then show onboarding
  if (!hasCompletedOnboarding || !authenticated) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header darkMode={isBettingPage} /> */}
      <AppHeader />

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
