import { MockData } from '../mockdata'
import { useEffect, useState } from 'react'
import { Pool, Bet } from '../types'
import { generateRandomId } from '../utils'

export const useBettingData = (competitionKey: string) => {
  const [bettingPools, setBettingPools] = useState<Pool[]>([])
  const [currentPool, setCurrentPool] = useState<Pool | null>(null)

  // TODO: Replace mock data with real data
  useEffect(() => {
    const mockPools: Pool[] = Array.from({ length: 15 }, (_, i) => ({
      ...MockData.pool,
      poolKey: generateRandomId(),
      poolHash: generateRandomId(),
      competitionKey,
      startTime: MockData.pool.startTime + i * 30,
      endTime: MockData.pool.endTime + i * 30,
    }))

    setBettingPools(mockPools)
    setCurrentPool(mockPools[0])
  }, [competitionKey])

  const placeBet = (poolKey: string, priceBounds: { lowerBound: number; upperBound: number }, amount: number = 1) => {
    const bet: Bet = {
      ...MockData.bet,
      publicKey: generateRandomId(),
      poolKey,
      competition: competitionKey,
      lowerBoundPrice: priceBounds.lowerBound,
      upperBoundPrice: priceBounds.upperBound,
      amount,
    }

    // TODO: Make a call to the backend to place the bet

    return bet
  }

  return {
    bettingPools,
    currentPool,
    placeBet,
  }
}
