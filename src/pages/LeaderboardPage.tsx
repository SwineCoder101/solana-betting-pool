import { useState } from 'react'

interface Token {
  icon: string
  name: string
  price: number
  volume: number
  change: number
  isFavorite: boolean
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'Trending' | 'Volume' | 'Newest' | '24h'>('Trending')

  const tokens: Token[] = [
    { icon: '/assets/images/waifu.png', name: 'WAIFU', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: true },
    { icon: '/assets/images/waifu.png', name: 'SOL', price: 0.04837, volume: 2.4, change: -3.1, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'USDC', price: 0.04837, volume: 2.4, change: 67, isFavorite: false },
    { icon: '/assets/images/waifu.png', name: 'FARTCOIN', price: 0.04837, volume: 2.4, change: 1.33, isFavorite: false },
  ]

  const filteredTokens = tokens.filter((token) => token.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-screen bg-[#FDFAD1] text-black flex flex-col">
      <h1 className="text-8xl text-center font-serif mb-8 hidden sm:block text-[#1E1A33] bg-[#FFFABC] p-6" style={{ fontFamily: 'Instrument Serif' }}>
        BANANABOARD
      </h1>

      <div className="max-w-xl w-full mx-auto mb-6 flex flex-col gap-4 p-4 flex-1" style={{ fontFamily: 'Instrument Serif' }}>
        {/* Search Bar */}
        <div className="relative mb-1 sm:mb-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1 pl-10 sm:p-3 sm:pl-12 border-2 border-black bg-[#FFF369] text-[#222222] rounded-none placeholder-black focus:outline-none"
          />
          <img src="/assets/svg/magnifying-glass.svg" alt="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" />
        </div>

        {/* Filter Buttons */}
        <div className="flex w-full justify-center gap-2 sm:gap-4 mb-2 sm:mb-6">
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
        <div className="relative flex-1">
          <div className="flex flex-col h-full overflow-y-auto">
            {filteredTokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between py-1 sm:py-2">
                <div className="flex items-center">
                  <img src={token.icon} alt={token.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-3" />
                  <span className="font-medium text-xl sm:text-3xl mr-2">{token.name}</span>
                  {token.isFavorite && <img src="/assets/svg/gold-star.svg" alt="Favorite" className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-2 sm:gap-8 text-sm sm:text-lg">
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
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,251,231,0) 0%, #FFFBE7 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
