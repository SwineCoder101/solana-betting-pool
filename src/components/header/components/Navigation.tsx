import { Features } from '../../../features'
import { ModalType, useModalStore } from '@/stores/modalStore'
import { OldButtonV2 } from '../../buttons/OldButtonV2'

export default function Navigation() {
  const { openModal } = useModalStore()

  return (
    <div className="flex gap-2 px-2">
      <OldButtonV2 onClick={() => openModal(ModalType.Leaderboards)} className="bg-[#4F4F4F] w-[114px] h-10 grid place-items-center" title="Leaderboards">
        <img src="/assets/icons/chart.png" alt="Leaderboards" className="w-5 h-5" />
      </OldButtonV2>
      <OldButtonV2 onClick={() => openModal(ModalType.SearchCoins)} className="bg-[#4F4F4F] w-[114px] h-10 grid place-items-center" title="Search coins">
        <img src="/assets/icons/magnifying-glass.png" alt="Search coins" className="w-5 h-5" />
      </OldButtonV2>
      <OldButtonV2 onClick={() => openModal(ModalType.FavouriteCoins)} className="bg-[#4F4F4F] w-[114px] h-10 grid place-items-center" title="Favourite coins">
        <img src="/assets/icons/star.png" alt="Favourite coins" className="w-5 h-5" />
      </OldButtonV2>

      {Features.TELESWAP_MODAL && (
        <OldButtonV2 onClick={() => openModal(ModalType.Teleswap)} className="bg-[#4F4F4F] w-[114px] h-10 grid place-items-center" title="Swap tokens">
          <img src="/assets/svg/swap.svg" alt="Swap tokens" className="w-6 h-6" />
        </OldButtonV2>
      )}
    </div>
  )
}
