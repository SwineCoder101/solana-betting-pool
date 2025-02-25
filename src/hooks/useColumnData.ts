import { useEffect, useState } from 'react'
import { ColumnData } from '../types'
import WebSocketManager from '../websocketManager'
import { PoolData } from '@/competition-pools'

export const useColumnData = (competitionKey: string, competitionPools: PoolData[] | undefined) => {
  const [columnData, setColumnData] = useState<Record<number, ColumnData>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchColumnData = async () => {
      try {
        // Initialize default data for all columns
        const initialData: Record<number, ColumnData> = {}
        for (let i = 0; i < 8; i++) {
          initialData[i] = {
            poolKey: competitionPools?.[i].poolKey || '', // Temporary mock data
            poolHash: '11111111111111111111111111111111',
            competitionKey,
            startTime: Math.floor(Date.now() / 1000) + i * 30,
            endTime: Math.floor(Date.now() / 1000) + (i + 1) * 30,
            bets: [],
            totalBets: 0,
            isFull: false,
            isHot: false,
            poolIndex: i,
          }
        }
        setColumnData(initialData)
        console.log('✅ Initial column data fetch complete')
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error fetching column data:', error)
        setIsLoading(false)
      }
    }

    // Set up WebSocket for real-time updates
    console.log('🔌 Setting up WebSocket connection for columns')
    const ws = WebSocketManager.getConnection(`columns-${competitionKey}`)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      console.log('📨 Received column update:', {
        columnIndex: update.columnIndex,
        data: update.data,
      })

      setColumnData((prev) => {
        const newData = {
          ...prev,
          [update.columnIndex]: {
            ...prev[update.columnIndex],
            ...update.data,
          },
        }
        console.log('📊 Updated column data:', newData)
        return newData
      })
    }

    fetchColumnData()

    return () => {
      console.log('👋 Cleaning up WebSocket connection')
      WebSocketManager.closeConnection(`columns-${competitionKey}`)
    }
  }, [competitionKey, competitionPools])

  return { columnData, isLoading }
}
