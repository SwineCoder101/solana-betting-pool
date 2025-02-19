import { TeleswapWidget } from 'teleswap-widget'

interface Props {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  fromCoin?: string
  toCoin?: string
}

export function TeleswapContainer({ width = 360, height = 350, theme = 'light', fromCoin = 'ETH', toCoin = 'SOL' }: Props) {
  return (
    <div className="w-full h-full flex justify-center items-center rounded-4xl overflow-hidden">
      <TeleswapWidget
        apiKey={import.meta.env.VITE_TELESWAP_API_KEY}
        fromCoin={fromCoin}
        toCoin={toCoin}
        theme={theme}
        width={width}
        height={height}
        borderColor="#fcc200"
        buttonColor="#fcc200"
        logoUrl="https://i.postimg.cc/cLpvPnRM/2025-02-10-16-49-12.jpg"
      />
    </div>
  )
}
