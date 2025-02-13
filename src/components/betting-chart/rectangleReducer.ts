import { produce } from 'immer'
import { CellState, GridState } from './types'
import { CHART_CONFIGS } from '../../config'
import { BettingChartSize, UserBet } from '../../types'

// Use the desktop expanded rows as our base for calculations
const TOTAL_ROWS = CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].rows

type RectangleAction =
  | { type: 'ADVANCE_COLUMN'; price: number }
  | { type: 'PLACE_BET'; col: number; row: number; amount: number }
  | { type: 'CONFIRM_BET'; col: number; row: number }
  | { type: 'REMOVE_BET'; col: number; row: number }
  | { type: 'UPDATE_PRICE'; price: number }
  | { type: 'UPDATE_CELL_DATA'; col: number; row: number; data: Partial<CellState> }
  | { type: 'UPDATE_CHART_BOUNDS'; lowest: number; highest: number }
  | { type: 'ADD_LINE_DATA'; data: { time: string; price: number; index: number } }
  | { type: 'RESET_GAME'; price: number }
  | { type: 'SHIFT_PREDICTIONS'; shift: number }
  | { type: 'SET_CONFIRMATION_CELL'; col: number; row: number }
  | { type: 'ADD_BET'; bet: UserBet }
  | { type: 'REMOVE_BET_BY_ID'; id: string }
  | { type: 'REMOVE_CONFIRMATION_CELL'; col: number; row: number }

