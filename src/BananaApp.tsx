import Marquee from "react-fast-marquee"
import { RouterProvider } from 'react-router-dom'
import { ConfirmationDialog } from './components/dialog/ConfirmationDialog'
import { AppModal } from './components/modals/AppModal'
import { router } from './routes'
import { useConfirmationStore } from './stores/useConfirmationStore'

export function BananaApp() {

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
  // if (!hasCompletedOnboarding) {
  //   navigate(ROUTES.ONBOARDING);
  //   // return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />
  // }

  // Only show main app content after both steps are completed
  return (
    <div >
 {/* <div className="bg-[#4F4F4F]> */}
      <Marquee className="marquee">
        More invites means more bananas get ready to go bananas
        More invites means more bananas get ready to go bananas
        More invites means more bananas get ready to go bananas
        More invites means more bananas get ready to go bananas
        More invites means more bananas get ready to go bananas
      </Marquee>
     
     
      <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto">
        {/* <BettingPage /> */}
        <RouterProvider router={router} />
        
        {/* <div className="md:hidden bottom-0 left-0 right-0">
          <AppBar />
        </div> */}

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
