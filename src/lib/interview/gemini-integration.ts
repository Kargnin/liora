/**
 * Unified Google Gemini Live API Integration
 * Orchestrates all components for seamless real-time interview experience
 */

import { GeminiLiveAPIClient, createGeminiLiveClient, type GeminiLiveConfig } from './gemini-client'
import { MediaProcessor, createMediaProcessor, type MediaProcessorConfig, type AudioProcessingOptions } from './media-processor'
import { ConnectionManager, createConnectionManager, type ConnectionConfig, type ConnectionEvent } from './connection-manager'
import { AuthManager, createAuthManagerFromEnv } from './auth-manager'
import { geminiErrorHandler, handleGeminiError, type ErrorReport } from './error-handler'

import type {
  MediaStreamConfig,
  MediaData,
  MediaResponse,
  TranscriptData,
  GeminiError,
  ConnectionStatus,
  AudioQualityMetrics,
  MediaDevice
} from '@/types/interview'

export interface GeminiIntegrationConfig {
  apiKey?: string
  gemini?: Partial<GeminiLiveConfig>
  media?: Partial<MediaProcessorConfig>
  connection?: Partial<ConnectionConfig>
  enableAutoReconnect?: boolean
  enableQualityMonitoring?: boolean
  enableErrorRecovery?: boolean
}

export interface GeminiIntegrationCallbacks {
  onMediaResponse?: (media: MediaResponse) => void
  onTranscript?: (transcript: TranscriptData) => void
  onQualityUpdate?: (metrics: AudioQualityMetrics) => void
  onConnectionChange?: (status: ConnectionStatus) => void
  onError?: (report: ErrorReport) => void
  onRecovery?: (strategy: string) => void
}

export interface GeminiIntegrationStatus {
  authenticated: boolean
  connected: boolean
  mediaInitialized: boolean
  audioProcessing: boolean
  quality: AudioQualityMetrics | null
  lastError: ErrorReport | null
}

/**
 * Unified integration class that orchestrates all Gemini Live API components
 */
export class GeminiIntegration {
  private authManager: AuthManager
  private geminiClient: GeminiLiveAPIClient
  private mediaProcessor: MediaProcessor
  private connectionManager: ConnectionManager
  private callbacks: GeminiIntegrationCallbacks = {}
  private config: GeminiIntegrationConfig
  private currentStream: MediaStream | null = null
  private isInitialized = false
  private recoveryInProgress = false

  constructor(config: GeminiIntegrationConfig = {}) {
    this.config = {
      enableAutoReconnect: true,
      enableQualityMonitoring: true,
      enableErrorRecovery: true,
      ...config
    }

    // Initialize authentication
    this.authManager = config.apiKey 
      ? new AuthManager({ apiKey: config.apiKey, validateOnInit: true })
      : createAuthManagerFromEnv()

    // Initialize Gemini client
    this.geminiClient = createGeminiLiveClient({
      apiKey: this.authManager.getApiKey(),
      ...config.gemini
    })

    // Initialize media processor
    this.mediaProcessor = createMediaProcessor(config.media)

    // Initialize connection manager
    this.connectionManager = createConnectionManager(config.connection)

    // Set up component callbacks
    this.setupCallbacks()
  }

