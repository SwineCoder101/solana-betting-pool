import { Dispatch, SetStateAction } from 'react'
import { useConfirmationStore } from '@/stores/useConfirmationStore'
import { UserBet } from '../../../types'
import SpinningBanner from './SpinningBanner'
import './styles.css'

interface Props {
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
}

export default function YourBetsBanner({ userBets, setUserBets }: Props) {
  const showBetCancellation = useConfirmationStore((state) => state.showBetCancellation)

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
                    onClick={() =>
                      showBetCancellation({
                        bet,
                        onCancel: (betId) => setUserBets(userBets.filter((b) => b.id !== betId)),
                      })
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
