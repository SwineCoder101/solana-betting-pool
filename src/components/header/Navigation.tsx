import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes'

interface Props {
  darkMode?: boolean
}

export default function Navigation({ darkMode = false }: Props) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-5 sm:w-xl">
      <button onClick={() => navigate(ROUTES.HOME)} className="grid place-items-center cursor-pointer">
        <img src={darkMode ? '/assets/svg/sound-white.svg' : '/assets/svg/sound-black.svg'} alt="Search" className="grid place-items-center w-5 h-5" />
      </button>

      <button onClick={() => {}} className="grid place-items-center cursor-pointer">
        <img src={darkMode ? '/assets/svg/magnifying-glass-2-white.svg' : '/assets/svg/magnifying-glass-2-black.svg'} alt="Search" className="grid place-items-center w-5 h-5" />
      </button>

      <button onClick={() => navigate(ROUTES.HOME)} className="grid place-items-center cursor-pointer">
        <img src="/assets/svg/banana-pixelated.svg" alt="Banana" className="grid place-items-center w-9 h-9 rotate-[22deg]" />
      </button>

      <button onClick={() => navigate(ROUTES.LEADERBOARD)} className="grid place-items-center cursor-pointer">
        <img src={darkMode ? '/assets/svg/star-2-white.svg' : '/assets/svg/star-2-black.svg'} alt="Star" className=" w-5 h-5" />
      </button>

      <button onClick={() => navigate(ROUTES.LEADERBOARD_2)} className="grid place-items-center cursor-pointer">
        <img src={darkMode ? '/assets/svg/image-white.svg' : '/assets/svg/image-black.svg'} alt="Search" className=" w-5 h-5" />
      </button>
    </div>
  )
}
