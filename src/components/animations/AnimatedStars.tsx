import './star-animations.css'

type Props = {
  className?: string
}

export function AnimatedStars({ className = '' }: Props) {
  return (
    <>
      <img src="/assets/svg/star.svg" alt="" className={`w-[11px] h-[11px] absolute -top-[8px] opacity-0 -right-[6px] pointer-events-none star-animate ${className}`} />
      <img src="/assets/svg/star.svg" alt="" className={`w-[11px] h-[11px] absolute top-[13px] -left-[6px] opacity-0 pointer-events-none star-animate-delay-1 ${className}`} />
      <img src="/assets/svg/star.svg" alt="" className={`w-[15px] h-[15px] absolute -bottom-[7px] right-[1px] opacity-0 pointer-events-none star-animate-delay-2 ${className}`} />
    </>
  )
}
