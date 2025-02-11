import { useState } from 'react'

interface LeaderboardUser {
  id: number
  rank: number
  avatar: string
  username: string
  amount: number
  isCurrentUser?: boolean
}

export default function LeaderboardPage2() {
  const [activeFilter, setActiveFilter] = useState<'Earnings' | 'Invites' | 'Top Team'>('Earnings')

  const topUsers: LeaderboardUser[] = [
    {
      id: 2,
      rank: 2,
      avatar: '/assets/images/profile-2.png',
      username: 'CryptoQueen',
      amount: 654,
    },
    {
      id: 1,
      rank: 1,
      avatar: '/assets/images/profile-1.jpg',
      username: 'NotThisIsJohn',
      amount: 789,
    },
    {
      id: 3,
      rank: 3,
      avatar: '/assets/images/profile-3.png',
      username: 'BananaKing',
      amount: 521,
    },
  ]

  const leaderboardUsers: LeaderboardUser[] = [
    {
      id: 4,
      rank: 4,
      avatar: '/assets/images/penguin.png',
      username: 'Marsha Fisher',
      amount: 789,
    },
    {
      id: 5,
      rank: 5,
      avatar: '/assets/images/penguin.png',
      username: 'Juanita Cori...',
      amount: 563,
    },
    {
      id: 124,
      rank: 124,
      avatar: '/assets/images/penguin.png',
      username: 'You',
      amount: 12,
      isCurrentUser: true,
    },
    {
      id: 7,
      rank: 7,
      avatar: '/assets/images/penguin.png',
      username: 'Tamara Sch...',
      amount: 450,
    },
  ]

  const rankGradientStyle = {
    background: 'linear-gradient(-35deg, #8C421D, #FBE67B, #F7D14E, #D4A041, #8C421D)',
  }

  // Create a wrapper component for gradient border
  const GradientBorderWrapper = ({ children, size }: { children: React.ReactNode; size: string }) => (
    <div
      className={`rounded-full ${size}`}
      style={{
        padding: '6px',
        background: 'linear-gradient(-35deg, #8C421D, #FBE67B, #F7D14E, #D4A041, #8C421D)',
      }}
    >
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFAD1] text-black flex flex-col">
      <h1 className="text-2xl sm:text-8xl text-center font-serif mb-8 text-[#1E1A33] bg-[#FFFABC] p-6" style={{ fontFamily: 'Instrument Serif' }}>
        BANANABOARD
      </h1>

      <div className="max-w-2xl mx-auto w-full px-4 mb-6 flex flex-col flex-grow">
        {/* Top 3 Users */}
        <div className="flex justify-center items-end gap-2 sm:gap-8 mb-16 sm:mb-24 mt-24 sm:mt-40 relative" style={{ fontFamily: 'Instrument Serif' }}>
          {topUsers.map((user) => (
            <div key={user.id} className={`relative flex flex-col items-center gap-2 ${user.rank === 1 ? '-translate-y-12' : ''}`}>
              <GradientBorderWrapper size={user.rank === 1 ? 'w-32 h-32 sm:w-52 sm:h-52' : 'w-24 h-24 sm:w-46 sm:h-46'}>
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              </GradientBorderWrapper>
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-3 sm:-bottom-5 w-8 h-8 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-4xl rounded-full"
                style={rankGradientStyle}
              >
                {user.rank}
              </div>
              {user.rank === 1 && (
                <img
                  src="/assets/images/crown.png"
                  alt="Crown"
                  className="absolute -top-[70px] sm:-top-[110px] left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-36 sm:h-36 z-10"
                />
              )}
              <span className="text-lg sm:text-2xl absolute -bottom-10 sm:-bottom-16 font-bold" style={{ fontFamily: 'Poppins' }}>
                ${user.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {(['Earnings', 'Invites', 'Top Team'] as const).map((filter) => (
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
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2 max-w-lg mx-auto w-full relative flex-grow overflow-auto">
          {leaderboardUsers.map((user) => (
            <div key={user.id} className={`flex items-center justify-between p-4 rounded-lg ${user.id % 2 === 0 ? 'bg-[#FDC214]' : ''}`} style={{ fontFamily: 'Instrument Serif' }}>
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-bold text-xl" style={{ fontFamily: 'Poppins' }}>
                  {user.rank}
                </span>
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                <span className="font-medium">{user.username}</span>
              </div>
              <span className="text-2xl">${user.amount}</span>
            </div>
          ))}

          {/* Gradient Fade Effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(253,250,209,0) 0%, #FDFAD1 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
