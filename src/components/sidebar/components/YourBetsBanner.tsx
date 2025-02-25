import { useCreateBetBackend } from '@/hooks/use-create-bet-backend'
import { useConfirmationStore } from '@/stores/useConfirmationStore'
import { ConnectedSolanaWallet } from '@privy-io/react-auth'
import { Dispatch, SetStateAction } from 'react'
import { UserBet } from '../../../types'
import SpinningBanner from './SpinningBanner'
import './styles.css'
import { useTransactionToast } from '@/hooks/use-toaster'
import { CLUSTER_TO_USE } from '@/config'
interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
  embeddedWallet: ConnectedSolanaWallet | null
}

export default function YourBetsBanner({ userBets, setUserBets, embeddedWallet }: Props) {
  const showBetCancellation = useConfirmationStore((state) => state.showBetCancellation)
  const {cancelBet} = useCreateBetBackend();
  const transactionToast = useTransactionToast(CLUSTER_TO_USE);
  
  const handleBetCancellation = async (bet: UserBet) => {

    const response = await cancelBet.mutateAsync({
      poolKey: bet.poolKey,
      userKey: embeddedWallet?.address || '',
    })

    if (response.txs.length > 0) {
      transactionToast(response.txs[0])
    }

    showBetCancellation({
                        bet,
                        onCancel: (betId) => setUserBets(userBets.filter((b) => b.id !== betId)),
                      })
  }

  return (
    <div>
      <SpinningBanner text="@panchain won $120 new winner! @panchain won $120 new winner! @panchain won $120 new winner! " />
      <div className="ml-2 mb-2 block">
        <span
          style={{
            fontFamily: 'Poppins',
          }}
          className="gradient-text"
        >
          YOUR BETS
        </span>
      </div>

      <div className="w-full px-3 py-1 text-white">
        <div className="flex flex-col gap-1 w-full overflow-y-auto max-h-32">
          {userBets.length > 0 ? (
            userBets.map((bet) => (
              <div key={bet.id} className="max-h-32">
                <div className="flex items-end justify-between">
                  <span className="text-xl">{bet.time}</span>
                  <span className="text-2xl">${bet.amount}</span>
                  <span className="text-2xl">{bet.multiplier}x</span>
                  <button
                    className="underline cursor-pointer"
                    onClick={async () => await handleBetCancellation(bet)
                    }
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="max-h-32">
              <div className="flex items-center justify-center">
                <span className="text-xl text-white">No bets yet</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
