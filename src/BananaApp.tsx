import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfirmationDialog } from './components/dialog/ConfirmationDialog'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { router } from './routes'
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
    <div>
      <RouterProvider router={router} />
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
    </div>
  )
}

export default BananaApp
