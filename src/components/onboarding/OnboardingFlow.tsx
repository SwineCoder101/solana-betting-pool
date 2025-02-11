import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { OldButton } from '../buttons/OldButton'
import { LoginWalletButton } from '../privy/login-wallet-button'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet'

interface OnboardingFlowProps {
  onComplete: () => void
}

const MOBILE_BANANA_POSITIONS = [
  { left: '5%', top: '5%', rotate: 45, scale: 1, size: 120 },
  { left: '80%', top: '10%', rotate: -30, scale: 0.9, size: 135 },
  { left: '20%', top: '30%', rotate: 15, scale: 1.1, size: 150 },
  { left: '30%', top: '15%', rotate: -80, scale: 0.8, size: 150 },
  { left: '70%', top: '35%', rotate: 60, scale: 1, size: 125 },
  { left: '5%', top: '60%', rotate: -15, scale: 0.95, size: 140 },
  { left: '85%', top: '65%', rotate: 25, scale: 1.05, size: 130 },
  { left: '45%', top: '75%', rotate: -45, scale: 1, size: 145 },
  { left: '15%', top: '85%', rotate: 30, scale: 0.9, size: 120 },
]

const DESKTOP_BANANA_POSITIONS = [
  { left: '10%', top: '5%', rotate: 45, scale: 1, size: 120 },
  { left: '80%', top: '10%', rotate: -30, scale: 0.9, size: 135 },
  { left: '20%', top: '30%', rotate: 15, scale: 1.1, size: 150 },
  { left: '70%', top: '35%', rotate: 60, scale: 1, size: 125 },
  { left: '5%', top: '60%', rotate: -15, scale: 0.95, size: 140 },
  { left: '85%', top: '65%', rotate: 25, scale: 1.05, size: 130 },
  { left: '45%', top: '75%', rotate: -45, scale: 1, size: 145 },
  { left: '15%', top: '85%', rotate: 30, scale: 0.9, size: 120 },
  { left: '75%', top: '90%', rotate: -20, scale: 1.1, size: 150 },
  { left: '40%', top: '15%', rotate: 75, scale: 1.2, size: 135 },
  { left: '90%', top: '45%', rotate: -60, scale: 0.85, size: 125 },
  { left: '30%', top: '55%', rotate: 20, scale: 1.15, size: 145 },
  { left: '60%', top: '85%', rotate: -35, scale: 0.95, size: 130 },
  { left: '25%', top: '70%', rotate: 50, scale: 1.1, size: 140 },
  { left: '50%', top: '40%', rotate: -25, scale: 1, size: 120 },
  { left: '95%', top: '25%', rotate: 40, scale: 0.9, size: 150 },
  { left: '35%', top: '95%', rotate: -50, scale: 1.05, size: 135 },
  { left: '65%', top: '5%', rotate: 35, scale: 1.1, size: 125 },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768)
  const { createWallet} = useSolanaPrivyWallet();

  const { authenticated } = usePrivy();
  // const { login } = useLogin();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCreateWallet = async () => {
    try {
        await createWallet();
        setStep(2);
    } catch (error) {
        console.error("Error creating wallet:", error);
    }
};

  const steps = [
    {
      title: 'Welcome BananaZone',
      content: (
        <div className="relative w-full h-full grid place-items-center">
          <img src="/assets/images/onboarding-step-1-background.png" alt="Welcome" className="absolute inset-0 w-full h-full object-cover" />
          <img src="/assets/images/onboarding-step-1-foreground.png" alt="Welcome" className="absolute bottom-0 w-full h-1/2 object-cover z-10" />
          <div className="flex flex-col justify-center items-center z-10 gap-5">
            <div className="flex flex-col text-white text-center" style={{ fontFamily: 'Instrument Serif' }}>
              <p className="text-6xl [text-shadow:2px_2px_5px_rgba(0,0,0,0.7)] -mb-2">Welcome</p>
              <p className="text-xl [text-shadow:2px_2px_5px_rgba(0,0,0,0.7)] -mb-6">TO</p>
              <p className="text-6xl [text-shadow:2px_2px_5px_rgba(0,0,0,0.7)]">BananaZone</p>
            </div>
            <OldButton onClick={() => setStep(1)} className="w-48 h-12 bg-[#FFCF00] cursor-pointer" fullWidth style={{ fontFamily: 'Instrument Serif', fontSize: '24px' }}>
              PLAY
            </OldButton>
          </div>
        </div>
      ),
      background: '',
    },
    {
      title: 'Create Your Wallet',
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-8 transition-all duration-300 transform">
          {authenticated ? (
            <>
              <button onClick={() => handleCreateWallet()} className="cursor-pointer">
                <img src="/assets/images/onboarding-step-2-foreground.png" alt="Wallet" className="w-58" />
              </button>
              <div className="flex flex-col text-center text-[#222222]">
                <p className="text-5xl text-center font-serif" style={{ fontFamily: 'Instrument Serif' }}>
                  Click the icon to create <br /> your banana wallet
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <img src="/assets/images/onboarding-step-2-foreground.png" alt="Wallet" className="w-58 opacity-50" />
              <div className="flex flex-col text-center text-[#222222] gap-6">
                <p className="text-5xl text-center font-serif" style={{ fontFamily: 'Instrument Serif' }}>
                  Connect your wallet first
                </p>
                <LoginWalletButton className="text-2xl" />
              </div>
            </div>
          )}
        </div>
      ),
      background: 'bg-[#D7D7D6]',
    },
    {
      title: 'Done!',
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-8 transition-all duration-300 transform">
          <button onClick={() => setStep(3)} className="cursor-pointer">
            <img src="/assets/images/onboarding-step-3-foreground.png" alt="Wallet" className="w-72" />
          </button>
          <p className="text-5xl text-center font-serif mb-0 text-[#222222]" style={{ fontFamily: 'Instrument Serif' }}>
            Done!
          </p>
        </div>
      ),
      background: 'bg-[#FFFBE6]',
    },
    {
      title: "Let's Go!",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-8 transition-all duration-300 transform">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {(isDesktop ? DESKTOP_BANANA_POSITIONS : MOBILE_BANANA_POSITIONS).map((pos, i) => (
                <img
                  key={i}
                  src="/assets/svg/banana-pixelated.svg"
                  alt="Banana"
                  className="absolute"
                  style={{
                    width: `${pos.size}px`,
                    height: `${pos.size}px`,
                    left: pos.left,
                    top: pos.top,
                    transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
                  }}
                />
              ))}
            </div>
            <div className="relative flex flex-col items-center justify-center h-full gap-4">
              <h2
                className="text-5xl font-bold text-center text-black [text-shadow:2px_2px_0_rgb(252_255_63),_-2px_-2px_0_rgb(252_255_63),_2px_-2px_0_rgb(252_255_63),_-2px_2px_0_rgb(252_255_63),_2px_2px_5px_rgba(0,0,0,0.7)]"
                style={{ fontFamily: 'Poppins' }}
              >
                NOW GO <br />
                BANANAS!
              </h2>
              <div className="flex flex-col gap-2">
                <OldButton onClick={onComplete} className="w-48 h-12 bg-[#F2FA02] cursor-pointer" style={{ fontFamily: 'Instrument Serif', fontSize: '24px' }} fullWidth>
                  PLAY LIVE
                </OldButton>
                <OldButton onClick={onComplete} className="w-48 h-12 cursor-pointer" style={{ fontFamily: 'Instrument Serif', fontSize: '24px' }} fullWidth>
                  OR TRY DEMO PLAY
                </OldButton>
              </div>
            </div>
          </div>
        </div>
      ),
      background: 'bg-[#FDFAD1]',
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`w-full h-full ${currentStep.background} text-black transition-all duration-300 ease-in-out transform
          ${step === 0 ? 'translate-x-0' : step > 0 ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="w-full h-full">{currentStep.content}</div>
      </div>
    </div>
  )
}
