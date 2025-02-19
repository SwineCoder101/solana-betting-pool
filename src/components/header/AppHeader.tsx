import DesktopHeader from './components/DesktopHeader'
import MobileHeader from './components/MobileHeader'

export default function AppHeader() {
  // const navigate = useNavigate()
  // const { isAdmin } = useAdminCheck()
  // const { authenticated } = usePrivy()

  return (
    <>
      {/* TODO: Add connnect wallet button with router */}
      <DesktopHeader />
      <MobileHeader />
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