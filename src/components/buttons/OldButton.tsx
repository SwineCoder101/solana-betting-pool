import React from 'react'

type Props = {
  children: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  active?: boolean
  fullWidth?: boolean
  className?: string
  style?: React.CSSProperties
  hasBorder?: boolean
  disabled?: boolean
}

export function OldButton({ children, onClick, active, fullWidth, className, style, hasBorder = true, disabled = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-3xl grid relative
        place-items-center ${hasBorder ? 'border-2 border-black border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#818181] border-b-[#818181]' : ''}
       active:border-t-[#818181] active:border-l-[#818181] active:border-r-[#FFFFFF] active:border-b-[#FFFFFF]
        
        ${
          active
            ? 'bg-[#FFF369] text-black overflow-visible'
            : hasBorder
            ? "border-r-4 border-b-4 after:absolute after:w-[2px] after:h-[calc(100%_+_4px)] after:bg-black after:right-[-4px] after:top-[-2px] after:content-[''] after:pointer-events-none before:absolute before:h-[2px] before:w-[calc(100%_+_6px)] before:bg-black before:bottom-[-4px] before:left-[-2px] before:content-[''] before:pointer-events-none"
            : 'bg-black text-white'
        }
        
        ${fullWidth ? 'w-full' : 'leading-0 h-8 w-8 sm:h-10 sm:w-10'}
        ${className}
        `}
      style={style}
    >
      {children}
      {active && (
        <>
          <img src="/assets/svg/star.svg" alt="" className="w-[11px] h-[11px] absolute -top-[8px] -right-[6px] pointer-events-none" />
          <img src="/assets/svg/star.svg" alt="" className="w-[11px] h-[11px] absolute top-[13px] -left-[6px] pointer-events-none" />
          <img src="/assets/svg/star.svg" alt="" className="w-[15px] h-[15px] absolute -bottom-[7px] right-[1px] pointer-events-none" />
        </>
      )}
    </button>
  )
}
