/**
 * React Hook for Google Gemini Live API Integration
 * Provides a clean interface for components to interact with Gemini Live API
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  GeminiIntegration, 
  createGeminiIntegration, 
  DEFAULT_INTERVIEW_CONFIG,
  type GeminiIntegrationConfig,
  type GeminiIntegrationCallbacks,
  type GeminiIntegrationStatus
} from '@/lib/interview/gemini-integration'

import type {
  MediaStreamConfig,
  MediaResponse,
  TranscriptData,
  AudioQualityMetrics,
  ConnectionStatus,
  MediaDevice
} from '@/types/interview'
import type { ErrorReport } from '@/lib/interview/error-handler'

export interface UseGeminiIntegrationOptions {
  config?: GeminiIntegrationConfig
  autoInitialize?: boolean
  onMediaResponse?: (media: MediaResponse) => void
  onTranscript?: (transcript: TranscriptData) => void
  onQualityUpdate?: (metrics: AudioQualityMetrics) => void
  onConnectionChange?: (status: ConnectionStatus) => void
  onError?: (report: ErrorReport) => void
  onRecovery?: (strategy: string) => void
}

export interface UseGeminiIntegrationReturn {
  // Status
  status: GeminiIntegrationStatus
  isInitialized: boolean
  isConnected: boolean
  isHealthy: boolean
  
  // Media devices
  availableDevices: MediaDevice[]
  
  // Actions
  initialize: (streamConfig: MediaStreamConfig) => Promise<void>
  shutdown: () => Promise<void>
  reconnect: () => Promise<void>
  switchDevice: (deviceId: string, type: 'audio' | 'video') => Promise<void>
  refreshDevices: () => Promise<void>
  
  // Error handling
  lastError: ErrorReport | null
  clearError: () => void
  
  // Integration instance (for advanced usage)
  integration: GeminiIntegration | null
}

/**
 * Hook for managing Gemini Live API integration in React components
 */
