import { useNavigate } from 'react-router'
import DesktopHeader from './components/DesktopHeader'
import MobileHeader from './components/MobileHeader'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { usePrivy } from '@privy-io/react-auth'

export default function AppHeader() {
  const navigate = useNavigate()
  const { isAdmin } = useAdminCheck()
  const { authenticated } = usePrivy()

  return (
    <>
      {/* TODO: Add connnect wallet button with router */}
      <DesktopHeader isAdmin={isAdmin} authenticated={authenticated} navigate={navigate}/>
      <MobileHeader isAdmin={isAdmin} authenticated={authenticated} navigate={navigate}/>
      {/* <ErrorBoundary fallback={<div>Error</div>}>
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
      </ErrorBoundary> */}

    </>
  )
}