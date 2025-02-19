import { create } from 'zustand'

export enum ModalType {
  YourBets = 'yourBets',
  Leaderboards = 'leaderboards',
  SearchCoins = 'searchCoins',
  FavouriteCoins = 'favouriteCoins',
  Teleswap = 'teleswap',
  WatchBananaTV = 'watchBananaTV',
}

interface ModalState {
  activeModal: ModalType | null
  openModal: (modal: ModalType) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,

  openModal: (modal) =>
    set({
      activeModal: modal,
    }),

  closeModal: () =>
    set({
      activeModal: null,
    }),
}))
