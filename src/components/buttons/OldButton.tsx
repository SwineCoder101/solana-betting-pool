import React from 'react'
import './button-animations.css'
import { AnimatedStars } from '../animations/AnimatedStars'

type Props = {
  children: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  active?: boolean
  fullWidth?: boolean
  className?: string
  style?: React.CSSProperties
  hasBorder?: boolean
}

export function OldButton({ children, onClick, active, fullWidth, className, style, hasBorder = true }: Props) {
  return (
    <button
      onClick={onClick}
      className={`text-3xl grid relative
        place-items-center ${hasBorder ? 'border-2 border-black border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#818181] border-b-[#818181]' : ''}
       active:border-t-[#818181] active:border-l-[#818181] active:border-r-[#FFFFFF] active:border-b-[#FFFFFF]
        
        ${
          active
            ? 'bg-[#FFF369] text-black overflow-visible'
            : hasBorder
            ? "bg-[#C0C0C0] border-r-4 border-b-4 after:absolute after:w-[2px] after:h-[calc(100%_+_4px)] after:bg-black after:right-[-4px] after:top-[-2px] after:content-[''] after:pointer-events-none before:absolute before:h-[2px] before:w-[calc(100%_+_6px)] before:bg-black before:bottom-[-4px] before:left-[-2px] before:content-[''] before:pointer-events-none"
            : 'bg-black text-white'
        }
        
        ${fullWidth ? 'w-full' : 'leading-0 h-8 w-8 md:h-10 md:w-10'}
        ${className}
        `}
      style={style}
    >
      {children}
      {active && <AnimatedStars />}
    </button>
  )
}
