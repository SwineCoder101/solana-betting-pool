import { useState } from 'react'
import { useModalStore } from '@/stores/modalStore'
import { Win95Modal } from './Win95Modal'
import FocusCoinBanner from '../sidebar/components/HotCoinBanner'

interface Token {
  icon: string
  name: string
  price: number
  volume: number
  change: number
  isFavorite: boolean
}

export function SearchCoinsModal() {
  const { closeModal } = useModalStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'Trending' | 'Volume' | 'Newest' | '24h'>('Trending')

  const tokens: Token[] = [
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
  ]

  const filteredTokens = tokens.filter((token) => token.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Win95Modal title="LEADERBOARDS" onClose={closeModal}>
      <div className="bg-[#FDFAD1] text-black flex flex-col h-full relative">
        <h1 className="text-6xl md:text-8xl text-center text-[#1E1A33]">COINS</h1>

        <img src="/assets/svg/solana-banana.svg" className="absolute top-1 left-3 md:w-20" />

        <div className="max-w-xl w-full mx-auto mb-6 flex flex-col gap-4 p-4 overflow-y-hidden">
          {/* Search Bar */}
          <div className="relative w-4/5 mx-auto mb-1 md:mb-2">
            <input
              type="text"
              placeholder="Search for coins"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1 pl-10 md:p-3 md:pl-12 border-2 border-black bg-[#FFF369] text-[#222222] rounded-none placeholder-black focus:outline-none"
            />
            <img src="/assets/svg/magnifying-glass.svg" alt="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          </div>

          {/* Filter Buttons */}
          <div className="flex w-full justify-center gap-2 md:gap-4 mb-2 md:mb-6">
            {(['Trending', 'Volume', 'Newest'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2 py-0 rounded-full text-[#222222] text-xl border-2 font-medium cursor-pointer ${
                  activeFilter === filter ? 'bg-[#FFCF00] border-black' : 'bg-[#FFEF8D] text-black border-[#918FA1]'
                } `}
              >
                {filter}
              </button>
            ))}
            <button
              onClick={() => setActiveFilter('24h')}
              className={`px-2 py-0 rounded-full text-[#222222] text-xl border-2 font-medium ml-auto cursor-pointer ${
                activeFilter === '24h' ? 'bg-[#FFCF00] border-black' : 'bg-[#FFEF8D] text-black border-[#918FA1]'
              } `}
            >
              24h
            </button>
          </div>

          {/* Token List */}
          <div className="relative flex-1 overflow-y-scroll">
            <div className="flex flex-col">
              {filteredTokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between py-1 md:py-2">
                  <div className="flex items-center">
                    <img src={token.icon} alt={token.name} className="w-6 h-6 md:w-8 md:h-8 rounded-full mr-3" />
                    <span className="font-medium text-xl md:text-3xl mr-2">{token.name}</span>
                    {token.isFavorite && <img src="/assets/svg/gold-star.svg" alt="Favorite" className="w-5 h-5" />}
                  </div>
                  <div className="flex items-center gap-2 md:gap-8 text-sm md:text-lg">
                    <span className="">${token.price.toFixed(5)}</span>
                    <span className="">${token.volume}m</span>
                    <div className="flex items-center">
                      <span className={` ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change >= 0 ? '+' : ''}
                        {token.change}%
                      </span>
                      <img src={token.change >= 0 ? '/assets/svg/arrow-up.svg' : '/assets/svg/arrow-down.svg'} alt="Arrow" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Gradient Overlay */}
            <div
              className="sticky bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,251,231,0) 0%, #FDFAD1 100%)',
              }}
            />
          </div>
        </div>
        {/* Bottom banner */}
        <div className="p-4 pb-16 sm:pb-4">
          <FocusCoinBanner />
        </div>
      </div>
    </Win95Modal>
  )
}
