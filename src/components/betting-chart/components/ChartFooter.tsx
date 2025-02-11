type Props = {
  tokenName: string
}

export default function ChartFooter({ tokenName }: Props) {
  return (
    <div className="flex items-center justify-between space-between w-full">
      <img src={`/assets/images/wide-banner.png`} alt={tokenName} className="-translate-y-4" />
      <img src={`/assets/images/mini-banner.png`} alt={tokenName} className="px-8" />
    </div>
  )
}
