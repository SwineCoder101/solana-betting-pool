import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BananaApp from './BananaApp.tsx'
import Providers from './components/privy/privy-provider.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <BananaApp />
    </Providers>
  </StrictMode>,
)
