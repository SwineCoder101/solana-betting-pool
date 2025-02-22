import { useModalStore } from '@/stores/modalStore'
import { TeleswapWidget } from 'teleswap-widget'
import { Win95Modal } from '../modals/Win95Modal'

interface Props {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  fromCoin?: string
  toCoin?: string
}

export function TeleswapContainer({
  width = 360,
  height = 350,
  theme = 'light',
  fromCoin = 'ETH',
  toCoin = 'SOL',
}: Props) {
  const { closeModal } = useModalStore()
  return (
    <div className="w-full h-full flex justify-center items-center  overflow-hidden ">
      <Win95Modal title="LEADERBOARDS" onClose={closeModal}>
        <div className="bg-white flex justify-center  md:h-auto h-full">
        <TeleswapWidget
          apiKey={import.meta.env.VITE_TELESWAP_API_KEY}
          fromCoin={fromCoin}
          toCoin={toCoin}
          theme={theme}
          width={width}
          height={height}
          borderColor="#ffffff"
          buttonColor="#fcc200"
          logoUrl="https://i.postimg.cc/cLpvPnRM/2025-02-10-16-49-12.jpg"
        />
        </div>
      </Win95Modal>
    </div>
  )
}
