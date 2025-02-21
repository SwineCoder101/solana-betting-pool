import { createBrowserRouter, Navigate, useOutletContext } from 'react-router-dom'
import Layout from './components/Layout'
import BettingPage from './pages/BettingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import LeaderboardPage2 from './pages/LeaderboardPage2'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import { UserBet } from './types'

// Route paths as constants for type-safe navigation
export const ROUTES = {
  HOME: '/betting',
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_2: '/leaderboard-2',
  ACCOUNT: '/account',
  ADMIN: '/admin',
} as const

function BettingPageWrapper() {
  const context = useOutletContext<{
    userBets: UserBet[]
    setUserBets: React.Dispatch<React.SetStateAction<UserBet[]>>
  }>()

  if (!context) {
    return <div>Loading...</div>
  }

  return <BettingPage/>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Navigate to={ROUTES.HOME} replace />,
      },
      {
        path: ROUTES.HOME,
        element: <BettingPageWrapper />,
      },
      {
        path: ROUTES.LEADERBOARD,
        element: <LeaderboardPage />,
      },
      {
        path: ROUTES.LEADERBOARD_2,
        element: <LeaderboardPage2 />,
      },
      {
        path: ROUTES.ACCOUNT,
        element: <AccountPage />,
      },
      {
        path: ROUTES.ADMIN,
        element: <AdminPage />,
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.HOME} replace />,
      },
    ],
  },
])
