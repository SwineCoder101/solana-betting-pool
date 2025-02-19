declare module 'teleswap-widget' {
  interface TeleswapWidgetProps {
    apiKey: string
    fromCoin: string
    toCoin: string
    theme: 'light' | 'dark'
    width: number
    height: number
    borderColor: string
    buttonColor: string
    logoUrl: string
  }

  export const TeleswapWidget: React.FC<TeleswapWidgetProps>
}
