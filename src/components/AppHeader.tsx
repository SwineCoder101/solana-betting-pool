import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../routes'
import { OldButtonV2 } from './buttons/OldButtonV2'

export default function AppHeaderOld() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex justify-between items-center w-full bg-gradient-to-r from-[#FFA163] to-[#FFCF00] px-2.5 sticky top-0 z-10">
      <div className="flex items-center">
        <div className="relative mr-2">
          <h1 className="text-[50px] font-bold text-black cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
            BananaZone
          </h1>
          <img src="/assets/images/bananas.png" alt="Banana" className="w-8 h-8 absolute left-[132px] top-[24px]" />
        </div>

        <div className="flex gap-2">
          <OldButtonV2 onClick={() => {}} className="bg-[#C0C0C0]">
            <div className="flex flex-col w-28 justify-center items-center italic font-bold text-[15px] gap-0" style={{ fontFamily: 'Times New Roman' }}>
              <span className="text-[#2C2C2C] leading-3">Get the</span>
              <span className=" text-[#FF0000] leading-3">MERCH</span>
            </div>
          </OldButtonV2>
          <OldButtonV2 onClick={() => {}} className="bg-[yellow] text-black h-10 grid place-items-center px-1">
            <div className="flex justify-center items-center gap-0">
              <img src="/assets/svg/banana-pixelated.svg" alt="Banana" className="w-5 h-5 " />
              <div className="flex flex-col gap-0">
                <span className="text-xs" style={{ fontFamily: 'Comic Sans MS' }}>
                  CLICK FOR
                </span>
                <span className="text-xs" style={{ fontFamily: 'Comic Sans MS' }}>
                  MORE INFO
                </span>
              </div>
            </div>
          </OldButtonV2>
        </div>
      </div>

      <div className="flex gap-4">
        <OldButtonV2
          onClick={() => navigate(ROUTES.HOME)}
          className={`w-[114px] h-10 grid place-items-center ${location.pathname === ROUTES.HOME ? 'bg-[#2C2C2C]' : 'bg-[#4F4F4F]'}`}
        >
          <img src="/assets/icons/chart.png" alt="Chart" className="w-5 h-5" />
        </OldButtonV2>
        <OldButtonV2
          onClick={() => navigate(ROUTES.LEADERBOARD)}
          className={`w-[114px] h-10 grid place-items-center ${location.pathname === ROUTES.LEADERBOARD ? 'bg-[#2C2C2C]' : 'bg-[#4F4F4F]'}`}
        >
          <img src="/assets/icons/magnifying-glass.png" alt="Magnifying glass" className="w-5 h-5" />
        </OldButtonV2>
        <OldButtonV2 onClick={() => {}} className="bg-[#4F4F4F] w-[114px] h-10 grid place-items-center">
          <img src="/assets/icons/star.png" alt="Star" className="w-5 h-5" />
        </OldButtonV2>
      </div>

      <div className="flex gap-2">
        <OldButtonV2
          onClick={() => {}}
          className="bg-gradient-to-r text-white h-10 grid place-items-center px-4"
          style={{
            backgroundImage: 'linear-gradient(0.35turn, #FF0000, #FF00C7, #FFE600, #00FF47, #00F0FF, #001AFF)',
            animation: 'gradient 15s ease infinite',
          }}
        >
          <span className="flex justify-center items-center gap-2.5 relative text-base mt-3 underline text-black font-bold" style={{ fontFamily: 'Comic Sans MS' }}>
            <img src="/assets/images/bolt.png" alt="Bolt" className="w-8.5 h-8.5 object-contain absolute left-[50%] -top-[12px] translate-x-[-50%] z-10" />
            <span className="z-20">TURBO MODE!</span>
          </span>
        </OldButtonV2>
        <OldButtonV2 onClick={() => {}} className="bg-[#4F4F4F] text-white h-10 grid place-items-center px-4">
          <div className="flex justify-center items-center gap-2.5">
            <img src="/assets/svg/banana-pixelated.svg" alt="Banana" className="w-5 h-5 rotate-[22deg]" />
            <span className="text-2xl">£1,211.32</span>
            <img src="/assets/images/penguin.png" alt="Profile icon" className="w-6 h-6 rounded-full border-2 border-white" />
          </div>
        </OldButtonV2>
      </div>
    </div>
  )
}
