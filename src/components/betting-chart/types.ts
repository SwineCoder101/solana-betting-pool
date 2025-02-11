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
