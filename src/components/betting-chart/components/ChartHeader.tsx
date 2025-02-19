import { Dispatch, SetStateAction } from 'react'
import { OldButton } from '../../buttons/OldButton'
import { LineData } from '../types'

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
      <div className="flex gap-1 md:gap-2 text-white items-end">
        <img src={`/assets/images/waifu.png`} alt={title} className="w-6 h-6 md:w-10 md:h-10 rounded-full" />
        <span className="text-[30px] leading-[24px] md:text-[50px] md:leading-[40px] max-w-[90px] truncate sm:max-w-none">${title}</span>
        <img src="/assets/svg/gold-star.svg" className="mb-0.5 md:mb-1 h-3 w-3 md:h-4 md:w-4" />
        <span className="text-[18px] leading-[16px] md:text-[30px] md:leading-[26px]">{lineData.length > 0 ? lineData[lineData.length - 1].price.toFixed(2) : 'Loading'}</span>
        <span className="text-[18px] leading-[16px] text-[#14F427] md:text-[30px] md:leading-[26px]">1.31%</span>
        <img src="/assets/svg/arrow-up.svg" className="mb-0.5 md:mb-1 h-3 w-3 md:h-4 md:w-4" />
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
