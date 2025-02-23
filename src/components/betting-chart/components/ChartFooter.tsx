import { AnimatedStars } from '../../animations/AnimatedStars'
import FocusCoinBanner from '../../sidebar/components/HotCoinBanner'
import './chart-styles.css'

type Props = {
  tokenName: string
  idx: number
}

export default function ChartFooter({ tokenName, idx }: Props) {
  return (
    <>
      <div className="hidden md:flex items-center justify-between space-between gap-8 w-full mt-12">
        <div className="relative bg-gradient-to-b from-[#bdf55a] to-[#fff369] shadow-lg py-2 px-10 w-full">
          <span className="yellow-shadow ">
            MORE INVITES
            <br />
            MEANS...
          </span>
          <img src="/assets/images/bananas-banner-people.png" alt="banana" className="banana-img" />
          <img src="/assets/images/bananas-banner-star.png" alt="banana" className="banana-star" />
          <img src="/assets/images/bananas-banner-more-bananas.png" alt="banana" className="banana-more-bananas" />
        </div>
        <div className="relative w-40 h-24 shrink-0">
          <img src="/assets/images/claim-banner-banana.png" alt={tokenName} className="absolute bottom-0 right-0 w-24 h-auto z-10" />
          <div className="absolute bottom-8 right-5 flex items-center">
            <img src="/assets/images/claim-banner-bubble.png" alt="speech bubble" className="relative w-32 h-auto" />
            <span className="absolute left-4 top-3 text-sm font-medium text-gray-800 w-24 leading-3.5" style={{ fontFamily: 'Comic sans ms' }}>
              You've got 5 bananas, click here to claim
            </span>
          </div>
          <AnimatedStars />
        </div>
      </div>
      <div className="md:hidden flex justify-center mt-4">{idx % 2 === 0 ? <FocusCoinBanner /> : <img src="/assets/images/merch-banner.png" />}</div>
    </>
  )
}
