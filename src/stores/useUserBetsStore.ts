import { create } from 'zustand'
import { UserBet as UserBetType } from '../types'
import { SetStateAction } from 'react'

interface UserBetsState {
  userBets: UserBetType[]
  setUserBets: (value: SetStateAction<UserBetType[]>) => void
  addUserBet: (bet: UserBetType) => void
  removeUserBet: (betId: string) => void
  clearUserBets: () => void
}

export const useUserBetsStore = create<UserBetsState>((set) => ({
  userBets: [],
  setUserBets: (value) =>
    set({
      userBets: typeof value === 'function' ? value(useUserBetsStore.getState().userBets) : value,
    }),
  addUserBet: (bet) =>
    set((state) => ({
      userBets: [...state.userBets, bet],
    })),
  removeUserBet: (betId) =>
    set((state) => ({
      userBets: state.userBets.filter((bet) => bet.id !== betId),
    })),
  clearUserBets: () => set({ userBets: [] }),
}))
