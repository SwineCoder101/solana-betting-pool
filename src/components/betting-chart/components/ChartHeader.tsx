import { Dispatch, SetStateAction } from 'react'
import { LineData } from '../types'
import { OldButton } from '@/components/buttons/OldButton'

interface Props {
  title: string
  lineData: LineData[]
  selectedAmount: number
  setSelectedAmount: Dispatch<SetStateAction<number>>
  showLogo: boolean
}

export function ChartHeader({ title, lineData, selectedAmount, setSelectedAmount }: Props) {
  return (
    <div className="flex justify-between items-center w-full py-4">
      <div className="flex items-center gap-2">
        <img src={`/assets/images/waifu.png`} alt={title} className="w-10 h-10 rounded-full" />
        <span className="text-[50px] leading-[50px] text-white">
          ${title}: {lineData.length > 0 ? lineData[lineData.length - 1].price.toFixed(2) : 'Loading...'}
        </span>
      </div>
      <div className="flex justify-end gap-1">
        <OldButton onClick={() => setSelectedAmount(1)} active={selectedAmount === 1}>
          $1
        </OldButton>
        <OldButton onClick={() => setSelectedAmount(2)} active={selectedAmount === 2}>
          $2
        </OldButton>
        <OldButton onClick={() => setSelectedAmount(5)} active={selectedAmount === 5}>
          $5
        </OldButton>
      </div>
    </div>
  )
}