export const rectangleReducer = produce((state: GridState, action: RectangleAction) => {
  switch (action.type) {
    case 'ADVANCE_COLUMN': {
      const newActiveColumn = state.activeColumn + 1
      state.activeColumn = newActiveColumn
      state.lastPrice = action.price

      // Update won/lost status for previous column's predictions
      for (let row = 0; row < TOTAL_ROWS; row++) {
        const cellKey = `${state.activeColumn - 1}-${row}`
        const cell = state.cells[cellKey]
        if (cell?.isPredicted) {
          const { lowerBound, upperBound } = cell.priceBounds
          cell.isCorrectlyPredicted = action.price >= lowerBound && action.price <= upperBound
          cell.isBettingDisabled = true
        }
      }
      break
    }

    case 'PLACE_BET': {
      const cellKey = `${action.col}-${action.row}`
      if (!state.cells[cellKey]) {
        state.cells[cellKey] = {
          isPredicted: false,
          isAwaitingConfirmation: false,
          isCorrectlyPredicted: false,
          isBettingDisabled: false,
          isFull: false,
          isRemoving: false,
          isHot: false,
          multiplier: '0',
          totalPrice: 0,
          userAvatars: [],
          priceBounds: { lowerBound: 0, upperBound: 0 },
        }
      }

      state.cells[cellKey] = {
        ...state.cells[cellKey],
        isPredicted: true,
        amount: action.amount,
        isAwaitingConfirmation: true,
      }
      break
    }

    case 'CONFIRM_BET': {
      const cellKey = `${action.col}-${action.row}`
      if (state.cells[cellKey]) {
        state.cells[cellKey].isAwaitingConfirmation = false
      }
      break
    }

    case 'REMOVE_BET': {
      const cellKey = `${action.col}-${action.row}`
      if (state.cells[cellKey]) {
        state.cells[cellKey] = {
          ...state.cells[cellKey],
          isPredicted: false,
          amount: undefined,
          isAwaitingConfirmation: false,
          isRemoving: false,
          betId: undefined,
        }
      }
      break
    }

    case 'UPDATE_PRICE': {
      state.lastPrice = action.price
      // Only check active column for price-based updates
      for (let row = 0; row < TOTAL_ROWS; row++) {
        const cellKey = `${state.activeColumn}-${row}`
        const cell = state.cells[cellKey]
        if (cell?.isPredicted) {
          const { lowerBound, upperBound } = cell.priceBounds
          cell.isCorrectlyPredicted = action.price >= lowerBound && action.price <= upperBound
        }
      }
      break
    }

    case 'UPDATE_CELL_DATA': {
      const cellKey = `${action.col}-${action.row}`
      if (!state.cells[cellKey]) {
        state.cells[cellKey] = {
          isPredicted: false,
          isAwaitingConfirmation: false,
          isCorrectlyPredicted: false,
          isBettingDisabled: false,
          isFull: false,
          isRemoving: false,
          isHot: false,
          multiplier: '0',
          totalPrice: 0,
          userAvatars: [],
          priceBounds: { lowerBound: 0, upperBound: 0 },
        }
      }
      state.cells[cellKey] = {
        ...state.cells[cellKey],
        ...action.data,
      }
      break
    }

    case 'UPDATE_CHART_BOUNDS': {
      state.chartBounds = {
        lowest: action.lowest,
        highest: action.highest,
      }
      break
    }

    case 'ADD_LINE_DATA': {
      state.lineData.push(action.data)
      break
    }

    case 'RESET_GAME': {
      // Reset the game state and clear all cells
      state.activeColumn = 0
      state.lastPrice = action.price
      state.lineData = [
        {
          time: new Date().toTimeString().slice(0, 8),
          price: action.price,
          index: 0,
        },
      ]

      // Clear all cells/bets
      state.cells = {}

      break
    }

    case 'SHIFT_PREDICTIONS': {
      const newCells: typeof state.cells = {}

      Object.entries(state.cells).forEach(([key, cell]) => {
        if (cell.isPredicted || cell.isAwaitingConfirmation) {
          const [col, row] = key.split('-').map(Number)
          const newRow = row - action.shift
          const newKey = `${col}-${newRow}`

          if (newRow >= 0 && newRow < TOTAL_ROWS) {
            newCells[newKey] = {
              ...cell,
              betId: cell.betId,
              amount: cell.amount,
              multiplier: cell.multiplier,
              isAwaitingConfirmation: cell.isAwaitingConfirmation,
            }
          }
        } else {
          newCells[key] = cell
        }
      })

      state.cells = newCells
      break
    }

    case 'SET_CONFIRMATION_CELL': {
      const cellKey = `${action.col}-${action.row}`

      // Clear any existing confirmation cells
      Object.entries(state.cells).forEach(([key, cell]) => {
        if (cell.isAwaitingConfirmation) {
          state.cells[key] = {
            ...cell,
            isAwaitingConfirmation: false,
          }
        }
      })

      // Set new confirmation cell
      if (!state.cells[cellKey]) {
        state.cells[cellKey] = {
          isPredicted: false,
          isAwaitingConfirmation: true,
          isCorrectlyPredicted: false,
          isBettingDisabled: false,
          isFull: false,
          isRemoving: false,
          isHot: false,
          multiplier: '0',
          totalPrice: 0,
          userAvatars: [],
          priceBounds: { lowerBound: 0, upperBound: 0 },
        }
      } else {
        state.cells[cellKey].isAwaitingConfirmation = true
      }
      break
    }

    case 'ADD_BET': {
      const { col, row } = action.bet.position || { col: -1, row: -1 }
      if (col === -1 || row === -1) return

      const cellKey = `${col}-${row}`
      if (!state.cells[cellKey]) {
        state.cells[cellKey] = {
          isPredicted: false,
          isAwaitingConfirmation: false,
          isCorrectlyPredicted: false,
          isBettingDisabled: false,
          isFull: false,
          isRemoving: false,
          isHot: false,
          multiplier: action.bet.multiplier,
          totalPrice: 0,
          userAvatars: [],
          priceBounds: { lowerBound: 0, upperBound: 0 },
        }
      }

      state.cells[cellKey] = {
        ...state.cells[cellKey],
        isPredicted: true,
        amount: action.bet.amount,
        multiplier: action.bet.multiplier,
        isAwaitingConfirmation: false,
        betId: action.bet.id,
      }
      break
    }

    case 'REMOVE_BET_BY_ID': {
      // Find the cell containing this specific bet
      Object.entries(state.cells).forEach(([key, cell]) => {
        if (cell.betId === action.id) {
          // Only remove if betId matches
          state.cells[key] = {
            ...cell,
            isPredicted: false,
            amount: undefined,
            isAwaitingConfirmation: false,
            isRemoving: false,
            betId: undefined, // Clear the betId
          }
        }
      })
      break
    }

    case 'REMOVE_CONFIRMATION_CELL': {
      const cellKey = `${action.col}-${action.row}`
      if (state.cells[cellKey]) {
        state.cells[cellKey] = {
          ...state.cells[cellKey],
          isAwaitingConfirmation: false,
        }
      }
      break
    }
  }
})
