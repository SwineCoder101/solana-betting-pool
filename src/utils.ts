import { BettingChartSize } from './types'

// Type to enforce HH:MM format where HH is 00-23 and MM is 00-59
type TimeString = `${`0${number}` | number}:${`0${number}` | number}`

export const timeToMinutes = (timeStr: TimeString) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

export const getCurrentTime = () => {
  const now = new Date()
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
    date: now
  }
}

export const generateRandomId = (length: number = 44): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('')
}

export const isMobileSize = (size: BettingChartSize) => {
  return size === BettingChartSize.MOBILE_COMPACT || size === BettingChartSize.MOBILE_EXPANDED
}
