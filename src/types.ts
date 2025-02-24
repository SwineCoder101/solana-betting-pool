import { CellState, ChartBounds, LineData } from './components/betting-chart/types'

export interface ConfirmationState {
  col: number
  row: number
}

export enum BettingChartSize {
  DESKTOP_COMPACT = 'DESKTOP_COMPACT',
  DESKTOP_EXPANDED = 'DESKTOP_EXPANDED',
  MOBILE_COMPACT = 'MOBILE_COMPACT',
  MOBILE_EXPANDED = 'MOBILE_EXPANDED',
}

export type Prediction = {
  x: number
  y: number
  price: number
}

export interface Pool {
  poolKey: string
  poolHash: string
  competitionKey: string
  startTime: number
  endTime: number
  treasury: string
}

export interface Bet {
  publicKey: string
  user: string
  amount: number
  lowerBoundPrice: number
  upperBoundPrice: number
  poolKey: string
  competition: string
  status: number
}

export interface UserBet {
  id: string
  amount: number
  multiplier: string
  time: string
  tokenCode: string
  position?: {
    col: number
    row: number
  }
  userAvatar?: string
}

export interface ColumnData {
  poolKey: string
  poolHash: string
  competitionKey: string
  startTime: number
  endTime: number
  bets?: BetData[]
  totalBets?: number
  isFull?: boolean
  isHot?: boolean
  poolIndex: number
}

export interface BetData {
  publicKey: string
  user: string
  amount: number
  lowerBoundPrice: number
  upperBoundPrice: number
  userAvatar?: string
}

export interface GridState {
  cells: Record<string, CellState>
  activeColumn: number
  lastPrice: number
  chartBounds: ChartBounds
  lineData: LineData[]
  columnData: Record<number, ColumnData>
}
