import { useCompetitionPools } from '@/hooks/queries'
import { useCreateBetBackend } from '@/hooks/use-create-bet-backend'
import { ConnectedSolanaWallet } from '@privy-io/react-auth'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { PublicKey } from '@solana/web3.js'
import React, { Dispatch, SetStateAction, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Line, LineChart, ReferenceArea, XAxis, YAxis } from 'recharts'
import { CHART_CONFIGS, MULTIPLIER_CONFIG, PADDING, SECONDS_PER_CELL_BLOCK } from '../../config'
import { useBettingData } from '../../hooks/useBettingData'
import { useColumnData } from '../../hooks/useColumnData'
import { MockData } from '../../mockdata'
import { BettingChartSize, ColumnData, UserBet } from '../../types'
import { generateRandomId, getCurrentTime, timeToMinutes } from '../../utils'
import { useGetBalance } from '../account/account-data-access'
import { ConfirmationDialog } from '../dialog/ConfirmationDialog'
import './BettingChart.css'
import ChartFooter from './components/ChartFooter'
import { ChartHeader } from './components/ChartHeader'
import { getCellDimensions, getImageDimensions } from './dimensions'
import { rectangleReducer } from './rectangleReducer'
import { ChartBounds, Rectangle } from './types'
import { BananaTime, getActiveColumnBounds } from './utils'
import bananaSmiling from '/assets/images/banana-smiling.png'
import fullCellPool from '/assets/svg/full-cell-pool.svg'

export interface Props {
  tokenCode: string
  tokenName: string
  competitionKey?: string
  userBets: UserBet[]
  setUserBets: Dispatch<SetStateAction<UserBet[]>>
  showLogo?: boolean
  priceFeedId: string
  embeddedWallet: ConnectedSolanaWallet | null
  idx: number
  startTime: BananaTime
  setStartTime: Dispatch<SetStateAction<BananaTime>>
}

// Update the CustomLabel component to use chartSize instead of isCompactMode
const CustomLabel = (props: any) => {
  const { viewBox, value, cellState, chartSize, totalPrice, amount } = props
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
      return (
        <g transform={`translate(${x},${y})`}>
          <text textAnchor="middle" dominantBaseline="middle" className="betting-cell__label betting-cell__label--confirming">
            {value}
          </text>
        </g>
      )

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
      { const isPredicted = cellState === 'predicted' || props?.isPredicted
      return (
        <g transform={`translate(${x},${y})`}>
          {amount ? (
            <>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className={`
              betting-cell__price 
              betting-cell__price--default
              ${isPredicted ? 'betting-cell__price--predicted' : ''}
              ${chartSize === BettingChartSize.MOBILE_EXPANDED ? 'betting-cell__price--mobile-expanded' : ''}
              amount-label
            `}
                dy="-0.5em"
              >
                ${amount}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className={`
              betting-cell__label 
              betting-cell__label--default 
              ${isPredicted ? 'betting-cell__label--predicted' : ''}
              ${chartSize === BettingChartSize.MOBILE_EXPANDED ? 'betting-cell__label--mobile-expanded' : ''}
            `}
                dy="0.5em"
              >
                {value}
              </text>
            </>
          ) : (
            <>
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
                {value}
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
            </>
          )}
        </g>
      ) }
  }
}

