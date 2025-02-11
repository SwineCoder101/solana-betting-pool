export default function SpinningBanner({}) {
  return (
    <div
      className="w-full bg-gradient-to-t from-[#BDF55A] to-[#FFF369] text-[18px] text-black"
      style={{
        fontFamily: 'Poppins',
        overflow: 'hidden',
      }}
    >
      {/* TODO: Add animation */}
      <span className="text-nowrap">new winner! @panchain won $120 new winner! @panchain won $120</span>
    </div>
  )
}
