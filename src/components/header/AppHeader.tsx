import { useNavigate } from 'react-router'
import DesktopHeader from './components/DesktopHeader'
import MobileHeader from './components/MobileHeader'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { usePrivy } from '@privy-io/react-auth'
import { useGetBalance } from '../account/account-data-access'
import { PublicKey } from '@solana/web3.js'
import { useSolanaPrivyWallet } from '@/hooks/use-solana-privy-wallet'

export default function AppHeader() {
  const navigate = useNavigate()
  const { isAdmin } = useAdminCheck()
  const { authenticated } = usePrivy()
  const {embeddedWallet} = useSolanaPrivyWallet()
  const { data: balance } = useGetBalance({ address: new PublicKey(embeddedWallet?.address || '6oMF85KwcY57VaweFE7JNeziNaVRdCKHzNLpARdG9mMw') })
  return (
    <>
      <DesktopHeader isAdmin={isAdmin} authenticated={authenticated} navigate={navigate} balance={balance || '0'}/>
      <MobileHeader isAdmin={isAdmin} authenticated={authenticated} navigate={navigate} balance={balance || '0'}/>
    </>
  )
}