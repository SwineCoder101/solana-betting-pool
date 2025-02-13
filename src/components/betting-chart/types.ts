export interface Rectangle {
  x1: number
  x2: number
  y1: number
  y2: number
  col: number
  row: number
  isPredicted: boolean
  isBettingDisabled: boolean
  isAwaitingConfirmation: boolean
  label?: string
  borderColor: string
  innerBorderColor: string
  userAvatars: string[]
  multiplier: string
  priceBounds: {
    lowerBound: number
    upperBound: number
  }
  isFull?: boolean
  totalPrice?: number
  isCorrectlyPredicted?: boolean
  isRemoving?: boolean
  amount?: number
  isHot?: boolean
  totalBets?: number
  poolKey?: string
}

export interface LineData {
  time: string
  price: number
  index: number
}

export interface ChartBounds {
  lowest: number
  highest: number
}

export interface CellState {
  isPredicted: boolean
  isAwaitingConfirmation: boolean
  isCorrectlyPredicted: boolean
  isBettingDisabled: boolean
  isFull: boolean
  isRemoving: boolean
  isHot: boolean
  multiplier: string
  amount?: number
  totalPrice: number
  userAvatars: string[]
  priceBounds: {
    lowerBound: number
    upperBound: number
  }
  betId?: string
}

export interface GridState {
  cells: Record<string, CellState> // key format: `${col}-${row}`
  activeColumn: number
  lastPrice: number
  chartBounds: ChartBounds
  lineData: LineData[]
}
