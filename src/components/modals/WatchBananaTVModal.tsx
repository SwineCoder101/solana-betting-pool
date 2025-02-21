import { OldButton } from '../buttons/OldButton'

export function WatchBananaTVModal() {
  return (
    <div className="w-screen bg-[#2C2C2C]">
      <div className="flex flex-col gap-4 relative">
        <img src="/assets/images/tv-banner.png" alt="TV Banner" className="w-full" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4">
          <OldButton onClick={() => {}} className="px-4 h-12 bg-[#F2FA02] cursor-pointer" style={{ fontFamily: 'Instrument Serif', fontSize: '24px' }} fullWidth>
            PLAY
          </OldButton>
        </div>
      </div>
    </div>
  )
}
