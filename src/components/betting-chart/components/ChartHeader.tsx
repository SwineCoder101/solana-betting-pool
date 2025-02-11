import { ROUTES } from '../../../routes'
import ButtonOutline from '../../buttons/ButtonOutline'
import { OldButton } from '../../buttons/OldButton'
import { useNavigate } from 'react-router-dom'

interface ChartHeaderProps {
  title: string
  lineData: Array<{ time: string; price: number }>
  selectedAmount: number
  setSelectedAmount: (amount: number) => void
  showLogo?: boolean
}

export function ChartHeader({ title, lineData, selectedAmount, setSelectedAmount, showLogo = false }: ChartHeaderProps) {
  const navigate = useNavigate()
  const currentPrice = lineData[lineData.length - 1]?.price

  return (
    <div className="flex items-center justify-between mb-2 bg-[#333333] px-2 py-1 sm:px-4">
      <div className="flex items-center gap-2 w-full sm:w-1/3" style={{ fontFamily: 'Instrument Serif' }}>
        <img src="/assets/images/waifu.png" alt="Waifu" className="w-8 h-8 rounded-full border border-white self-start mt-1" />
        <div className="flex flex-col mr-2 grow sm:grow-0">
          <div className="flex gap-1 items-center">
            <h2 className="text-xl leading-6 sm:text-3xl sm:leading-8 uppercase text-white">${title}</h2>
            <img src="/assets/svg/copy-white.svg" alt="Copy" className="w-5 h-5 drop-shadow-lg text-white" />
            <img src="/assets/svg/star-2-white.svg" alt="Star" className="w-5 h-5 drop-shadow-lg text-white" />
          </div>
          <div className="flex gap-2">
            {currentPrice && <span className="text-white">${currentPrice.toFixed(5)}</span>}
            {currentPrice && (
              <div className="flex items-center gap-1">
                <span className="text-[#14F427] flex items-center gap-1">$1.32</span>
                <img src="/assets/svg/arrow-up.svg" alt="Arrow up" className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-auto sm:ml-0">
          {[1, 2, 5].map((amount) => (
            <OldButton key={amount} onClick={() => setSelectedAmount(amount)} active={selectedAmount === amount} className="rounded-full text-xl sm:text-3xl" hasBorder={false}>
              ${amount}
            </OldButton>
          ))}
        </div>
      </div>

      {showLogo && (
        <div className="hidden sm:flex relative mr-2 justify-center">
          <h1 className="text-7xl py-7 text-white cursor-pointer" onClick={() => navigate(ROUTES.HOME)} style={{ fontFamily: 'Instrument Serif' }}>
            BananaZone
          </h1>
          <img src="/assets/images/bananas.png" alt="Banana" className="w-10 h-10 absolute left-[213px] top-[50px]" />
        </div>
      )}

      <div className="hidden sm:flex items-center gap-2 w-1/3 justify-end">
        <ButtonOutline title="Invite" onClick={() => {}}>
          <img src="/assets/images/bananas.png" alt="Banana" className="w-7 h-7 drop-shadow-lg" />
        </ButtonOutline>
      </div>
    </div>
  )
}
