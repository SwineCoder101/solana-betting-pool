import { AnimatedStars } from '../../animations/AnimatedStars'
import { OldButton } from '../../buttons/OldButton'
import { OutlinedText } from './outlined-text/OutlinedText'

export default function LatestBetBanner() {
  return (
    <div className="">
      <div className="ml-2 mb-2 block">
        <OutlinedText title="LATEST BET" />
      </div>

      <OldButton onClick={() => {}} fullWidth>
        <div className="flex gap-2 w-full items-center justify-between px-3 py-1 bg-[#C0C0C0]">
          <div className="flex">
            <div className="flex items-center justify-between">
              <span className="text-xl" style={{ fontFamily: 'Instrument Serif' }}>
                @Degen4lyfe
              </span>
              <span className="text-sm ml-2">3s</span>
            </div>

            <span className="grid place-items-center bg-[#F2FA02] ml-4 rounded-full w-8 h-8 leading-5 text-xl relative" style={{ fontFamily: 'Instrument Serif' }}>
              $1
              <AnimatedStars />
            </span>
          </div>

          <span className="text-2xl underline tracking-tighter">$TRUMPC...</span>
        </div>
      </OldButton>
    </div>
  )
}