function BettingChart({ tokenCode, tokenName, competitionKey = MockData.competition.competitionKey, userBets, setUserBets, showLogo = false, priceFeedId , embeddedWallet, idx, startTime, setStartTime }: Props) {
  const priceRangeShiftRef = useRef(0)
  const basePriceRef = useRef<number | null>(null)
  const latestPriceRef = useRef<number | null>(null)
  const gameStartTimeRef = useRef<number>(Date.now())
  const { createBet, cancelBet } = useCreateBetBackend();
  const { data: competitionPools } = useCompetitionPools(competitionKey ? new PublicKey(competitionKey) : null);


  const [gridState, dispatch] = useReducer(rectangleReducer, {
    cells: {},
    activeColumn: 0,
    lastPrice: 0,
    chartBounds: { lowest: 0, highest: 1 },
    lineData: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(1)
  const [chartSize, setChartSize] = useState<BettingChartSize>(BettingChartSize.DESKTOP_COMPACT)
  // const [startTime, setStartTime] = useState(getStartTime())
  const [rowHeightPriceValue, setRowHeightPriceValue] = useState(0)
  const [removingBetId, setRemovingBetId] = useState<string | null>(null)
  const [betToCancel, setBetToCancel] = useState<UserBet | null>(null)

  const [colData, setColData] = useState<ColumnData | null>(null)

  const { bettingPools, placeBet } = useBettingData(competitionKey)
  
  const { columnData, isLoading: isColumnDataLoading } = useColumnData(competitionKey,competitionPools)

  const currentConfig = CHART_CONFIGS[chartSize]
  const CHART_HEIGHT = currentConfig.height
  const CHART_WIDTH = currentConfig.width
  const TOTAL_ROWS = currentConfig.rows
  const TOTAL_COLUMNS = currentConfig.cols

  const isCompactMode = chartSize === BettingChartSize.DESKTOP_COMPACT || chartSize === BettingChartSize.MOBILE_COMPACT

  const isMobile = chartSize === BettingChartSize.MOBILE_COMPACT || chartSize === BettingChartSize.MOBILE_EXPANDED

  const { refetch: refetchBalance} = useGetBalance({
    address: new PublicKey(
      embeddedWallet?.address || '6oMF85KwcY57VaweFE7JNeziNaVRdCKHzNLpARdG9mMw'
    )
  });

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
      setChartSize(isMobile ? BettingChartSize.MOBILE_COMPACT : BettingChartSize.DESKTOP_COMPACT)
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
    dispatch({ type: 'RESET_GAME', price: lastPrice })
    basePriceRef.current = lastPrice
    priceRangeShiftRef.current = 0

    const totalRange = lastPrice * PADDING * 2

    // Reset chart bounds with new price
    dispatch({ type: 'UPDATE_CHART_BOUNDS', lowest: lastPrice - totalRange / 2, highest: lastPrice + totalRange / 2 })

    // Update start time
    setStartTime(getCurrentTime())

    // Clear user bets for this token
    setUserBets((prevBets) => prevBets.filter((bet) => bet.tokenCode !== tokenCode))
  }

  // Check and update price range on Y axis
  // This is used to shift predictions and confirmation cell when the price range changes
  // For example, when the price is higher than the highest price in the chart, we shift the predictions and confirmation cell down
  // When the price is lower than the lowest price in the chart, we shift the predictions and confirmation cell up
  const checkAndUpdatePriceRange = ({ currentPrice, currentBaseprice, chartBounds }: { currentPrice: number; currentBaseprice: number | null; chartBounds: ChartBounds }) => {
    if (!currentBaseprice || !currentPrice) return

    if (currentPrice > (isCompactMode ? chartBounds.highest - rowHeightPriceValue * 3 : chartBounds.highest)) {
      priceRangeShiftRef.current += 1
      dispatch({ type: 'UPDATE_CHART_BOUNDS', lowest: chartBounds.lowest + rowHeightPriceValue, highest: chartBounds.highest + rowHeightPriceValue })

      // Shift predictions and bets down by one row
      dispatch({ type: 'SHIFT_PREDICTIONS', shift: 1 })
      // Update user bets positions
      setUserBets((prevBets) =>
        prevBets.map((bet) => ({
          ...bet,
          position: bet.position
            ? {
                ...bet.position,
                row: bet.position.row - 1, // Shift down (subtract because grid goes up)
              }
            : bet.position,
        })),
      )
    } else if (currentPrice < (isCompactMode ? chartBounds.lowest + rowHeightPriceValue * 3 : chartBounds.lowest)) {
      priceRangeShiftRef.current -= 1
      dispatch({ type: 'UPDATE_CHART_BOUNDS', lowest: chartBounds.lowest - rowHeightPriceValue, highest: chartBounds.highest - rowHeightPriceValue })

      // Shift predictions and bets up by one row
      dispatch({ type: 'SHIFT_PREDICTIONS', shift: -1 })
      // Update user bets positions
      setUserBets((prevBets) =>
        prevBets.map((bet) => ({
          ...bet,
          position: bet.position
            ? {
                ...bet.position,
                row: bet.position.row + 1, // Shift up (add because grid goes up)
              }
            : bet.position,
        })),
      )
    }
  }

  const getRowPriceBounds = (row: number) => {
    return {
      lowerBound: gridState.chartBounds.lowest + row * rowHeightPriceValue,
      upperBound: gridState.chartBounds.lowest + (row + 1) * rowHeightPriceValue,
    }
  }

  // Connection to web socket on tokenCode update, which is only on initial render
  // This can be optimized by directly connecting to the socket on tokenCode update
   // Replace Binance WebSocket useEffect with Pyth connection
   useEffect(() => {
    let connection: PriceServiceConnection | null = null
    let isFirstMessage = true

    const connectPyth = async () => {
      try {
        connection = new PriceServiceConnection("https://hermes.pyth.network")
        
        const handlePriceUpdate = (priceFeed: any) => {
          const priceData = priceFeed.getPriceUnchecked()
          if (!priceData) return
          
          const price = parseFloat(priceData.price) / Math.pow(10, Math.abs(priceData.expo))
          latestPriceRef.current = price

          if (isFirstMessage) {
            gameStartTimeRef.current = Date.now()
            dispatch({ type: 'UPDATE_PRICE', price })
            basePriceRef.current = price

            const totalRange = price * PADDING * 2
            dispatch({ 
              type: 'UPDATE_CHART_BOUNDS', 
              lowest: price - totalRange/2, 
              highest: price + totalRange/2 
            })

            const cellHeight = totalRange / CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].rows
            setRowHeightPriceValue(cellHeight)

            dispatch({
              type: 'ADD_LINE_DATA',
              data: {
                time: new Date().toTimeString().slice(0, 8),
                price,
                index: 0,
              },
            })
            setIsLoading(false)
            isFirstMessage = false
          }
        }

        // Initial price fetch
        const currentPrices = await connection.getLatestPriceFeeds([priceFeedId])
        if (currentPrices?.[0]) {
          handlePriceUpdate(currentPrices[0])
        }

        // Subscribe to updates
        connection.subscribePriceFeedUpdates(
          [priceFeedId], 
          handlePriceUpdate
        )

        setIsConnected(true)
      } catch (err) {
        console.error('Pyth connection error:', err)
        setIsConnected(false)
      }
    }

    connectPyth()

    return () => {
      if (connection) {
        connection.closeWebSocket()
      }
    }
  }, [priceFeedId]) // Watch priceFeedId changes

  // First, let's modify the interval effect to properly track the active column
  useEffect(() => {
    if (gridState.chartBounds.lowest === 0) return

    const intervalId = setInterval(() => {
      if (latestPriceRef.current === null) return

      // Calculate current position
      const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000
      const newIndex = Math.floor(elapsedSeconds / SECONDS_PER_CELL_BLOCK)

      // Check if we need to reset the game
      if (newIndex >= TOTAL_COLUMNS) {
        gameStartTimeRef.current = Date.now()
        resetGame(latestPriceRef.current)
        return
      }

      // If we've moved to a new column, advance the active column
      if (newIndex > gridState.activeColumn) {
        dispatch({ type: 'ADVANCE_COLUMN', price: latestPriceRef.current })
      }

      // Regular price range and line data updates
      checkAndUpdatePriceRange({
        currentBaseprice: basePriceRef.current,
        currentPrice: latestPriceRef.current,
        chartBounds: gridState.chartBounds,
      })

      dispatch({
        type: 'ADD_LINE_DATA',
        data: {
          time: new Date().toTimeString().slice(0, 8),
          price: latestPriceRef.current,
          index: newIndex + (elapsedSeconds % SECONDS_PER_CELL_BLOCK) / SECONDS_PER_CELL_BLOCK,
        },
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [TOTAL_COLUMNS, SECONDS_PER_CELL_BLOCK, gridState.chartBounds, gridState.activeColumn])

  // Then update the handleCellClick function
  const handleCellClick = async (col: number, row: number, isBettingDisabled: boolean, multiplier: string, isFull: boolean) => {
    if (isBettingDisabled || isFull) return
    setColData(columnData[col])
    if (!colData) {
      console.error('No column data found for column:', col)
      return
    }

    const existingBet = findBetAtPosition(col, row)
    const isPredicted = gridState.cells[`${col}-${row}`]?.isPredicted

    // If cell has a bet and is marked for removal, show confirmation dialog
    if (existingBet && existingBet.id === removingBetId) {
      setBetToCancel(existingBet)
      return
    }

    // If cell has a bet and is predicted, mark it for removal
    if (isPredicted && existingBet) {
      setRemovingBetId(existingBet.id)
      dispatch({ type: 'REMOVE_BET', col, row })
      return
    }

    // Reset removing state when clicking elsewhere
    setRemovingBetId(null)

    // Regular bet placement logic
    if (gridState.cells[`${col}-${row}`]?.isAwaitingConfirmation) {
      console.log('💰', gridState.cells[`${col}-${row}`], bettingPools[col])

      const pool = bettingPools[col]
      if (!pool || !basePriceRef.current) return

      const bounds = getRowPriceBounds(row)

      if (latestPriceRef.current) {
        const bet = placeBet(
          colData.poolKey,
          {
            lowerBound: Number(bounds.lowerBound.toFixed(5)),
            upperBound: Number(bounds.upperBound.toFixed(5)),
          },
          selectedAmount,
        )

        const newBet: UserBet = {
          id: generateRandomId(),
          amount: bet.amount,
          multiplier: multiplier,
          time: new Date().toTimeString().slice(0, 8),
          position: { col, row },
          tokenCode: tokenCode,
          poolKey: colData.poolKey
        }

        setUserBets([newBet, ...userBets])
        dispatch({ type: 'ADD_BET', bet: newBet })
        dispatch({ type: 'REMOVE_CONFIRMATION_CELL', col, row })

        const createBetParam = {
          amount: 0.01,
          poolKey: colData.poolKey,
          competitionKey,
          lowerBoundPrice: bounds.lowerBound,
          upperBoundPrice: bounds.upperBound,
          leverageMultiplier: Number(newBet.multiplier),
        }

        if (!pool) return;

        await createBet.mutateAsync(createBetParam);
        await refetchBalance();
      }
    } else {
      console.log('SET_CONFIRMATION_CELL', col, row)
      dispatch({ type: 'SET_CONFIRMATION_CELL', col, row })
    }
  }

  // Calculate visible range for the y-axis
  const getYAxisMinAndMaxValues = () => {
    if (chartSize === BettingChartSize.DESKTOP_EXPANDED || chartSize === BettingChartSize.MOBILE_EXPANDED) {
      return [gridState.chartBounds.lowest, gridState.chartBounds.highest]
    }

    // For compact mode, calculate visible range
    const totalRange = gridState.chartBounds.highest - gridState.chartBounds.lowest
    const rowHeight = totalRange / CHART_CONFIGS[BettingChartSize.DESKTOP_EXPANDED].rows
    const visibleStart = gridState.chartBounds.lowest + visibleRowRange.start * rowHeight
    const visibleEnd = gridState.chartBounds.lowest + visibleRowRange.end * rowHeight

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
      const colData = columnData[col] || {}
      const startTime = col
      const endTime = col + 1
      const startIndex = Math.floor(startTime / timePerIndex)
      const endIndex = Math.floor(endTime / timePerIndex)

      // Check if this column is within our line data range
      const isBettingDisabled = col <= gridState.activeColumn

      // Get all prices for this column if it's a past column
      const columnPrices = isBettingDisabled ? gridState.lineData.filter((data) => Math.floor(data.index) === col).map((data) => data.price) : []

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
        const isPredicted = gridState.cells[`${col}-${absoluteRow}`]?.isPredicted
        const isAwaitingConfirmation = gridState.cells[`${col}-${absoluteRow}`]?.isAwaitingConfirmation
        const existingBet = findBetAtPosition(col, absoluteRow)
        const isRemoving = existingBet?.id === removingBetId

        // Calculate multiplier using absolute row (not display position)
        const middleRow = Math.floor(gridDimensions.rows / 2)
        const distanceFromMiddle = Math.abs(absoluteRow - middleRow)
        const multiplier = distanceFromMiddle === 0 ? MULTIPLIER_CONFIG.BASE : MULTIPLIER_CONFIG.BASE + distanceFromMiddle * MULTIPLIER_CONFIG.INCREMENT
        const multiplierLabel = multiplier.toFixed(MULTIPLIER_CONFIG.FORMAT_DECIMALS)

        // Calculate if the prediction was correct for past cells
        let isCorrectlyPredicted = false
        if (isPredicted && isBettingDisabled && columnPrices.length > 0) {
          isCorrectlyPredicted = columnPrices.some((price) => price >= priceBounds.lowerBound && price <= priceBounds.upperBound)
        }

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
          isCorrectlyPredicted,
          label: isBettingDisabled ? '' : isRemoving ? 'REMOVE' : isAwaitingConfirmation ? 'CONFIRM' : `${multiplierLabel}x`,
          totalPrice: 100,
          borderColor: isBettingDisabled ? '#4A2424' : '#2C2C2C',
          innerBorderColor: isBettingDisabled ? '#2D1717' : '#19181C',
          userAvatars: colData.bets?.map((bet) => bet.userAvatar ?? '').filter(Boolean) || [],
          multiplier: multiplierLabel,
          priceBounds,
          isFull: colData.isFull || false,
          isRemoving,
          amount: existingBet?.amount,
          isHot: colData.isHot || false,
          totalBets: colData.totalBets || 0,
          poolKey: colData.poolKey,
        }
      })
    }).flat()
  }, [
    BASE_TIME_RANGE,
    gridState.cells,
    gridState.activeColumn,
    gridState.chartBounds,
    gridDimensions,
    gridState.lineData,
    chartSize,
    visibleRowRange,
    removingBetId,
    userBets,
    rowHeightPriceValue,
    columnData,
    competitionKey,
    selectedAmount,
  ])

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
            <pattern id={`cellPattern-past-correctly-predicted-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
              <rect width={dims.outerBorder.width} height={dims.outerBorder.height} x={dims.outerBorder.x} y={dims.outerBorder.y} fill="#382328" />
              <rect width={dims.innerBorder.width} height={dims.innerBorder.height} x={dims.innerBorder.x} y={dims.innerBorder.y} rx={dims.innerBorder.radius} fill="#2D1717" />
              <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#382328" />
              {/* <rect width={dims.fill.width} height={dims.fill.height} x={dims.fill.x} y={dims.fill.y} rx={dims.fill.radius} fill="#00CA5E" fillOpacity="0.2" /> */}
            </pattern>

            {/* Past incorrectly predicted */}
            <pattern id={`cellPattern-past-incorrectly-predicted-${tokenCode}`} patternUnits="objectBoundingBox" width="1" height="1" patternContentUnits="objectBoundingBox">
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

  const checkPredictionState = (rect: Rectangle) => {
    if (rect.isFull) return 'full'
    if (rect.isBettingDisabled && rect.isPredicted && rect.isCorrectlyPredicted) return 'past-won'
    if (rect.isBettingDisabled) return 'past-lost'
    if (rect.isRemoving) return 'remove'
    if (gridState.cells[`${rect.col}-${rect.row}`]?.isAwaitingConfirmation) {
      return 'confirm'
    }
    if (rect.isPredicted) return 'predicted'
    return 'default'
  }

  // Add this function near checkPredictionState
  const getCellPattern = (rect: Rectangle, tokenCode: string) => {
    if (rect.isFull) {
      return `url(#cellPattern-full-${tokenCode})`
    }

    if (rect.isRemoving) {
      return `url(#cellPattern-confirming-${tokenCode})`
    }

    if (gridState.cells[`${rect.col}-${rect.row}`]?.isAwaitingConfirmation) {
      return `url(#cellPattern-confirming-${tokenCode})`
    }

    if (rect.isPredicted) {
      if (rect.isBettingDisabled) {
        return `url(#cellPattern-past-correctly-predicted-${tokenCode})`
      }
      return `url(#cellPattern-predicted-${tokenCode})`
    }

    if (rect.isBettingDisabled) {
      return `url(#cellPattern-past-${tokenCode})`
    }

    return `url(#cellPattern-default-${tokenCode})`
  }

  // Loading state
  if (isLoading || isColumnDataLoading || !isConnected) {
    return (
      <div className="w-full">
        <ChartHeader title={tokenName} lineData={gridState.lineData} selectedAmount={selectedAmount} setSelectedAmount={setSelectedAmount} showLogo={showLogo} />
        <div className="container mx-auto w-full">
          <div className="rounded-lg w-full">
            <div className="items-center gap-4 w-full relative p-2.5" style={{ width: '100%', height: '100%' }}>
              <div className="flex flex-col justify-center items-center gap-4 aspect-[1.5/1]">
                <div className="w-8 h-8 border-4 border-[#FFA163] border-t-transparent rounded-full animate-spin" />
                <div className="text-[#FFA163]">Loading market data...</div>
              </div>
            </div>
          </div>
        </div>
        <ChartFooter tokenName={tokenName}  idx={idx}/>
      </div>
    )
  }

  // Main render
  return (
    <div className="w-full">
      <ChartHeader title={tokenName} lineData={gridState.lineData} selectedAmount={selectedAmount} setSelectedAmount={setSelectedAmount} showLogo={showLogo} />
      <div className={`${isMobile ? 'w-full' : 'container mx-auto'}`}>
        <div className={`rounded-lg ${isMobile ? 'w-full' : 'w-fit'}`}>
          <div className={`relative w-full sm:p-2.5 border-[5px] border-solid border-black bg-[#2C2C2C]`}>
            {/* We use width: 100% make the chart responsive, while keeping specific width for the logic and svg stiling */}
            <LineChart
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              data={gridState.lineData}
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
                      ${gridState.cells[`${rect.col}-${rect.row}`]?.isAwaitingConfirmation ? 'betting-cell--confirming' : ''}
                      ${rect.isPredicted ? 'betting-cell--predicted' : ''}
                    `}
                    fillOpacity={1}
                    strokeWidth={0}
                    fill={getCellPattern(rect, tokenCode)}
                    onClick={() => {
                      handleCellClick(rect.col, rect.row, rect.isBettingDisabled, rect.multiplier, rect.isFull || false)
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
                          cellState={checkPredictionState(rect)}
                          isRemoving={rect.isRemoving}
                          amount={rect.amount}
                          isHot={rect.isHot}
                        />
                      ),
                    }}
                  />
                  {/* Fire emoji for predicted cells */}
                  {rect.isHot && chartSize !== BettingChartSize.MOBILE_EXPANDED && (
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
                        offset: 15,
                        dx: chartSize === BettingChartSize.DESKTOP_COMPACT ? 5 : chartSize === BettingChartSize.MOBILE_COMPACT ? 7 : 10,
                        dy: chartSize === BettingChartSize.DESKTOP_COMPACT ? 5 : chartSize === BettingChartSize.MOBILE_COMPACT ? -5 : -5,
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

                  const seconds = totalSeconds % 60;


                  // Get the actual time by adding to start time
                  const totalMinutes = startTime.minute + minutes
                  const newHour = startTime.hour + Math.floor(totalMinutes / 60)
                  const newMinute = totalMinutes % 60

                  // Format as HH:MM:SS
                  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                }}
                tickLine={true}
                stroke="#9ca3af"
                allowDataOverflow={true}
                hide={false}
              />
              <YAxis stroke="#9ca3af" domain={getYAxisMinAndMaxValues()} allowDataOverflow={true} scale="linear" hide={isMobile} />

              {/* Line chart */}
              <Line type="monotone" data={gridState.lineData} dataKey="price" stroke="#00CA5E" strokeWidth={4} dot={false} isAnimationActive={false} connectNulls={true} />

              {/* Next active column border */}
              {getActiveColumnBounds({
                activeColumn: gridState.activeColumn,
                chartBounds: {
                  lowest: isCompactMode ? gridState.chartBounds.lowest + rowHeightPriceValue * 3 : gridState.chartBounds.lowest,
                  highest: isCompactMode ? gridState.chartBounds.highest - rowHeightPriceValue * 3 : gridState.chartBounds.highest,
                },
              }) && (
                <ReferenceArea
                  {...getActiveColumnBounds({
                    activeColumn: gridState.activeColumn,
                    chartBounds: {
                      lowest: isCompactMode ? gridState.chartBounds.lowest + rowHeightPriceValue * 3 : gridState.chartBounds.lowest,
                      highest: isCompactMode ? gridState.chartBounds.highest - rowHeightPriceValue * 3 : gridState.chartBounds.highest,
                    },
                  })}
                  fill="none"
                  stroke="#FFCF00"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </LineChart>
            <div className="flex gap-2 pt-2">
              <button className="ml-auto cursor-pointer" onClick={handleSizeToggle}>
                <img src="/assets/svg/arrow-top-right.svg" alt="Arrow top right" className={`w-3 h-3 ${isCompactMode ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <ChartFooter tokenName={tokenName} idx={idx}/>
      <ConfirmationDialog
        isOpen={!!betToCancel}
        title="Cancel Bet"
        description="Are you sure you want to cancel this bet? A small fee will be charged."
        onConfirm={async () => {
          if (betToCancel) {
            
            await cancelBet.mutateAsync({
              userKey: embeddedWallet?.address || '',
              poolKey: colData?.poolKey || '',
            })

            await refetchBalance();

            // Remove the bet from userBets state
            setUserBets(userBets.filter((bet) => bet.id !== betToCancel.id))
            // Remove the bet from grid state
            dispatch({ type: 'REMOVE_BET_BY_ID', id: betToCancel.id })
            setBetToCancel(null)
            setRemovingBetId(null)
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