import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes'
import ButtonOutline from '../buttons/ButtonOutline'
import Navigation from './Navigation'
import { LoginWalletButton } from '../privy/login-wallet-button'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { usePrivy } from '@privy-io/react-auth'

interface Props {
  darkMode?: boolean
}

export default function Header({ darkMode = false }: Props) {
  const navigate = useNavigate()
  const { isAdmin } = useAdminCheck()
  const { authenticated } = usePrivy()

  return (
    <div className={`w-full ${darkMode ? 'bg-black' : 'bg-[#FDFAD1]'} px-2.5 sticky top-0 z-10 border-b border-black sm:border-none`}>
      {/* Mobile header */}
      <div className="flex justify-between items-center sm:hidden py-2">
        {/* Left section with fixed width */}
        <button onClick={() => {}} className="flex items-center gap-1 w-1/3 cursor-pointer">
          <span onClick={() => {}} className="cursor-pointer shrink-0">
            <img src="/assets/images/penguin.png" alt="Profile" className="w-9 h-9 rounded-full" />
          </span>
          <span className={`text-xl truncate ${darkMode ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Instrument Serif' }} title="Panchain4">
            Panchain4
          </span>
        </button>

        {/* Center section with fixed position */}
        <button onClick={() => {}} className="w-1/3 flex justify-center cursor-pointer">
          <img src={darkMode ? '/assets/svg/qr-code-white.svg' : '/assets/svg/qr-code-black.svg'} alt="QR Code" className="w-6 h-6" />
        </button>

        {/* Right section with fixed width */}
        <div className="w-1/3 flex justify-end">
          <ButtonOutline title="Invite" onClick={() => {}}>
            <img src="/assets/images/bananas.png" alt="Banana" className="w-7 h-7 drop-shadow-lg" />
          </ButtonOutline>
        </div>
      </div>

      <div className={`hidden sm:flex justify-between items-center ${darkMode ? 'text-white' : ''}`}>
        {/* Left section with logo */}
        <div className="block relative mr-2">
          <h1 className="text-[50px] cursor-pointer" onClick={() => navigate(ROUTES.HOME)} style={{ fontFamily: 'Instrument Serif' }}>
            BananaZone
          </h1>
          <img src="/assets/images/bananas.png" alt="Banana" className="w-7 h-7 absolute left-[147px] top-[28px]" />
        </div>

        {/* Center section with icons */}
        <div className="hidden sm:block">
          <Navigation darkMode={darkMode} />
        </div>

        {/* Right section with wallet */}
        <div className="flex items-center gap-2">
          <ButtonOutline title="$1,211.32" onClick={() => {}}>
            <img src="/assets/images/bananas.png" alt="Banana" className="w-7 h-7 drop-shadow-lg" />
          </ButtonOutline>

          <LoginWalletButton />

          {isAdmin && (
            <button
              onClick={() => navigate(ROUTES.ADMIN)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                authenticated 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Admin
            </button>
          )}

          <button onClick={() => {}} className="p-2 bg-[#FFF369] rounded-full cursor-pointer">
            <img src="/assets/svg/trophy.svg" alt="Profile" className="w-5 h-5" />
          </button>

          <button onClick={() => navigate(ROUTES.ACCOUNT)} className="cursor-pointer">
            <img src="/assets/images/penguin.png" alt="Profile" className="w-9 h-9 rounded-full" />
          </button>
        </div>
      </div>
    </div>
  )
}
