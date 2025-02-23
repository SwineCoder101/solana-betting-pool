import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Providers from './components/privy/providers.tsx'
import BananaApp from './BananaApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <BananaApp />
    </Providers>
  </StrictMode>,
)