export function useGeminiIntegration(options: UseGeminiIntegrationOptions = {}): UseGeminiIntegrationReturn {
  const {
    config = DEFAULT_INTERVIEW_CONFIG,
    autoInitialize = false,
    onMediaResponse,
    onTranscript,
    onQualityUpdate,
    onConnectionChange,
    onError,
    onRecovery
  } = options

  // State
  const [status, setStatus] = useState<GeminiIntegrationStatus>({
    authenticated: false,
    connected: false,
    mediaInitialized: false,
    audioProcessing: false,
    quality: null,
    lastError: null
  })
  const [availableDevices, setAvailableDevices] = useState<MediaDevice[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastError, setLastError] = useState<ErrorReport | null>(null)

  // Refs
  const integrationRef = useRef<GeminiIntegration | null>(null)
  const callbacksRef = useRef<GeminiIntegrationCallbacks>({})

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = {
      onMediaResponse,
      onTranscript,
      onQualityUpdate,
      onConnectionChange: (connectionStatus) => {
        setStatus(prev => ({ ...prev, connected: connectionStatus.connected }))
        onConnectionChange?.(connectionStatus)
      },
      onError: (report) => {
        setLastError(report)
        setStatus(prev => ({ ...prev, lastError: report }))
        onError?.(report)
      },
      onRecovery
    }
  }, [onMediaResponse, onTranscript, onQualityUpdate, onConnectionChange, onError, onRecovery])

  // Initialize integration instance
  useEffect(() => {
    if (!integrationRef.current) {
      try {
        integrationRef.current = createGeminiIntegration(config)
        integrationRef.current.setCallbacks(callbacksRef.current)
        console.log('Gemini integration instance created')
      } catch (error) {
        console.error('Failed to create Gemini integration:', error)
        setLastError({
          error: {
            code: 'INTEGRATION_CREATE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create integration'
          },
          context: {
            component: 'useGeminiIntegration',
            operation: 'create',
            timestamp: new Date()
          },
          recoveryStrategy: {
            type: 'user_action',
            description: 'Check configuration and try again'
          },
          userGuidance: ['Check your API key configuration', 'Refresh the page and try again'],
          technicalDetails: [error instanceof Error ? error.message : 'Unknown error']
        })
      }
    }

    return () => {
      if (integrationRef.current) {
        integrationRef.current.shutdown().catch(console.error)
        integrationRef.current = null
      }
    }
  }, [config])

  // Update callbacks when they change
  useEffect(() => {
    if (integrationRef.current) {
      integrationRef.current.setCallbacks(callbacksRef.current)
    }
  }, [callbacksRef.current])

  // Status polling
  useEffect(() => {
    if (!integrationRef.current) return

    const updateStatus = () => {
      if (integrationRef.current) {
        const currentStatus = integrationRef.current.getStatus()
        setStatus(currentStatus)
      }
    }

    // Update status immediately
    updateStatus()

    // Poll status every 2 seconds
    const interval = setInterval(updateStatus, 2000)

    return () => clearInterval(interval)
  }, [integrationRef.current])

  // Initialize function
  const initialize = useCallback(async (streamConfig: MediaStreamConfig) => {
    if (!integrationRef.current) {
      throw new Error('Integration not initialized')
    }

    try {
      setLastError(null)
      await integrationRef.current.initialize(streamConfig)
      setIsInitialized(true)
      
      // Refresh available devices after initialization
      await refreshDevices()
      
    } catch (error) {
      setIsInitialized(false)
      throw error
    }
  }, [])

  // Shutdown function
  const shutdown = useCallback(async () => {
    if (!integrationRef.current) return

    try {
      await integrationRef.current.shutdown()
      setIsInitialized(false)
      setAvailableDevices([])
      setStatus({
        authenticated: false,
        connected: false,
        mediaInitialized: false,
        audioProcessing: false,
        quality: null,
        lastError: null
      })
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
  }, [])

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!integrationRef.current) {
      throw new Error('Integration not initialized')
    }

    try {
      setLastError(null)
      await integrationRef.current.reconnect()
    } catch (error) {
      throw error
    }
  }, [])

  // Switch device function
  const switchDevice = useCallback(async (deviceId: string, type: 'audio' | 'video') => {
    if (!integrationRef.current) {
      throw new Error('Integration not initialized')
    }

    try {
      await integrationRef.current.switchDevice(deviceId, type)
      // Refresh devices after switching
      await refreshDevices()
    } catch (error) {
      throw error
    }
  }, [])

  // Refresh devices function
  const refreshDevices = useCallback(async () => {
    if (!integrationRef.current) return

    try {
      const devices = await integrationRef.current.getAvailableDevices()
      setAvailableDevices(devices)
    } catch (error) {
      console.error('Failed to refresh devices:', error)
    }
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setLastError(null)
    setStatus(prev => ({ ...prev, lastError: null }))
  }, [])

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && integrationRef.current && !isInitialized) {
      const defaultStreamConfig: MediaStreamConfig = {
        audio: {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: 'user'
        }
      }

      initialize(defaultStreamConfig).catch(error => {
        console.error('Auto-initialization failed:', error)
      })
    }
  }, [autoInitialize, isInitialized, initialize])

  return {
    // Status
    status,
    isInitialized,
    isConnected: status.connected,
    isHealthy: integrationRef.current?.isHealthy() ?? false,
    
    // Media devices
    availableDevices,
    
    // Actions
    initialize,
    shutdown,
    reconnect,
    switchDevice,
    refreshDevices,
    
    // Error handling
    lastError,
    clearError,
    
    // Integration instance
    integration: integrationRef.current
  }
}

/**
 * Hook for testing Gemini connectivity
 */
export function useGeminiConnectivityTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    latency?: number
    error?: string
  } | null>(null)

  const testConnectivity = useCallback(async (apiKey?: string) => {
    setIsLoading(true)
    setResult(null)

    try {
      const { testGeminiConnectivity } = await import('@/lib/interview/gemini-integration')
      const testResult = await testGeminiConnectivity(apiKey)
      setResult(testResult)
      return testResult
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setResult(errorResult)
      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    testConnectivity,
    isLoading,
    result
  }
}

/**
 * Hook for managing media stream configuration
 */
export function useMediaStreamConfig() {
  const [config, setConfig] = useState<MediaStreamConfig>({
    audio: {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: {
      width: 640,
      height: 480,
      frameRate: 30,
      facingMode: 'user'
    }
  })

  const updateAudioConfig = useCallback((updates: Partial<MediaStreamConfig['audio']>) => {
    setConfig(prev => ({
      ...prev,
      audio: { ...prev.audio, ...updates }
    }))
  }, [])

  const updateVideoConfig = useCallback((updates: Partial<MediaStreamConfig['video']>) => {
    setConfig(prev => ({
      ...prev,
      video: { ...prev.video, ...updates }
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setConfig({
      audio: {
        sampleRate: 16000,
        channels: 1,
        bitDepth: 16,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: 640,
        height: 480,
        frameRate: 30,
        facingMode: 'user'
      }
    })
  }, [])

  return {
    config,
    updateAudioConfig,
    updateVideoConfig,
    resetToDefaults,
    setConfig
  }
}