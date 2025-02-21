type Props = {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  className?: string
  style?: React.CSSProperties
  title?: string
}

export function OldButtonV2({ children, onClick, active, className, style, title }: Props) {
  return (
    <button
      onClick={onClick}
      className={`text-[32px] relative border-2 border-black border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-black border-b-black
        text-[#272727] active:border-t-[#818181] active:border-l-[#818181] active:border-r-[#FFFFFF] active:border-b-[#FFFFFF]
        ${className}
        ${active ? 'bg-[#F2FA02]' : ''}
        `}
      style={style}
      title={title ?? ''}
    >
      {children}
    </button>
  )
}
