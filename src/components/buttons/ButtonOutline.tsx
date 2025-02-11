import React from 'react'

type Props = {
  title: string
  onClick: () => void
  children?: React.ReactNode
  className?: string
}

export default function ButtonOutline({ children, onClick, title, className }: Props) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#FFF369] border-2 border-black text-black flex justify-center items-center gap-2 py-0.5 pl-4 pr-1 rounded-xs cursor-pointer ${className}`}
    >
      <span className="text-2xl leading-6" style={{ fontFamily: 'Instrument Serif' }}>
        {title}
      </span>
      {children}
    </button>
  )
}
