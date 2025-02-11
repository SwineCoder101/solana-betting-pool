import { ChartBounds, LineData, Rectangle } from './types'

export const getStartTime = () => {
  const now = new Date()
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
}

export const checkIfCellIsActive = (
  rect: Rectangle,
  lineData: {
    time: string
    price: number
    index: number
  }[],
) => {
  // If cell is in a future column, show fire
  if (lineData.length === 0 || rect.col > Math.floor(lineData[lineData.length - 1].index)) {
    return true
  }

  // Find all points that fall within this cell's x range
  const cellPoints = lineData.filter((point) => point.index >= rect.x1 && point.index <= rect.x2)

  // If no points in this cell's range, check if we've passed it
  if (cellPoints.length === 0) {
    const lastPoint = lineData[lineData.length - 1]
    return lastPoint.index < rect.x1
  }

  // Check if any point in the cell's range was within the cell's price bounds
  return cellPoints.some((point) => point.price >= rect.priceBounds.lowerBound && point.price <= rect.priceBounds.upperBound)
}

export const getActiveColumnBounds = ({ lineData, chartBounds }: { lineData: LineData[]; chartBounds: ChartBounds }) => {
  if (lineData.length === 0) return null

  const activeCol = Math.floor(lineData[lineData.length - 1].index) + 1
  const startIndex = activeCol
  const endIndex = activeCol + 1

  return {
    x1: startIndex,
    x2: endIndex,
    y1: chartBounds.lowest,
    y2: chartBounds.highest,
  }
}
