interface Props {
  coinName?: string
  onClick?: () => void
}

export default function HotCoinBanner({ coinName = '#GRIFFAIN', onClick }: Props) {
  return (
    <button
      className="relative w-full h-[100px] bg-gradient-to-b from-[#FDDE51] to-[#DE8749] overflow-hidden cursor-pointer border-2 border-[#222222] box-border"
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col text-black">
          <span className="text-3xl font-bold" style={{ fontFamily: 'Poppins' }}>
            HOT COIN
          </span>
          <div className="flex gap-2" style={{ fontFamily: 'Instrument Serif' }}>
            <span className="text-2xl leading-5 italic ">{coinName}</span>
            <span className="text-sm leading-4 mt-auto underline italic">VIEW CHART</span>
          </div>
        </div>
        <div className="relative">
          <img src="/assets/images/coin-flame.png" alt="Coin flame" className="relative h-[90px] w-[90px] object-contain bottom-0" />
          <img src="/assets/images/coin.png" alt="Hot coin" className="absolute h-[60px] w-[60px] object-contain -bottom-1 left-[50%] -translate-x-1/2 z-10" />
        </div>
      </div>
    </button>
  )
}
