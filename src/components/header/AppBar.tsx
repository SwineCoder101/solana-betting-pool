import Navigation from './Navigation'

type Props = {}

export default function AppBar({}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 py-4 sm:hidden bg-[#FDFAD1]">
      <Navigation />
    </div>
  )
}
