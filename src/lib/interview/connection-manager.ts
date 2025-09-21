/**
 * Connection Manager for Google Gemini Live API
 * Handles connection state, reconnection logic, and error recovery
 */

import type { ConnectionStatus, GeminiError } from '@/types/interview'

export interface ConnectionConfig {
  maxReconnectAttempts: number
  initialReconnectDelay: number
  maxReconnectDelay: number
  backoffMultiplier: number
  connectionTimeout: number
  heartbeatInterval: number
  enableHeartbeat: boolean
}

export interface ConnectionEvent {
  type: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'heartbeat'
  timestamp: Date
  attempt?: number
  error?: GeminiError
  latency?: number
}

export type ConnectionEventCallback = (event: ConnectionEvent) => void

/**
 * Manages WebSocket connection lifecycle and reconnection logic
 */
export class ConnectionManager {
  private config: ConnectionConfig
  private status: ConnectionStatus = { connected: false }
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private connectionStartTime: number = 0
  private lastHeartbeat: Date | null = null
  private eventCallbacks: ConnectionEventCallback[] = []
  private websocket: WebSocket | null = null

  constructor(config: Partial<ConnectionConfig> = {}) {
    this.config = {
      maxReconnectAttempts: 5,
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      backoffMultiplier: 2,
      connectionTimeout: 10000,
      heartbeatInterval: 30000,
      enableHeartbeat: true,
      ...config
    }
  }

  /**
   * Establish WebSocket connection
   */
  async connect(url: string, protocols?: string[]): Promise<WebSocket> {
    try {
      // Clear any existing reconnection timer
      this.clearReconnectTimer()
      
      // Emit connecting event
      this.emitEvent({ type: 'connecting', timestamp: new Date() })
      
      // Record connection start time for latency calculation
      this.connectionStartTime = Date.now()
      
      // Create WebSocket connection
      this.websocket = new WebSocket(url, protocols)
      
      // Set up event handlers
      this.setupWebSocketHandlers()
      
      // Wait for connection with timeout
      await this.waitForConnection()
      
      // Calculate connection latency
      const latency = Date.now() - this.connectionStartTime
      
      // Update status
      this.status = {
        connected: true,
        latency,
        quality: this.calculateConnectionQuality(latency)
      }
      
      // Reset reconnect attempts
      this.reconnectAttempts = 0
      
      // Start heartbeat if enabled
      if (this.config.enableHeartbeat) {
        this.startHeartbeat()
      }
      
      // Emit connected event
      this.emitEvent({
        type: 'connected',
        timestamp: new Date(),
        latency
      })
      
      console.log(`Connected to Gemini Live API (latency: ${latency}ms)`)
      return this.websocket
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'CONNECTION_FAILED',
        message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, url }
      }
      
