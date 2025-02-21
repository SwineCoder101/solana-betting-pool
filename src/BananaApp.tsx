import { useState } from 'react'
import { ConfirmationDialog } from './components/dialog/ConfirmationDialog'
import AppBar from './components/header/AppBar'
import AppHeader from './components/header/AppHeader'
import { AppModal } from './components/modals/AppModal'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import BettingPage from './pages/BettingPage'
import { useConfirmationStore } from './stores/useConfirmationStore'

export function BananaApp() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const { isOpen, title, description, onConfirm, hideConfirmation } = useConfirmationStore()

  // useEffect(() => {
  //   if (hasCompletedOnboarding && wallets.some(w => w.type === "solana")) {
  //     setAppReady(true)
  //   }
  // }, [hasCompletedOnboarding, wallets])

  // if (!appReady && hasCompletedOnboarding) {
  //   return <div className="fixed inset-0 grid place-items-center bg-yellow-100">
  //     <p className="text-2xl animate-pulse">Finalizing wallet setup...</p>
  //   </div>
  // }

  // Then show onboarding
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />
  }

  // Only show main app content after both steps are completed
  return (
    <div className="bg-[#4F4F4F]">
      <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto">
        <AppHeader />
        <BettingPage />
        <div className="md:hidden bottom-0 left-0 right-0">
          <AppBar />
        </div>
        <ConfirmationDialog
          isOpen={isOpen}
          title={title}
          description={description}
          onConfirm={() => {
            onConfirm()
            hideConfirmation()
          }}
          onCancel={hideConfirmation}
        />
        <AppModal />
      </div>
    </div>
  )
}

export default BananaApp
