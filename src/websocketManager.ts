class WebSocketManager {
  private static connections: Map<string, WebSocket> = new Map()

  static getConnection(tokenPair: string): WebSocket {
    if (!this.connections.has(tokenPair)) {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${tokenPair}@kline_1m`)
      this.connections.set(tokenPair, ws)
    }
    return this.connections.get(tokenPair)!
  }

  static closeConnection(tokenPair: string) {
    const connection = this.connections.get(tokenPair)
    if (connection) {
      connection.close()
      this.connections.delete(tokenPair)
    }
  }
}

export default WebSocketManager