  /**
   * Initialize the complete integration system
   */
  async initialize(streamConfig: MediaStreamConfig): Promise<void> {
    try {
      console.log('Initializing Gemini Live API integration...')

      // Step 1: Validate authentication
      const authValid = await this.authManager.validateApiKey()
      if (!authValid) {
        throw new Error('Authentication failed. Please check your API key.')
      }

      // Step 2: Initialize media capture
      this.currentStream = await this.mediaProcessor.initializeMedia(streamConfig)
      console.log('Media initialized successfully')

      // Step 3: Connect to Gemini Live API
      await this.geminiClient.connect({
        enableAudio: true,
        enableVideo: streamConfig.video ? true : false,
        enableTranscription: true,
        language: 'en-US'
      })
      console.log('Connected to Gemini Live API')

      // Step 4: Start audio processing
      await this.mediaProcessor.startAudioProcessing({
        enableNoiseReduction: streamConfig.audio.noiseSuppression,
        enableEchoCancellation: streamConfig.audio.echoCancellation,
        enableAutoGainControl: streamConfig.audio.autoGainControl,
        volumeThreshold: 0.01
      })

      // Step 5: Start audio recording and streaming
      if (this.currentStream) {
        await this.geminiClient.startAudioRecording(this.currentStream)
      }

      this.isInitialized = true
      console.log('Gemini Live API integration initialized successfully')

      // Notify connection status change
      this.notifyConnectionChange()

    } catch (error) {
      const geminiError: GeminiError = {
        code: 'INTEGRATION_INIT_FAILED',
        message: `Failed to initialize Gemini integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, streamConfig }
      }

      this.handleError(geminiError, 'GeminiIntegration', 'initialize')
      throw geminiError
    }
  }

  /**
   * Shutdown the integration system
   */
  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down Gemini Live API integration...')

      // Stop audio recording
      await this.geminiClient.stopRecording()

      // Stop audio processing
      this.mediaProcessor.stopAudioProcessing()

      // Disconnect from Gemini API
      await this.geminiClient.disconnect()

      // Clean up media processor
      this.mediaProcessor.cleanup()

      // Clean up connection manager
      this.connectionManager.cleanup()

      // Clean up auth manager
      this.authManager.cleanup()

      // Stop media stream
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop())
        this.currentStream = null
      }

      this.isInitialized = false
      console.log('Gemini Live API integration shut down successfully')

    } catch (error) {
      console.error('Error during shutdown:', error)
    }
  }

  /**
   * Get available media devices
   */
  async getAvailableDevices(): Promise<MediaDevice[]> {
    try {
      return await this.mediaProcessor.getAvailableDevices()
    } catch (error) {
      this.handleError(error as GeminiError, 'GeminiIntegration', 'getAvailableDevices')
      throw error
    }
  }

  /**
   * Switch to a different audio/video device
   */
  async switchDevice(deviceId: string, type: 'audio' | 'video'): Promise<void> {
    try {
      await this.mediaProcessor.switchDevice(deviceId, type)
      console.log(`Switched to ${type} device: ${deviceId}`)
    } catch (error) {
      this.handleError(error as GeminiError, 'GeminiIntegration', 'switchDevice')
      throw error
    }
  }

  /**
   * Get current integration status
   */
  getStatus(): GeminiIntegrationStatus {
    const authStatus = this.authManager.getAuthStatus()
    const connectionStatus = this.geminiClient.getConnectionStatus()
    const qualityMetrics = this.mediaProcessor.getCurrentQualityMetrics()

    return {
      authenticated: authStatus.authenticated,
      connected: connectionStatus.connected,
      mediaInitialized: this.currentStream !== null,
      audioProcessing: this.isInitialized,
      quality: qualityMetrics,
      lastError: geminiErrorHandler.getErrorHistory()[0] || null
    }
  }

  /**
   * Force reconnection to Gemini Live API
   */
  async reconnect(): Promise<void> {
    if (this.recoveryInProgress) {
      console.log('Recovery already in progress, skipping reconnect')
      return
    }

    try {
      this.recoveryInProgress = true
      console.log('Forcing reconnection to Gemini Live API...')

      // Disconnect current connection
      await this.geminiClient.disconnect()

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reconnect
      await this.geminiClient.connect({
        enableAudio: true,
        enableVideo: false,
        enableTranscription: true,
        language: 'en-US'
      })

      // Restart audio recording if we have a stream
      if (this.currentStream) {
        await this.geminiClient.startAudioRecording(this.currentStream)
      }

      console.log('Reconnection successful')
      this.notifyConnectionChange()

      if (this.callbacks.onRecovery) {
        this.callbacks.onRecovery('reconnect')
      }

    } catch (error) {
      this.handleError(error as GeminiError, 'GeminiIntegration', 'reconnect')
      throw error
    } finally {
      this.recoveryInProgress = false
    }
  }

  /**
   * Set integration callbacks
   */
  setCallbacks(callbacks: GeminiIntegrationCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Send media data manually (for testing or special cases)
   */
  async sendMediaData(mediaData: MediaData): Promise<void> {
    try {
      await this.geminiClient.sendMedia(mediaData)
    } catch (error) {
      this.handleError(error as GeminiError, 'GeminiIntegration', 'sendMediaData')
      throw error
    }
  }

  /**
   * Check if the integration is healthy and ready
   */
  isHealthy(): boolean {
    const status = this.getStatus()
    return status.authenticated && 
           status.connected && 
           status.mediaInitialized && 
           status.audioProcessing &&
           this.connectionManager.isHealthy()
  }

  // Private methods

  private setupCallbacks(): void {
    // Gemini client callbacks
    this.geminiClient.onMediaResponse((media) => {
      if (this.callbacks.onMediaResponse) {
        this.callbacks.onMediaResponse(media)
      }
    })

    this.geminiClient.onTranscript((transcript) => {
      if (this.callbacks.onTranscript) {
        this.callbacks.onTranscript(transcript)
      }
    })

    this.geminiClient.onError((error) => {
      this.handleError(error, 'GeminiClient', 'api_operation')
    })

    // Media processor callbacks
    this.mediaProcessor.onMediaData(async (mediaData) => {
      try {
        await this.geminiClient.sendMedia(mediaData)
      } catch (error) {
        this.handleError(error as GeminiError, 'MediaProcessor', 'sendMedia')
      }
    })

    this.mediaProcessor.onQualityUpdate((metrics) => {
      if (this.callbacks.onQualityUpdate) {
        this.callbacks.onQualityUpdate(metrics)
      }
    })

    this.mediaProcessor.onError((error) => {
      this.handleError(error, 'MediaProcessor', 'processing')
    })

    // Connection manager callbacks
    this.connectionManager.onEvent((event) => {
      this.handleConnectionEvent(event)
    })

    // Error handler callback
    geminiErrorHandler.onError((report) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(report)
      }

      // Attempt automatic recovery if enabled
      if (this.config.enableErrorRecovery && !this.recoveryInProgress) {
        this.attemptErrorRecovery(report)
      }
    })
  }

  private handleError(error: GeminiError, component: string, operation: string): void {
    const report = handleGeminiError(error, component, operation, {
      integrationStatus: this.getStatus(),
      timestamp: new Date().toISOString()
    })

    console.error(`Error in ${component}.${operation}:`, error)
  }

  private handleConnectionEvent(event: ConnectionEvent): void {
    console.log(`Connection event: ${event.type}`, event)

    switch (event.type) {
      case 'connected':
        this.notifyConnectionChange()
        break
      
      case 'disconnected':
        this.notifyConnectionChange()
        if (this.config.enableAutoReconnect && !this.recoveryInProgress) {
          this.scheduleReconnect()
        }
        break
      
      case 'failed':
        if (event.error) {
          this.handleError(event.error, 'ConnectionManager', 'connection')
        }
        break
    }
  }

  private notifyConnectionChange(): void {
    if (this.callbacks.onConnectionChange) {
      const status = this.geminiClient.getConnectionStatus()
      this.callbacks.onConnectionChange(status)
    }
  }

  private scheduleReconnect(): void {
    if (this.recoveryInProgress) return

    console.log('Scheduling automatic reconnection...')
    setTimeout(async () => {
      try {
        await this.reconnect()
      } catch (error) {
        console.error('Automatic reconnection failed:', error)
      }
    }, 2000)
  }

  private async attemptErrorRecovery(report: ErrorReport): Promise<void> {
    if (this.recoveryInProgress) return

    const { recoveryStrategy } = report

    try {
      this.recoveryInProgress = true
      console.log(`Attempting error recovery: ${recoveryStrategy.type}`)

      switch (recoveryStrategy.type) {
        case 'reconnect':
          await this.reconnect()
          break
        
        case 'retry':
          // For retry strategies, we'll let the individual components handle it
          console.log('Retry strategy - letting component handle recovery')
          break
        
        case 'fallback':
          console.log('Fallback strategy - continuing with degraded functionality')
          break
        
        case 'user_action':
          console.log('User action required - no automatic recovery possible')
          break
        
        case 'abort':
          console.log('Unrecoverable error - manual intervention required')
          break
      }

      if (this.callbacks.onRecovery) {
        this.callbacks.onRecovery(recoveryStrategy.type)
      }

    } catch (error) {
      console.error('Error recovery failed:', error)
    } finally {
      this.recoveryInProgress = false
    }
  }
}

/**
 * Factory function to create GeminiIntegration with default configuration
 */
export function createGeminiIntegration(config: GeminiIntegrationConfig = {}): GeminiIntegration {
  return new GeminiIntegration(config)
}

/**
 * Default integration configuration optimized for interviews
 */
export const DEFAULT_INTERVIEW_CONFIG: GeminiIntegrationConfig = {
  enableAutoReconnect: true,
  enableQualityMonitoring: true,
  enableErrorRecovery: true,
  gemini: {
    model: 'gemini-2.0-flash-exp',
    audioConfig: {
      sampleRate: 16000,
      channels: 1,
      encoding: 'linear16'
    },
    maxRetries: 3,
    retryDelay: 1000
  },
  media: {
    audioConstraints: {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    processingInterval: 100,
    qualityCheckInterval: 1000
  },
  connection: {
    maxReconnectAttempts: 5,
    initialReconnectDelay: 1000,
    maxReconnectDelay: 30000,
    backoffMultiplier: 2,
    connectionTimeout: 10000,
    heartbeatInterval: 30000,
    enableHeartbeat: true
  }
}

/**
 * Utility function to test Gemini Live API connectivity
 */
export async function testGeminiConnectivity(apiKey?: string): Promise<{
  success: boolean
  latency?: number
  error?: string
}> {
  try {
    const testAuth = new AuthManager({
      apiKey: apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      validateOnInit: false
    })

    const startTime = Date.now()
    const success = await testAuth.validateApiKey()
    const latency = Date.now() - startTime

    testAuth.cleanup()

    return {
      success,
      latency: success ? latency : undefined,
      error: success ? undefined : 'API key validation failed'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}