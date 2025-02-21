import SpinningBanner from '../sidebar/components/SpinningBanner'

interface BananaUser {
  username: string
  community: string
  avatar: string
  time?: string
  rank?: number
  score?: number
  orangeBackground?: boolean
  greenBackground?: boolean
}

const greenBananas: BananaUser[] = [
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    time: 'JUST NOW',
    orangeBackground: true,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    time: '5 MINS',
  },
]

const topBananas: BananaUser[] = [
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: true,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: false,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: false,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: false,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: false,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
  {
    username: '@PANCHAIN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 1,
    score: 1231111,
    greenBackground: false,
  },
  {
    username: '@WEDGEMRJJAN',
    community: "@007Kakar0t's Banana Gang",
    avatar: '/assets/images/penguin.png',
    rank: 2,
    score: 894321,
  },
]

function BananaListItem({
  user,
  showTime,
  showRank,
  orangeBackground = false,
  greenBackground = false,
}: {
  user: BananaUser
  showTime?: boolean
  showRank?: boolean
  orangeBackground?: boolean
  greenBackground?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 bg-gradient-to-b border-2 border-black shadow-2xl ${orangeBackground ? 'from-[#FDDE51] to-[#DE8749]' : ''} ${
        greenBackground ? 'bg-[#A2EF56]' : 'bg-[#D7D7D6]'
      }`}
      style={{ fontFamily: 'Poppins' }}
    >
      <div className="flex items-center gap-3">
        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-bold text-black">{user.username}</div>
          <div className="text-sm text-black/80 italic" style={{ fontFamily: 'Instrument Serif' }}>
            {user.community}
          </div>
        </div>
      </div>
      <div className="font-bold text-black">
        {showTime && user.time}
        {showRank && (
          <div className="text-right">
            <div>{user.rank === 1 ? '1ST' : `${user.rank}TH`}</div>
            <div>{user.score?.toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function LeaderboardsModal() {
  return (
    <div className="w-screen md:max-w-[600px] mx-auto bg-[#2C2C2C] h-[calc(100dvh_-_92px)] md:h-[80vh] overflow-hidden">
      <SpinningBanner text="READY TO GO BANANAS READY TO GO BANANAS READY TO GO BANANAS" />
      <div className="flex flex-col gap-4 relative p-4 h-full">
        <div className="flex flex-col gap-4 h-full overflow-auto pb-24">
          <div className="mt-4">
            <h2 className="text-[#A3FF12] text-2xl font-bold mb-3 sticky top-0 bg-[#2C2C2C]">GREEN BANANAS</h2>
            <div className="flex flex-col gap-2 h-full">
              {greenBananas.map((user, i) => (
                <BananaListItem key={i} user={user} showTime orangeBackground={user.orangeBackground} greenBackground={user.greenBackground} />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-[#A3FF12] text-2xl font-bold mb-3 sticky top-0 bg-[#2C2C2C]">TOP BANANAS</h2>
            <div className="flex flex-col gap-2 h-full">
              {topBananas.map((user, i) => (
                <BananaListItem key={i} user={user} showRank orangeBackground={user.orangeBackground} greenBackground={user.greenBackground} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
