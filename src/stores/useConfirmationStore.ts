import { create } from 'zustand'
import { UserBet } from '../types'

interface BetCancellationParams {
  bet: UserBet
  onCancel: (betId: string) => void
}

interface ConfirmationState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  hideConfirmation: () => void
  showBetCancellation: (params: BetCancellationParams) => void
}

export const useConfirmationStore = create<ConfirmationState>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},

  hideConfirmation: () =>
    set({
      isOpen: false,
      title: '',
      description: '',
      onConfirm: () => {},
    }),

  showBetCancellation: ({ bet, onCancel }) =>
    set({
      isOpen: true,
      title: 'Cancel Bet',
      description: 'Are you sure you want to cancel this bet? A small fee will be charged.',
      onConfirm: () => onCancel(bet.id),
    }),
}))
