import '../../styles/animations.css'

interface Props {
  coinName?: string
  price?: string
  percentChange?: string
  onClick?: () => void
}

export default function NewCoinBanner({ coinName = 'TRUMP11...', price = '$0.04837', percentChange = '1.331', onClick }: Props) {
  return (
    <button className="relative flex w-full h-[90px] bg-gradient-to-b from-[#333333] to-[#A4A4A4] overflow-hidden cursor-pointer" onClick={onClick}>
      <img src="/assets/images/new-star.png" alt="New banner" className="h-full w-[45%] object-contain star-animation" />

      <img src="/assets/images/banana-man.png" alt="Banana man" className="absolute bottom-0 right-0 h-[90%] object-contain" />
      <div className="grid items-center h-full z-10">
        <div className="flex flex-col gap-1">
          <span className="text-white text-sm text-start" style={{ fontFamily: 'Poppins' }}>
            PUMP SHITTER
          </span>

          <div className="flex gap-1" style={{ fontFamily: 'Instrument Serif' }}>
            <img src="/assets/images/waifu.png" alt="Coin icon" className="w-6 h-6 mt-0.5 rounded-full" />
            <div className="flex flex-col text-white">
              <span className=" text-start text-lg leading-4">{coinName}</span>
              <div className="flex items-center gap-1">
                <span className="">{price}</span>
                <div className="flex items-center">
                  <span className="text-green-400">{percentChange}</span>
                  <img src="/assets/svg/arrow-up-slim.svg" alt="Arrow up" className="w-4 h-4" />
                </div>
                <span className="text-sm">1min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
