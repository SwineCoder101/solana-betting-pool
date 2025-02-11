import { ConfirmationDialog } from './components/dialog/ConfirmationDialog'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { useConfirmationStore } from './stores/useConfirmationStore'
import PasswordProtection from './components/PasswordProtection'
import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

export function BananaApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const { isOpen, title, description, onConfirm, hideConfirmation } = useConfirmationStore()

  // Show password protection first
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onCorrectPassword={() => {
          setIsAuthenticated(true)
        }}
      />
    )
  }

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
