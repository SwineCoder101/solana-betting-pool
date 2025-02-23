import { ModalType, useModalStore } from '@/stores/modalStore'
import { OldButtonV2 } from '../../buttons/OldButtonV2'

export default function MobileHeader() {
  const { openModal } = useModalStore()

  return (
    <div className="flex md:hidden items-center justify-center flex-col w-full bg-gradient-to-r from-[#FFA163] to-[#FFCF00] sticky top-0 z-10">
      <div className="relative h-12">
        <h1 className="text-[30px] leading-12 text-center font-bold text-black">BananaZone</h1>
        <img src="/assets/images/bananas.png" alt="Banana" className="w-8 h-8 absolute left-[132px] top-[12px]" />
      </div>

      <div className="flex w-full">
        <OldButtonV2 onClick={() => openModal(ModalType.WatchBananaTV)} className="bg-[#C0C0C0] grow">
          <div className="flex flex-col py-1 justify-center items-center italic font-bold text-[15px] gap-0 " style={{ fontFamily: 'Times New Roman' }}>
            <span className="text-[#2C2C2C] leading-4">Watch</span>
            <span className=" text-[#FF0000] leading-4">BananaTV</span>
          </div>
        </OldButtonV2>
        <OldButtonV2 onClick={() => openModal(ModalType.YourBets)} className="bg-[#F2FA02] flex items-center gap-0 grow">
          <img src="/assets/svg/banana-pixelated.svg" alt="Banana" className="w-7 h-7 ml-1" />
          <div className="flex flex-col py-1 pr-2 justify-center items-center font-bold text-[15px] gap-0 " style={{ fontFamily: 'Comic Sans MS' }}>
            <span className="leading-4">YOUR</span>
            <span className="leading-4">BETS</span>
          </div>
        </OldButtonV2>
        <OldButtonV2 onClick={() => {}} className="bg-[#4F4F4F] text-white grid place-items-center px-4 grow">
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
