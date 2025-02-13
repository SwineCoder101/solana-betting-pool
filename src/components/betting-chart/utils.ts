import { ChartBounds } from './types'
import { CHART_CONFIGS } from '../../config'
import { BettingChartSize } from '../../types'

// Use the same column count for all chart sizes
const TOTAL_COLUMNS = CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].cols

export const getStartTime = () => {
  const now = new Date()
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
}

interface ActiveColumnBoundsParams {
  activeColumn: number
  chartBounds: ChartBounds
}

export const getActiveColumnBounds = ({ activeColumn, chartBounds }: ActiveColumnBoundsParams) => {
  // Return bounds for the next column after the active one
  const nextColumn = activeColumn + 1

  // Don't show border for the last column
  if (nextColumn >= TOTAL_COLUMNS) return null

  return {
    x1: nextColumn,
    x2: nextColumn + 1,
    y1: chartBounds.lowest,
    y2: chartBounds.highest,
  }
}
