import { Outlet, useLocation } from 'react-router-dom'
import Header from './header/Header'
import AppBar from './header/AppBar'
import { useState } from 'react'
import { UserBet } from '../types'

export default function Layout() {
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const location = useLocation()
  const isBettingPage = location.pathname === '/betting'

  return (
    <div className="min-h-screen flex flex-col">
      <Header darkMode={isBettingPage} />

      <main className="flex flex-col overflow-auto pb-[60px] sm:pb-0">
        <Outlet context={{ userBets, setUserBets }} />
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0">
        <AppBar />
      </div>
    </div>
  )
}
