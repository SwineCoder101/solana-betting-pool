import { useAllBets } from '@/hooks/queries'
import { usePrivyWalletChecker } from '@/hooks/use-privy-wallet-checker'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'

interface AccountStats {
  volume: number
  pnl: number
  maxTradeSize: number
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'Tokens' | 'Activity' | 'Orders'>('Tokens')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChain, setSelectedChain] = useState('All Chains')
  const [selectedCurrency, setSelectedCurrency] = useState('Current')
  const { embeddedWallet } = usePrivyWalletChecker()
  const { data: bets = [] } = useAllBets()
  const [solBalance, setSolBalance] = useState(0)
  const [usdBalance, setUsdBalance] = useState(0)
  const { balances} = useSolanaPrivyWallet()
  const SOL_PRICE_USD = 198.73

  useEffect(() => {
    const calculateStats = () => {
      if (!embeddedWallet?.address) return
      
      // Calculate total bet volume
      const totalBetVolume = bets.reduce((acc, bet) => acc + (bet.amount / LAMPORTS_PER_SOL), 0)
      
      // Get wallet balance from balances array
      const walletBalance = balances.find(b => b.address === embeddedWallet.address)
      if (walletBalance) {
        setSolBalance(walletBalance.balanceSol)
        setUsdBalance(walletBalance.balanceUsd)
      }

      // Update stats
      stats.volume = totalBetVolume
      stats.maxTradeSize = Math.max(...bets.map(bet => bet.amount / LAMPORTS_PER_SOL), 0)
    }

    calculateStats()
  }, [embeddedWallet?.address, bets, balances])

  const stats: AccountStats = {
    volume: 0.0,
    pnl: 0.0,
    maxTradeSize: 0.0,
  }

  return (
    <div className="min-h-screen bg-[#FDFAD1] text-black flex flex-col" style={{ fontFamily: 'Instrument Serif' }}>
      {/* Desktop Header */}
      <div className="hidden sm:flex flex-col items-center justify-center py-6 bg-[#FFFABC]">
        <h1 className="text-7xl mb-2">BananaZone</h1>
        <p className="text-gray-600 uppercase tracking-wider text-sm">Invite friends, get more bananas, go bananas</p>
      </div>

      {/* Time Period Selector */}
      <div className="flex justify-center bg-[#FFFABC] pb-4">
        <div className="flex">
          {['Today', 'This Week', 'This Month'].map((period) => (
            <button
              key={period}
              className={`px-4 text-[#222222] border text-lg
                ${period === 'Today' ? 'bg-[#FFF369] border-black' : 'border-transparent'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row flex-grow">
        {/* Left Side */}
        <div className="flex flex-col p-8 sm:w-1/2 sm:border-r border-black">
          {/* Stats Grid - Mobile only */}
          <div className="grid grid-cols-3 w-full max-w-2xl sm:hidden text-[#222222] mb-8">
            <div className="flex flex-col items-center">
              <span className="text-lg">Volume</span>
              <span className="">${(stats.volume * SOL_PRICE_USD).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">P&L</span>
              <span className="">${(stats.pnl * SOL_PRICE_USD).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">Max Trade Size</span>
              <span className="">${(stats.maxTradeSize * SOL_PRICE_USD).toFixed(2)}</span>
            </div>
          </div>

          {/* Main Balance Display */}
          <span className="text-7xl text-[#222222] mb-2">${usdBalance.toFixed(2)}</span>
          <span className="text-xl flex items-center gap-2 text-[#AAAAAA]">
            <img src="/assets/svg/arrow-bottom-right.svg" alt="Arrow bottom right" className="w-4 h-4" />
            {solBalance.toFixed(4)} SOL
          </span>

          <div className="flex gap-4 mt-8">
            <button className="flex-1 bg-[#FFF369] text-[#222222] py-1 rounded-full border border-black font-medium flex items-center justify-center gap-2">
              Send <img src="/assets/svg/arrow.svg" alt="Arrow" className="w-4 h-4" />
            </button>
            <button className="flex-1 bg-[#FFF369] text-[#222222] py-1 rounded-full border border-black font-medium flex items-center justify-center gap-2">
              Receive <img src="/assets/svg/arrow.svg" alt="Arrow" className="w-4 h-4 rotate-180" />
            </button>
            <button className="flex-1 bg-[#FFF369] text-[#222222] py-1 rounded-full border border-black font-medium">Buy</button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="border border-black p-4">
              <div className="text-lg">Volume</div>
              <div className="text-lg">${(stats.volume * SOL_PRICE_USD).toFixed(2)}</div>
            </div>
            <div className="border border-black p-4">
              <div className="text-lg">P&L</div>
              <div className="text-lg">${(stats.pnl * SOL_PRICE_USD).toFixed(2)}</div>
            </div>
            <div className="border border-black p-4">
              <div className="text-lg">Max Trade Size</div>
              <div className="text-lg">${(stats.maxTradeSize * SOL_PRICE_USD).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Activity Section */}
        <div className="sm:w-1/2">
          {/* Tab Navigation - Mobile only */}
          <div className="flex w-full sm:hidden">
            {(['Tokens', 'Activity', 'Orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-[#222222] text-2xl border-b flex-grow
                  ${activeTab === tab ? 'border-black' : 'border-[#918FA1]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex gap-4 p-4 border-b border-black">
            <button className="bg-[#FFF369] border border-black px-6 py-1">Tokens</button>
            <button className="border border-black px-6 py-1">Activity</button>
            <button className="border border-black px-6 py-1">Orders</button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex gap-4 p-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 border border-[#222222] bg-white text-[#222222] rounded-none placeholder-black focus:outline-none"
              />
              <img src="/assets/svg/magnifying-glass.svg" alt="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            </div>
            <select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)} className="h-10 px-4 border border-[#222222] bg-white text-[#222222]">
              <option>All Chains</option>
              <option>Ethereum</option>
              <option>Solana</option>
            </select>
            <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="h-10 px-4 border border-[#222222] bg-white text-[#222222]">
              <option>Current</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>

          {/* Activity List */}
          <div className="p-4">
            {bets.length > 0 ? (
              <div className="space-y-4">
                {bets.map((bet, index) => (
                  <div key={index} className="border border-black p-4">
                    <div className="flex justify-between">
                      <span>Bet Amount: {(bet.amount / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                      <span>${((bet.amount / LAMPORTS_PER_SOL) * SOL_PRICE_USD).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: {bet.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-16">
                <p className="text-xl">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
