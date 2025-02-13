import { useEffect, useState } from 'react'
import { ColumnData } from '../types'
import WebSocketManager from '../websocketManager'

export const useColumnData = (competitionKey: string) => {
  const [columnData, setColumnData] = useState<Record<number, ColumnData>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchColumnData = async () => {
      try {
        console.log('🔄 Fetching initial column data for competition:', competitionKey)
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/competitions/${competitionKey}/columns`)
        // const data = await response.json()

        // Initialize default data for all columns
        const initialData: Record<number, ColumnData> = {}
        for (let i = 0; i < 16; i++) {
          // Use your TOTAL_COLUMNS constant if available
          initialData[i] = {
            poolKey: `pool-${i}`, // Temporary mock data
            poolHash: '11111111111111111111111111111111',
            competitionKey,
            startTime: Math.floor(Date.now() / 1000) + i * 30,
            endTime: Math.floor(Date.now() / 1000) + (i + 1) * 30,
            treasury: '3Vm8KKkd1aaCL1nnVf4PSXMZySy7Cu2DrsNVQeGpN2An',
            bets: [],
            totalBets: 0,
            isFull: false,
            isHot: false,
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
  }, [competitionKey])

  return { columnData, isLoading }
}
