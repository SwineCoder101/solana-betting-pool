import { createPortal } from 'react-dom'
import { ModalType, useModalStore } from '@/stores/modalStore'
import { FavouriteCoinsModal } from './FavouriteCoinsModal'
import { LeaderboardsModal } from './LeaderboardsModal'
import { SearchCoinsModal } from './SearchCoinsModal'
import { YourBetsModal } from './YourBetsModal'
import { TeleswapModal } from '../teleswap/TeleswapModal'
import { WatchBananaTVModal } from './WatchBananaTVModal'

const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<{ onComplete?: () => void }>> = {
  yourBets: YourBetsModal,
  leaderboards: LeaderboardsModal,
  searchCoins: SearchCoinsModal,
  favouriteCoins: FavouriteCoinsModal,
  teleswap: TeleswapModal,
  watchBananaTV: WatchBananaTVModal,
}

export function AppModal() {
  const { activeModal, closeModal } = useModalStore()

  if (!activeModal) return null

  const ModalComponent = MODAL_COMPONENTS[activeModal]

  const stylesArray = [ModalType.YourBets, ModalType.WatchBananaTV, ModalType.Leaderboards]

  return createPortal(
    <div className={`fixed z-40 flex items-center justify-center ${stylesArray.includes(activeModal) ? 'top-[92px] md:inset-0' : 'top-[48px] inset-0'} `}>
      <div className={`fixed inset-0 md:bg-black/50 ${stylesArray.includes(activeModal) ? 'bg-black/50' : ''}`} onClick={closeModal} />
      <div className="z-40">
        <ModalComponent />
      </div>
    </div>,
    document.body,
  )
}