      this.handleConnectionError(geminiError)
      throw geminiError
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(code: number = 1000, reason: string = 'Client disconnect'): void {
    // Clear timers
    this.clearReconnectTimer()
    this.clearHeartbeat()
    
    // Close WebSocket
    if (this.websocket) {
      this.websocket.close(code, reason)
      this.websocket = null
    }
    
    // Update status
    this.status = { connected: false }
    
    // Emit disconnected event
    this.emitEvent({
      type: 'disconnected',
      timestamp: new Date()
    })
    
    console.log('Disconnected from Gemini Live API')
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  /**
   * Check if connection is healthy
   */
  isHealthy(): boolean {
    if (!this.status.connected) return false
    
    // Check if heartbeat is recent (if enabled)
    if (this.config.enableHeartbeat && this.lastHeartbeat) {
      const heartbeatAge = Date.now() - this.lastHeartbeat.getTime()
      const maxAge = this.config.heartbeatInterval * 2 // Allow 2x interval
      
      if (heartbeatAge > maxAge) {
        console.warn('Heartbeat timeout detected')
        return false
      }
    }
    
    return true
  }

  /**
   * Force reconnection
   */
  async reconnect(url: string, protocols?: string[]): Promise<WebSocket> {
    console.log('Forcing reconnection...')
    this.disconnect(1000, 'Manual reconnect')
    return await this.connect(url, protocols)
  }

  /**
   * Register event callback
   */
  onEvent(callback: ConnectionEventCallback): void {
    this.eventCallbacks.push(callback)
  }

  /**
   * Remove event callback
   */
  offEvent(callback: ConnectionEventCallback): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  /**
   * Send heartbeat ping
   */
  sendHeartbeat(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const heartbeatMessage = {
        type: 'ping',
        timestamp: Date.now()
      }
      
      this.websocket.send(JSON.stringify(heartbeatMessage))
      this.lastHeartbeat = new Date()
      
      this.emitEvent({
        type: 'heartbeat',
        timestamp: new Date()
      })
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.clearReconnectTimer()
    this.clearHeartbeat()
    this.disconnect()
    this.eventCallbacks = []
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    if (!this.websocket) return

    this.websocket.onopen = () => {
      console.log('WebSocket connection opened')
    }

    this.websocket.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code} ${event.reason}`)
      
      this.status = { connected: false }
      this.clearHeartbeat()
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect()
      } else if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
        this.emitEvent({
          type: 'failed',
          timestamp: new Date(),
          error: {
            code: 'MAX_RECONNECT_ATTEMPTS',
            message: 'Maximum reconnection attempts reached'
          }
        })
      }
    }

    this.websocket.onerror = (event) => {
      console.error('WebSocket error:', event)
      
      const error: GeminiError = {
        code: 'WEBSOCKET_ERROR',
        message: 'WebSocket connection error',
        details: { event }
      }
      
      this.handleConnectionError(error)
    }

    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        // Handle pong response for heartbeat
        if (message.type === 'pong') {
          const latency = Date.now() - message.timestamp
          this.updateLatency(latency)
        }
      } catch (error) {
        // Ignore parsing errors for non-heartbeat messages
      }
    }
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.websocket) {
        reject(new Error('WebSocket not initialized'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, this.config.connectionTimeout)

      this.websocket.onopen = () => {
        clearTimeout(timeout)
        resolve()
      }

      this.websocket.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    
    this.reconnectAttempts++
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.initialReconnectDelay * Math.pow(this.config.backoffMultiplier, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    )
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`)
    
    this.emitEvent({
      type: 'reconnecting',
      timestamp: new Date(),
      attempt: this.reconnectAttempts
    })
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null
      
      try {
        // Note: This would need the original URL and protocols
        // In practice, this should be handled by the calling code
        console.log('Attempting reconnection...')
        
      } catch (error) {
        console.error('Reconnection failed:', error)
        
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)
    
    // Send initial heartbeat
    this.sendHeartbeat()
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private updateLatency(latency: number): void {
    this.status = {
      ...this.status,
      latency,
      quality: this.calculateConnectionQuality(latency)
    }
  }

  private calculateConnectionQuality(latency: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (latency < 100) return 'excellent'
    if (latency < 200) return 'good'
    if (latency < 500) return 'fair'
    return 'poor'
  }

  private handleConnectionError(error: GeminiError): void {
    console.error('Connection error:', error)
    
    this.emitEvent({
      type: 'failed',
      timestamp: new Date(),
      error
    })
  }

  private emitEvent(event: ConnectionEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in connection event callback:', error)
      }
    })
  }
}

/**
 * Default connection configuration
 */
export const DEFAULT_CONNECTION_CONFIG: ConnectionConfig = {
  maxReconnectAttempts: 5,
  initialReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  backoffMultiplier: 2,
  connectionTimeout: 10000,
  heartbeatInterval: 30000,
  enableHeartbeat: true
}

/**
 * Factory function to create ConnectionManager
 */
export function createConnectionManager(config: Partial<ConnectionConfig> = {}): ConnectionManager {
  return new ConnectionManager({ ...DEFAULT_CONNECTION_CONFIG, ...config })
}