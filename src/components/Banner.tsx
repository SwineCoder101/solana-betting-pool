type Props = {
  imageSrc: string
  altText: string
}

export function Banner({ imageSrc, altText }: Props) {
  return (
    <div className="w-full border-2 border-t-black border-b-[#BABABA] border-l-black border-r-[#BABABA] bg-[#2C2C2C]">
      <img src={imageSrc} alt={altText} className="w-full" />
    </div>
  )
}
