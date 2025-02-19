import Marquee from 'react-fast-marquee'

export default function SpinningBanner({ text }: { text: string }) {
  return (
    <div
      className="w-full bg-gradient-to-t from-[#BDF55A] to-[#FFF369] text-[18px] text-black"
      style={{
        fontFamily: 'Poppins',
        overflow: 'hidden',
      }}
    >
      <Marquee speed={50} gradient={false}>
        <span className="text-nowrap">{text}</span>
      </Marquee>
    </div>
  )
}
