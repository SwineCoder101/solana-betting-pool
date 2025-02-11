import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { Line, LineChart, ReferenceArea, XAxis, YAxis } from 'recharts'
import { CHART_CONFIGS, MULTIPLIER_CONFIG, PADDING, SECONDS_PER_CELL_BLOCK } from '../../config'
import { MockData } from '../../mockdata'
import { BettingChartSize, ConfirmationState, UserBet } from '../../types'
import { generateRandomId, getCurrentTime, timeToMinutes } from '../../utils'
import { ConfirmationDialog } from '../dialog/ConfirmationDialog'
import './BettingChart.css'
import { ChartHeader } from './components/ChartHeader'
import { getCellDimensions, getImageDimensions } from './dimensions'
import { ChartBounds, LineData, Rectangle } from './types'
import { checkIfCellIsActive, getActiveColumnBounds, getStartTime } from './utils'
import bananaSmiling from '/assets/images/banana-smiling.png'
import fullCellPool from '/assets/svg/full-cell-pool.svg'
import { useBettingData } from '@/hooks/useBettingData'

export interface Props {
  tokenCode: string
  tokenName: string
  competitionKey?: string
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
  showLogo?: boolean
}

// Update the CustomLabel component to use chartSize instead of isCompactMode
const CustomLabel = (props: any) => {
  const { viewBox, value, cellState, chartSize, totalPrice } = props
  const x = viewBox.x + viewBox.width / 2 || 0
  const y = viewBox.y + viewBox.height / 2 || 0

  const dims = getImageDimensions(chartSize)

  // Handle different cell states
  switch (cellState) {
    case 'full':
      return (
        <g transform={`translate(${x},${y})`}>
          <image href={fullCellPool} width={dims.fullCell.width} height={dims.fullCell.height} x={dims.fullCell.x} y={dims.fullCell.y} />
        </g>
      )

    case 'past-won':
      return (
        <g transform={`translate(${x},${y})`}>
          <image href={bananaSmiling} width={dims.bananaSmiling.width} height={dims.bananaSmiling.height} x={dims.bananaSmiling.x} y={dims.bananaSmiling.y} />
          <text textAnchor="middle" dominantBaseline="middle" className="betting-cell__label betting-cell__label--won">
            ${totalPrice}
          </text>
        </g>
      )

    case 'past-lost':
      return <g transform={`translate(${x},${y})`}></g>

    case 'confirm':
    case 'remove':
      return (
        <g transform={`translate(${x},${y})`}>
          <text textAnchor="middle" dominantBaseline="middle" className="betting-cell__label betting-cell__label--confirming">
            {value}
          </text>
        </g>
      )

    default:
      // Default state (ready to bet)
      const isPredicted = cellState === 'predicted' || props?.isPredicted
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`
              betting-cell__label 
              betting-cell__label--default 
              ${isPredicted ? 'betting-cell__label--predicted' : ''}
              ${chartSize === BettingChartSize.MOBILE_EXPANDED ? 'betting-cell__label--mobile-expanded' : ''}
            `}
            dy="-0.5em"
          >
            ${value}
          </text>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`
              betting-cell__price 
              betting-cell__price--default
              ${isPredicted ? 'betting-cell__price--predicted' : ''}
              ${chartSize === BettingChartSize.MOBILE_EXPANDED ? 'betting-cell__price--mobile-expanded' : ''}
            `}
            dy="0.5em"
          >
            ${totalPrice}
          </text>
        </g>
      )
  }
}

