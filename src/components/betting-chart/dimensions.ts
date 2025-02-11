import { BettingChartSize } from '../../types'

export interface ImageDimensions {
  width: number
  height: number
  x: number
  y: number
}

export interface CellDimensions {
  outerBorder: { width: number; height: number; x: number; y: number }
  innerBorder: { width: number; height: number; x: number; y: number; radius: number }
  fill: { width: number; height: number; x: number; y: number; radius: number }
}

export type CellState = 'full' | 'past-won' | 'past-lost' | 'confirm' | 'remove' | 'default'

export const getImageDimensions = (chartSize: BettingChartSize): Record<string, ImageDimensions> => {
  switch (chartSize) {
    case BettingChartSize.MOBILE_COMPACT:
      return {
        fullCell: { width: 40, height: 40, x: -20, y: -20 },
        bananaSmiling: { width: 16, height: 16, x: -8, y: -16 },
        fire: { width: 10, height: 10, x: -5, y: -5 },
      }

    case BettingChartSize.MOBILE_EXPANDED:
      return {
        fullCell: { width: 16, height: 16, x: -8, y: -8 },
        bananaSmiling: { width: 20, height: 20, x: -10, y: -20 },
        fire: { width: 12, height: 12, x: -6, y: -6 },
      }

    case BettingChartSize.DESKTOP_COMPACT:
      return {
        fullCell: { width: 60, height: 60, x: -30, y: -30 },
        bananaSmiling: { width: 24, height: 24, x: -12, y: -24 },
        fire: { width: 14, height: 14, x: -7, y: -7 },
      }

    case BettingChartSize.DESKTOP_EXPANDED:
    default:
      return {
        fullCell: { width: 32, height: 32, x: -16, y: -16 },
        bananaSmiling: { width: 28, height: 28, x: -14, y: -28 },
        fire: { width: 16, height: 16, x: -8, y: -8 },
      }
  }
}

export const getCellDimensions = (isCompact: boolean): CellDimensions => {
  if (isCompact) {
    return {
      outerBorder: { width: 1, height: 1, x: 0, y: 0 },
      innerBorder: { width: 0.99, height: 0.99, x: 0.01, y: 0.01, radius: 0.03 },
      fill: { width: 0.97, height: 0.97, x: 0.02, y: 0.02, radius: 0.02 },
    }
  }
  return {
    outerBorder: { width: 1, height: 1, x: 0, y: 0 },
    innerBorder: { width: 0.96, height: 0.96, x: 0.02, y: 0.02, radius: 0.04 },
    fill: { width: 0.92, height: 0.92, x: 0.04, y: 0.04, radius: 0.03 },
  }
}

export const getCellState = (
  rect: {
    isFull?: boolean
    isBettingDisabled: boolean
    isPredicted: boolean
    col: number
    row: number
  },
  confirmationCell: { col: number; row: number } | null,
): CellState => {
  if (rect.isFull === true) return 'full'

  if (rect.isBettingDisabled) {
    return rect.isPredicted ? 'past-won' : 'past-lost'
  }

  if (confirmationCell?.col === rect.col && confirmationCell?.row === rect.row) {
    return rect.isPredicted ? 'remove' : 'confirm'
  }

  return 'default'
}
