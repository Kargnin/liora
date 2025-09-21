/**
 * Google Gemini Live API Client
 * Handles direct API communication, WebRTC audio streaming, and real-time processing
 */

import type {
  GeminiLiveClient,
  MediaData,
  MediaResponse,
  TranscriptData,
  GeminiError,
  ConnectionStatus,
  MediaStreamConfig
} from '@/types/interview'

export interface GeminiLiveConfig {
  apiKey: string
  model?: string
  audioConfig?: {
    sampleRate: number
    channels: number
    encoding: string
  }
  videoConfig?: {
    width: number
    height: number
    frameRate: number
  }
  maxRetries?: number
  retryDelay?: number
}

export interface GeminiConnectionOptions {
  enableAudio: boolean
  enableVideo: boolean
  enableTranscription: boolean
  language?: string
}

/**
 * Main client for Google Gemini Live API integration
 * Handles WebRTC streaming, authentication, and real-time communication
 */
export class GeminiLiveAPIClient implements GeminiLiveClient {
  private config: GeminiLiveConfig
  private websocket: WebSocket | null = null
  private connectionStatus: ConnectionStatus = { connected: false }
  private mediaCallbacks: ((media: MediaResponse) => void)[] = []
  private transcriptCallbacks: ((transcript: TranscriptData) => void)[] = []
  private errorCallbacks: ((error: GeminiError) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimer: NodeJS.Timeout | null = null
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private isRecording = false

  constructor(config: GeminiLiveConfig) {
    this.config = {
      model: 'gemini-2.0-flash-exp',
      audioConfig: {
        sampleRate: 16000,
        channels: 1,
        encoding: 'linear16'
      },
      videoConfig: {
        width: 640,
        height: 480,
        frameRate: 30
      },
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    }
  }

  /**
   * Establish connection to Gemini Live API
   */
  async connect(options: GeminiConnectionOptions = { enableAudio: true, enableVideo: false, enableTranscription: true }): Promise<void> {
    try {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        console.log('Already connected to Gemini Live API')
        return
      }

      // Initialize audio context for WebRTC processing
      if (options.enableAudio) {
        await this.initializeAudioContext()
      }

      // Construct WebSocket URL with authentication
      const wsUrl = this.buildWebSocketUrl(options)
      
      this.websocket = new WebSocket(wsUrl)
      
      // Set up WebSocket event handlers
      this.setupWebSocketHandlers()
      
      // Wait for connection to be established
      await this.waitForConnection()
      
      // Send initial configuration
      await this.sendInitialConfig(options)
      
      this.connectionStatus = { connected: true, quality: 'good' }
      this.reconnectAttempts = 0
      
      console.log('Successfully connected to Gemini Live API')
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'CONNECTION_FAILED',
        message: `Failed to connect to Gemini Live API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Disconnect from Gemini Live API
   */
  async disconnect(): Promise<void> {
    try {
      // Stop recording if active
      if (this.isRecording) {
        await this.stopRecording()
      }

      // Clear reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }

      // Close WebSocket connection
      if (this.websocket) {
        this.websocket.close(1000, 'Client disconnect')
        this.websocket = null
      }

      // Clean up audio context
      if (this.audioContext) {
        await this.audioContext.close()
        this.audioContext = null
      }

      this.connectionStatus = { connected: false }
      console.log('Disconnected from Gemini Live API')
      
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  /**
   * Send media data to Gemini Live API
   */
  async sendMedia(mediaData: MediaData): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    try {
      const message = {
        type: 'media',
        mediaType: mediaData.type,
        timestamp: mediaData.timestamp,
        data: Array.from(new Uint8Array(mediaData.data)), // Convert ArrayBuffer to array for JSON
        metadata: mediaData.metadata
      }

      this.websocket.send(JSON.stringify(message))
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'MEDIA_SEND_FAILED',
        message: `Failed to send media data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { mediaType: mediaData.type, error }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Register callback for media responses
   */
  onMediaResponse(callback: (media: MediaResponse) => void): void {
    this.mediaCallbacks.push(callback)
  }

  /**
   * Register callback for transcript updates
   */
  onTranscript(callback: (transcript: TranscriptData) => void): void {
    this.transcriptCallbacks.push(callback)
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: GeminiError) => void): void {
    this.errorCallbacks.push(callback)
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Start recording audio from microphone
   */
  async startAudioRecording(stream: MediaStream): Promise<void> {
    try {
      if (!this.audioContext) {
        await this.initializeAudioContext()
      }

      // Create MediaRecorder for audio capture
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      // Handle recorded data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.processAudioChunk(event.data)
        }
      }

      // Start recording with 100ms chunks for real-time processing
      this.mediaRecorder.start(100)
      this.isRecording = true
      
      console.log('Started audio recording')
      
    } catch (error) {
      const geminiError: GeminiError = {
        code: 'RECORDING_START_FAILED',
        message: `Failed to start audio recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
      
      this.handleError(geminiError)
      throw geminiError
    }
  }

  /**
   * Stop audio recording
   */
  async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      console.log('Stopped audio recording')
    }
  }

  // Private methods

  private buildWebSocketUrl(options: GeminiConnectionOptions): string {
    const baseUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'
    const params = new URLSearchParams({
      key: this.config.apiKey,
      model: this.config.model || 'gemini-2.0-flash-exp'
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  private async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.audioConfig?.sampleRate || 16000
      })
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.websocket) return

    this.websocket.onopen = () => {
      console.log('WebSocket connection opened')
    }

    this.websocket.onmessage = (event) => {
      this.handleWebSocketMessage(event)
    }

    this.websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason)
      this.connectionStatus = { connected: false }
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.websocket.onerror = (event) => {
      console.error('WebSocket error:', event)
      const geminiError: GeminiError = {
        code: 'WEBSOCKET_ERROR',
        message: 'WebSocket connection error',
        details: { event }
      }
      this.handleError(geminiError)
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
      }, 10000) // 10 second timeout

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

  private async sendInitialConfig(options: GeminiConnectionOptions): Promise<void> {
    const config = {
      type: 'setup',
      config: {
        model: this.config.model,
        audio: options.enableAudio ? this.config.audioConfig : null,
        video: options.enableVideo ? this.config.videoConfig : null,
        transcription: options.enableTranscription,
        language: options.language || 'en-US'
      }
    }

    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(config))
    }
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'media_response':
          this.handleMediaResponse(message)
          break
          
        case 'transcript':
          this.handleTranscriptResponse(message)
          break
          
        case 'error':
          this.handleServerError(message)
          break
          
        case 'status':
          this.handleStatusUpdate(message)
          break
          
        default:
          console.log('Unknown message type:', message.type)
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  private handleMediaResponse(message: any): void {
    try {
      const mediaResponse: MediaResponse = {
        type: message.mediaType,
        data: new Uint8Array(message.data).buffer,
        timestamp: message.timestamp
      }
      
      // Notify all media callbacks
      this.mediaCallbacks.forEach(callback => {
        try {
          callback(mediaResponse)
        } catch (error) {
          console.error('Error in media callback:', error)
        }
      })
      
    } catch (error) {
      console.error('Error handling media response:', error)
    }
  }

  private handleTranscriptResponse(message: any): void {
    try {
      const transcriptData: TranscriptData = {
        text: message.text,
        confidence: message.confidence || 1.0,
        isFinal: message.isFinal || false,
        speaker: message.speaker || 'ai',
        timestamp: new Date(message.timestamp),
        alternatives: message.alternatives,
        keyPhrases: message.keyPhrases
      }
      
      // Notify all transcript callbacks
      this.transcriptCallbacks.forEach(callback => {
        try {
          callback(transcriptData)
        } catch (error) {
          console.error('Error in transcript callback:', error)
        }
      })
      
    } catch (error) {
      console.error('Error handling transcript response:', error)
    }
  }

  private handleServerError(message: any): void {
    const geminiError: GeminiError = {
      code: message.code || 'SERVER_ERROR',
      message: message.message || 'Server error occurred',
      details: message.details
    }
    
    this.handleError(geminiError)
  }

  private handleStatusUpdate(message: any): void {
    if (message.status === 'connected') {
      this.connectionStatus = {
        connected: true,
        latency: message.latency,
        quality: message.quality || 'good'
      }
    }
  }

  private async processAudioChunk(audioBlob: Blob): Promise<void> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      
      const mediaData: MediaData = {
        type: 'audio',
        data: arrayBuffer,
        timestamp: Date.now(),
        metadata: {
          sampleRate: this.config.audioConfig?.sampleRate,
          channels: this.config.audioConfig?.channels,
          encoding: this.config.audioConfig?.encoding
        }
      }
      
      await this.sendMedia(mediaData)
      
    } catch (error) {
      console.error('Error processing audio chunk:', error)
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff, max 30s
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      try {
        await this.connect()
      } catch (error) {
        console.error('Reconnection failed:', error)
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          const geminiError: GeminiError = {
            code: 'MAX_RECONNECT_ATTEMPTS',
            message: 'Maximum reconnection attempts reached',
            details: { attempts: this.reconnectAttempts }
          }
          this.handleError(geminiError)
        }
      }
    }, delay)
  }

  private handleError(error: GeminiError): void {
    console.error('Gemini Live API Error:', error)
    
    // Notify all error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })
  }
}

/**
 * Factory function to create GeminiLiveClient instance
 */
export function createGeminiLiveClient(config: GeminiLiveConfig): GeminiLiveClient {
  return new GeminiLiveAPIClient(config)
}

/**
 * Default configuration for Gemini Live API
 */
export const DEFAULT_GEMINI_CONFIG: Partial<GeminiLiveConfig> = {
  model: 'gemini-2.0-flash-exp',
  audioConfig: {
    sampleRate: 16000,
    channels: 1,
    encoding: 'linear16'
  },
  videoConfig: {
    width: 640,
    height: 480,
    frameRate: 30
  },
  maxRetries: 3,
  retryDelay: 1000
}