function BettingChart({ tokenCode, tokenName, competitionKey = MockData.competition.competitionKey, userBets, setUserBets, showLogo = false }: Props) {
  const priceRangeShiftRef = useRef(0)
  const basePriceRef = useRef<number | null>(null)
  const latestPriceRef = useRef<number | null>(null)
  const gameStartTimeRef = useRef<number>(Date.now())

  const [chartBounds, setChartBounds] = useState<ChartBounds>({ lowest: 0, highest: 1 })
  const [lineData, setLineData] = useState<LineData[]>([])
  const [basePrice, setBasePrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [predictions, setPredictions] = useState<{ x: number; y: number }[]>([])
  const [confirmationCell, setConfirmationCell] = useState<ConfirmationState | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(1)
  const [chartSize, setChartSize] = useState<BettingChartSize>(BettingChartSize.DESKTOP_COMPACT)
  const [startTime, setStartTime] = useState(getStartTime())
  const [rowHeightPriceValue, setRowHeightPriceValue] = useState(0)
  const [removingBetId, setRemovingBetId] = useState<string | null>(null)
  const [betToCancel, setBetToCancel] = useState<UserBet | null>(null)

  const { bettingPools, placeBet } = useBettingData(competitionKey)

  const currentConfig = CHART_CONFIGS[chartSize]
  const CHART_HEIGHT = currentConfig.height
  const CHART_WIDTH = currentConfig.width
  const TOTAL_ROWS = currentConfig.rows
  const TOTAL_COLUMNS = currentConfig.cols

  const isCompactMode = chartSize === BettingChartSize.DESKTOP_COMPACT || chartSize === BettingChartSize.MOBILE_COMPACT

  const isMobile = chartSize === BettingChartSize.MOBILE_COMPACT || chartSize === BettingChartSize.MOBILE_EXPANDED

  // Find bet at position for this chart
  const findBetAtPosition = (col: number, row: number) => {
    return userBets.find((bet) => bet.tokenCode === tokenCode && bet.position?.col === col && bet.position?.row === row)
  }

  // Calculate row range which determines how many rows are visible
  const getVisibleRowRange = (size: BettingChartSize) => {
    if (size === BettingChartSize.DESKTOP_COMPACT || size === BettingChartSize.MOBILE_COMPACT) {
      // render 4 middle rows
      // since hight on compact mode is 4 and expanded is 10, we can hard code values here
      return {
        start: 3,
        end: 7,
      }
    }
    return { start: 0, end: TOTAL_ROWS }
  }

  const visibleRowRange = getVisibleRowRange(chartSize)

  // Toggle size between compact and expanded
  const handleSizeToggle = () => {
    const isMobile = window.innerWidth <= 768
    setChartSize((current) => {
      if (isMobile) {
        return current === BettingChartSize.MOBILE_COMPACT ? BettingChartSize.MOBILE_EXPANDED : BettingChartSize.MOBILE_COMPACT
      }
      return current === BettingChartSize.DESKTOP_COMPACT ? BettingChartSize.DESKTOP_EXPANDED : BettingChartSize.DESKTOP_COMPACT
    })
  }

  // Update size on window resize
  // This can be removed
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      setChartSize(isMobile ? BettingChartSize.MOBILE_COMPACT : BettingChartSize.DESKTOP_EXPANDED)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fullEndTime = timeToMinutes(`${startTime.hour}:00`) + TOTAL_COLUMNS
  const BASE_TIME_RANGE = fullEndTime - timeToMinutes(`${startTime.hour}:00`)

  const gridDimensions = useMemo(
    () => ({
      rows: TOTAL_ROWS,
      cols: TOTAL_COLUMNS,
    }),
    [TOTAL_ROWS, TOTAL_COLUMNS],
  )

  // Update resetGame to ensure all state is properly reset
  const resetGame = (lastPrice: number) => {
    // Reset all state and refs
    setBasePrice(lastPrice)
    setRowHeightPriceValue(Number(lastPrice.toFixed(8)))
    basePriceRef.current = lastPrice
    priceRangeShiftRef.current = 0

    const totalRange = lastPrice * PADDING * 2

    // Reset chart bounds with new price
    setChartBounds({
      lowest: lastPrice - totalRange / 2,
      highest: lastPrice + totalRange / 2,
    })

    // Reset line data with new starting point
    setLineData([
      {
        time: new Date().toTimeString().slice(0, 8),
        price: lastPrice,
        index: 0,
      },
    ])

    // Clear predictions and confirmation
    setPredictions([])
    setConfirmationCell(null)

    // Update start time
    setStartTime(getCurrentTime())
  }

  // Check and update price range on Y axis
  // This is used to shift predictions and confirmation cell when the price range changes
  // For example, when the price is higher than the highest price in the chart, we shift the predictions and confirmation cell down
  // When the price is lower than the lowest price in the chart, we shift the predictions and confirmation cell up
  const checkAndUpdatePriceRange = ({ currentPrice, currentBaseprice, chartBounds }: { currentPrice: number; currentBaseprice: number | null; chartBounds: ChartBounds }) => {
    if (!currentBaseprice || !currentPrice) return

    if (currentPrice > (isCompactMode ? chartBounds.highest - rowHeightPriceValue * 3 : chartBounds.highest)) {
      priceRangeShiftRef.current += 1
      setChartBounds({
        lowest: chartBounds.lowest + rowHeightPriceValue,
        highest: chartBounds.highest + rowHeightPriceValue,
      })

      // Shift predictions down by one row
      setPredictions((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y - 1,
          }))
          .filter((p) => p.y >= 0),
      ) // Filter out predictions that would go out of bounds

      // Shift confirmation cell if it exists
      if (confirmationCell) {
        setConfirmationCell((prev) =>
          prev
            ? {
                ...prev,
                row: prev.row - 1,
              }
            : null,
        )
      }
    } else if (currentPrice < (isCompactMode ? chartBounds.lowest + rowHeightPriceValue * 3 : chartBounds.lowest)) {
      priceRangeShiftRef.current -= 1
      setChartBounds({
        lowest: chartBounds.lowest - rowHeightPriceValue,
        highest: chartBounds.highest - rowHeightPriceValue,
      })

      // Shift predictions up by one row
      setPredictions((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + 1,
          }))
          .filter((p) => p.y < TOTAL_ROWS),
      ) // Remove predictions that would go out of bounds

      // Shift confirmation cell if it exists
      if (confirmationCell) {
        setConfirmationCell((prev) =>
          prev
            ? {
                ...prev,
                row: prev.row + 1,
              }
            : null,
        )
      }
    }
  }

  const getRowPriceBounds = (row: number) => {
    return {
      lowerBound: chartBounds.lowest + row * rowHeightPriceValue,
      upperBound: chartBounds.lowest + (row + 1) * rowHeightPriceValue,
    }
  }

  // Connection to web socket on tokenCode update, which is only on initial render
  // This can be optimized by directly connecting to the socket on tokenCode update
  useEffect(() => {
    let socket: WebSocket | null = null

    const connectWebSocket = () => {
      socket = new WebSocket(`wss://stream.binance.com:9443/ws/${tokenCode}@kline_1m`)
      let isFirstMessage = true

      socket.onopen = () => {
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const kline = data.k
        const price = parseFloat(kline.c)

        latestPriceRef.current = price

        if (isFirstMessage) {
          gameStartTimeRef.current = Date.now()
          setBasePrice(price)
          basePriceRef.current = price

          // Set initial chart bounds on first message
          const totalRange = price * PADDING * 2
          setChartBounds({
            lowest: price - totalRange / 2,
            highest: price + totalRange / 2,
          })

          // Set cell height value based on total range and number of rows
          // Use desktop expanded rows as a base for all calculations
          const cellHeight = totalRange / CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].rows

          setRowHeightPriceValue(cellHeight)

          setLineData([
            {
              time: new Date(kline.t).toTimeString().slice(0, 8),
              price,
              index: 0,
            },
          ])
          setIsLoading(false)
          isFirstMessage = false
        }
      }

      socket.onerror = (err) => {
        setIsConnected(false)
        console.error('WebSocket connection error:', err)
      }

      socket.onclose = () => {
        setIsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [tokenCode])

  // Update the interval effect to properly handle game reset
  useEffect(() => {
    if (chartBounds.lowest === 0) return

    const intervalId = setInterval(() => {
      if (latestPriceRef.current === null) return

      // Calculate current position
      const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000
      const newIndex = Math.floor(elapsedSeconds / SECONDS_PER_CELL_BLOCK) + (elapsedSeconds % SECONDS_PER_CELL_BLOCK) / SECONDS_PER_CELL_BLOCK

      // Check if we need to reset the game
      if (newIndex >= TOTAL_COLUMNS) {
        // Reset game with latest price
        gameStartTimeRef.current = Date.now() // Update start time first
        resetGame(latestPriceRef.current)
        return // Skip the rest of the update for this tick
      }

      // Regular price range and line data updates
      checkAndUpdatePriceRange({
        currentBaseprice: basePriceRef.current,
        currentPrice: latestPriceRef.current,
        chartBounds,
      })

      setLineData((prev) => [
        ...prev,
        {
          time: new Date().toTimeString().slice(0, 8),
          price: latestPriceRef.current!,
          index: newIndex,
        },
      ])
    }, 1000)

    return () => clearInterval(intervalId)
    // disabling lints for warning about seconds per cell block until turbo mode and sizes are implemented
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOTAL_COLUMNS, SECONDS_PER_CELL_BLOCK, chartBounds])

  // Handle cell click
  const handleCellClick = (col: number, row: number, isBettingDisabled: boolean, multiplier: string) => {
    if (isBettingDisabled) return

    const existingBet = findBetAtPosition(col, row)
    const isPredicted = predictions.some((p) => p.x === col && p.y === row)

    // If cell has a bet and is marked for removal, show confirmation dialog
    if (existingBet && existingBet.id === removingBetId) {
      setBetToCancel(existingBet) // This will trigger the confirmation dialog
      return
    }

    // If cell has a bet and is predicted, mark it for removal
    if (isPredicted && existingBet) {
      setRemovingBetId(existingBet.id)
      setConfirmationCell(null)
      return
    }

    // Reset removing state when clicking elsewhere
    setRemovingBetId(null)

    // Regular bet placement logic
    if (confirmationCell?.col === col && confirmationCell?.row === row) {
      const pool = bettingPools[col]
      if (!pool || !basePrice) return

      const bounds = getRowPriceBounds(row)

      if (latestPriceRef.current) {
        const bet = placeBet(
          pool.poolKey,
          {
            lowerBound: Number(bounds.lowerBound.toFixed(5)),
            upperBound: Number(bounds.upperBound.toFixed(5)),
          },
          selectedAmount,
        )

        console.log('Bet placed successfully:', bet)
        const newBet = {
          id: generateRandomId(),
          amount: bet.amount,
          multiplier: multiplier,
          time: new Date().toTimeString().slice(0, 8),
          position: { col, row },
          tokenCode: tokenCode,
        }

        setUserBets([newBet, ...userBets])
        setPredictions((prev) => [...prev, { x: col, y: row }])
      }

      setConfirmationCell(null)
    } else {
      setConfirmationCell({ col, row })
    }
  }

  // Calculate visible range for the y-axis
  const getYAxisMinAndMaxValues = () => {
    if (chartSize === BettingChartSize.DESKTOP_EXPANDED || chartSize === BettingChartSize.MOBILE_EXPANDED) {
      return [chartBounds.lowest, chartBounds.highest]
    }

    // For compact mode, calculate visible range
    const totalRange = chartBounds.highest - chartBounds.lowest
    const rowHeight = totalRange / CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].rows
    const visibleStart = chartBounds.lowest + visibleRowRange.start * rowHeight
    const visibleEnd = chartBounds.lowest + visibleRowRange.end * rowHeight

    return [visibleStart, visibleEnd]
  }

  // Calculate rectangles for betting cells
  // This is the main logic for the betting chart
  // It calculates the rectangles for each cell based on the chart size, visible row range, and predictions
  // This should be optimized, since we have 2 loops
  // For example, we can optimize this in a way to check and update only active columns, instead of checking all columns all the time
  const rectangles = useMemo<Rectangle[]>(() => {
    const timePerIndex = BASE_TIME_RANGE / TOTAL_COLUMNS

    return Array.from({ length: TOTAL_COLUMNS }, (_, col) => {
      const startTime = col
      const endTime = col + 1
      const startIndex = Math.floor(startTime / timePerIndex)
      const endIndex = Math.floor(endTime / timePerIndex)

      // Check if this column is within our line data range
      const isBettingDisabled = lineData.length > 0 && col <= Math.floor(lineData[lineData.length - 1].index)

      // Define array of indexes of rows to render
      const rowsToRender =
        chartSize === BettingChartSize.DESKTOP_COMPACT || chartSize === BettingChartSize.MOBILE_COMPACT
          ? Array.from({ length: visibleRowRange.end - visibleRowRange.start }, (_, i) => i + visibleRowRange.start)
          : Array.from({ length: TOTAL_ROWS }, (_, i) => i)

      return rowsToRender.map((absoluteRow, displayIndex): Rectangle => {
        // Calculate relative positions (0-1 range)
        const rowCount = CHART_CONFIGS[chartSize].rows

        // Get the visible range for Y axis
        const [yMin, yMax] = getYAxisMinAndMaxValues()
        const totalYRange = yMax - yMin

        // Calculate y coordinates scaled to the chart range
        const yStart = yMin + (displayIndex / rowCount) * totalYRange
        const yEnd = yMin + ((displayIndex + 1) / rowCount) * totalYRange

        // Calculate actual price bounds for betting logic
        const priceBounds = getRowPriceBounds(absoluteRow)

        // Rest of rectangle properties using absoluteRow for betting logic
        const isPredicted = predictions.some((p) => p.x === col && p.y === absoluteRow)
        const isAwaitingConfirmation = confirmationCell?.col === col && confirmationCell?.row === absoluteRow
        const existingBet = findBetAtPosition(col, absoluteRow)
        const isRemoving = existingBet?.id === removingBetId

        // Calculate multiplier using absolute row (not display position)
        const middleRow = Math.floor(gridDimensions.rows / 2)
        const distanceFromMiddle = Math.abs(absoluteRow - middleRow)
        const multiplier = distanceFromMiddle === 0 ? MULTIPLIER_CONFIG.BASE : MULTIPLIER_CONFIG.BASE + distanceFromMiddle * MULTIPLIER_CONFIG.INCREMENT
        const multiplierLabel = multiplier.toFixed(MULTIPLIER_CONFIG.FORMAT_DECIMALS)

        return {
          x1: startIndex,
          x2: endIndex,
          y1: yStart,
          y2: yEnd,
          col,
          row: absoluteRow,
          isPredicted,
          isBettingDisabled,
          isAwaitingConfirmation,
          label: isBettingDisabled ? '' : isRemoving ? 'REMOVE' : isAwaitingConfirmation ? (isPredicted ? 'REMOVE' : 'CONFIRM') : `${multiplierLabel}x`,
          totalPrice: 100,
          borderColor: isBettingDisabled ? '#4A2424' : '#2C2C2C',
          innerBorderColor: isBettingDisabled ? '#2D1717' : '#19181C',
          userAvatars: (bettingPools[col] as any)?.bets?.map((bet: any) => bet.userAvatar) || [],
          multiplier: multiplierLabel,
          priceBounds,
          isFull: false, // update from BE request
        }
      })
    }).flat()
  }, [BASE_TIME_RANGE, confirmationCell, gridDimensions, predictions, lineData, chartSize, visibleRowRange, removingBetId, userBets])

  // SVG defs which are used for styling cells
  // These are patterns and gradients which we use so we don't have to add space between cells and
  // risk having gaps between cells
  const svgDefs = (
    <defs>
      {/* Base gradients */}
      <linearGradient id={`defaultGradient-${tokenCode}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A3940" />
        <stop offset="100%" stopColor="#2A292F" />
      </linearGradient>

      <linearGradient id={`predictedGradient-${tokenCode}`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#8C421D" />
        <stop offset="20%" stopColor="#8C421D" />
        <stop offset="40%" stopColor="#FBE67B" />
        <stop offset="50%" stopColor="#FCFBE7" />
        <stop offset="80%" stopColor="#F7D14E" />
        <stop offset="100%" stopColor="#D4A041" />
      </linearGradient>

      <linearGradient id={`confirmingGradient-${tokenCode}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDC214" />
        <stop offset="100%" stopColor="#FFF369" />
      </linearGradient>

      {/* <pattern id={`hatchPattern-${tokenCode}`} patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#1A191E" strokeWidth="1" />
      </pattern> */}

      {/* Create patterns for both modes */}
      {[true, false].map((isCompact) => {
        const dims = getCellDimensions(isCompact)

        return (
          <React.Fragment key={`cellPattern-${tokenCode}-${isCompact}`}>
            {/* Default clickable cell */}
            <pattern id={`cellPattern-default-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#2C2C2C" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#111111" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#27262C" />
            </pattern>

            {/* Full cell (not clickable) */}
            <pattern id={`cellPattern-full-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#2C2C2C" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#111111" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#27262C" />
            </pattern>

            {/* Past not predicted */}
            <pattern id={`cellPattern-past-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#382328" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#2D1717" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#382328" />
            </pattern>

            {/* Past correctly predicted */}
            <pattern id={`cellPattern-past-predicted-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#382328" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#2D1717" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#382328" />
              {/* <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#00CA5E" fillOpacity="0.2" /> */}
            </pattern>

            {/* Future with placed bet */}
            <pattern id={`cellPattern-predicted-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#2C2C2C" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#111111" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill={`url(#predictedGradient-${tokenCode})`} />
            </pattern>

            {/* Confirming state */}
            <pattern id={`cellPattern-confirming-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#2C2C2C" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#111111" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill={`url(#confirmingGradient-${tokenCode})`} />
            </pattern>
          </React.Fragment>
        )
      })}
    </defs>
  )

  // Loading state
  if (isLoading || !isConnected) {
    return (
      <div>
        <ChartHeader title={tokenName} lineData={lineData} selectedAmount={selectedAmount} setSelectedAmount={setSelectedAmount} showLogo={showLogo} />
        <div className="container mx-auto">
          <div className="rounded-lg w-full">
            <div className="items-center gap-4 w-full relative p-2.5" style={{ width: '100%', height: '100%' }}>
              <div className="flex flex-col justify-center items-center gap-4 aspect-[1.5/1]">
                <div className="w-8 h-8 border-4 border-[#FFA163] border-t-transparent rounded-full animate-spin" />
                <div className="text-[#FFA163]">Loading market data...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div>
      <ChartHeader title={tokenName} lineData={lineData} selectedAmount={selectedAmount} setSelectedAmount={setSelectedAmount} showLogo={showLogo} />
      <div className={`${isMobile ? 'w-full' : 'container mx-auto'}`}>
        <div className={`rounded-lg ${isMobile ? 'w-full' : 'w-fit'}`}>
          <div className={`relative w-full sm:p-2.5`}>
            {/* We use width: 100% make the chart responsive, while keeping specific width for the logic and svg stiling */}
            <LineChart
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              data={lineData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              className="w-full"
              style={{ width: '100%', height: '100%' }}
            >
              {svgDefs}

              {/* Betting cells */}
              {rectangles.map((rect) => (
                <React.Fragment key={`${tokenCode}-${rect.col}-${rect.row}`}>
                  <ReferenceArea
                    x1={rect.x1}
                    x2={rect.x2}
                    y1={rect.y1}
                    y2={rect.y2}
                    className={`
                      betting-cell
                      ${rect.isBettingDisabled ? 'betting-cell--crossed' : ''}
                      ${confirmationCell?.col === rect.col && confirmationCell?.row === rect.row ? 'betting-cell--confirming' : ''}
                      ${rect.isPredicted ? 'betting-cell--predicted' : ''}
                    `}
                    fillOpacity={1}
                    strokeWidth={0}
                    fill={
                      rect.isFull
                        ? `url(#cellPattern-full-${tokenCode})`
                        : rect.isPredicted
                        ? rect.isBettingDisabled
                          ? `url(#cellPattern-past-predicted-${tokenCode})`
                          : `url(#cellPattern-predicted-${tokenCode})`
                        : rect.isBettingDisabled
                        ? `url(#cellPattern-past-${tokenCode})`
                        : confirmationCell?.col === rect.col && confirmationCell?.row === rect.row
                        ? `url(#cellPattern-confirming-${tokenCode})`
                        : `url(#cellPattern-default-${tokenCode})`
                    }
                    onClick={() => {
                      handleCellClick(rect.col, rect.row, rect.isBettingDisabled, rect.multiplier)
                    }}
                    style={{ pointerEvents: 'all' }}
                    label={{
                      value: rect.label,
                      position: 'center',
                      content: (props) => (
                        <CustomLabel
                          {...props}
                          totalPrice={rect.totalPrice}
                          chartSize={chartSize}
                          cellState={
                            rect.isFull
                              ? 'full'
                              : rect.isBettingDisabled && rect.isPredicted
                              ? 'past-won'
                              : rect.isBettingDisabled
                              ? 'past-lost'
                              : confirmationCell?.col === rect.col && confirmationCell?.row === rect.row
                              ? rect.isPredicted
                                ? 'remove'
                                : 'confirm'
                              : 'default'
                          }
                        />
                      ),
                    }}
                  />
                  {/* Fire emoji for predicted cells */}
                  {rect.isPredicted && checkIfCellIsActive(rect, lineData) && (
                    <ReferenceArea
                      x1={rect.x1}
                      x2={rect.x2}
                      y1={rect.y1}
                      y2={rect.y2}
                      fill="transparent"
                      stroke="none"
                      style={{ pointerEvents: 'none' }}
                      label={{
                        value: '🔥',
                        position: 'insideTopRight',
                        offset: 10,
                        fontSize: getImageDimensions(chartSize).fire.width,
                        fill: '#ffffff',
                      }}
                    />
                  )}
                  {/* User avatars */}
                  {rect.userAvatars?.length > 0 && (
                    <foreignObject x={rect.x1} y={rect.y1} width={(rect.x2 - rect.x1) * 0.8} height={(rect.y2 - rect.y1) * 0.3}>
                      <div className="flex -space-x-1 p-2">
                        {rect.userAvatars.slice(0, 3).map((avatar, index) => (
                          <img key={index} src={avatar} alt="User avatar" className="w-4 h-4 rounded-full ring-2 ring-[#27262c]" />
                        ))}
                        {rect.userAvatars.length > 3 && (
                          <div className="w-4 h-4 rounded-full bg-gray-700 ring-2 ring-[#27262c] flex items-center justify-center text-[10px] text-white">
                            +{rect.userAvatars.length - 3}
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  )}
                </React.Fragment>
              ))}

              {/* X and Y axis */}
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, TOTAL_COLUMNS]}
                ticks={Array.from({ length: TOTAL_COLUMNS + 1 }, (_, i) => i)}
                tickFormatter={(index) => {
                  // Calculate total seconds from start
                  const totalSeconds = index * SECONDS_PER_CELL_BLOCK

                  // Calculate minutes
                  const minutes = Math.floor(totalSeconds / 60)

                  // Get the actual time by adding to start time
                  const totalMinutes = startTime.minute + minutes
                  const newHour = startTime.hour + Math.floor(totalMinutes / 60)
                  const newMinute = totalMinutes % 60

                  // Format as HH:MM:SS
                  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
                }}
                tickLine={true}
                stroke="#9ca3af"
                allowDataOverflow={true}
                hide={false}
              />
              <YAxis stroke="#9ca3af" domain={getYAxisMinAndMaxValues()} allowDataOverflow={true} scale="linear" hide={isMobile} />

              {/* Line chart */}
              <Line type="monotone" data={lineData} dataKey="price" stroke="#00CA5E" strokeWidth={4} dot={false} isAnimationActive={false} connectNulls={true} />

              {/* Next active column border */}
              {getActiveColumnBounds({
                lineData,
                chartBounds: {
                  lowest: isCompactMode ? chartBounds.lowest + rowHeightPriceValue * 3 : chartBounds.lowest,
                  highest: isCompactMode ? chartBounds.highest - rowHeightPriceValue * 3 : chartBounds.highest,
                },
              }) && (
                <ReferenceArea
                  {...getActiveColumnBounds({
                    lineData,
                    chartBounds: {
                      lowest: isCompactMode ? chartBounds.lowest + rowHeightPriceValue * 3 : chartBounds.lowest,
                      highest: isCompactMode ? chartBounds.highest - rowHeightPriceValue * 3 : chartBounds.highest,
                    },
                  })}
                  fill="none"
                  stroke="#FFCF00"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </LineChart>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-800 text-white rounded ml-auto block cursor-pointer" onClick={handleSizeToggle}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.95092 6.85714L6.85712 6.85714C7.17295 6.85714 7.42855 7.11274 7.42855 7.42857C7.42855 7.7444 7.17295 8 6.85712 8L1.05916 8C0.475966 8 6.58177e-07 7.52867 6.06788e-07 6.94084L9.99117e-08 1.14286C7.23008e-08 0.827026 0.255596 0.571429 0.571427 0.571429C0.887258 0.571429 1.14285 0.827026 1.14285 1.14286L1.14285 6.04908L7.02452 0.167395C7.24771 -0.0557983 7.60932 -0.0557983 7.83258 0.167395C8.05584 0.390588 8.05577 0.752202 7.83258 0.975462L1.95092 6.85714Z"
                    fill="#D9D9D9"
                    strokeWidth="0"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <ChartFooter tokenName={tokenName} /> */}
      <ConfirmationDialog
        isOpen={!!betToCancel}
        title="Cancel Bet"
        description="Are you sure you want to cancel this bet? A small fee will be charged."
        onConfirm={() => {
          if (betToCancel) {
            // Remove the bet
            setUserBets(userBets.filter((bet) => bet.id !== betToCancel.id))
            // Remove the prediction for this bet's position
            setPredictions(predictions.filter((p) => !(p.x === betToCancel.position?.col && p.y === betToCancel.position?.row)))
            setBetToCancel(null)
            setRemovingBetId(null) // Also reset the removing state
          }
        }}
        onCancel={() => {
          setBetToCancel(null)
          setRemovingBetId(null)
        }}
      />
    </div>
  )
}

export default BettingChart
