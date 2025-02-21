import { create } from 'zustand'

interface TokenSwapState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useTokenSwapStore = create<TokenSwapState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
