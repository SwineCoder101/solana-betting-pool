import Navigation from './components/Navigation'

export default function AppBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 py-2 md:hidden">
      <Navigation />
    </div>
  )
}
