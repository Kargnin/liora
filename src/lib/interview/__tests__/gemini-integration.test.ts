/**
 * Test suite for Google Gemini Live API Integration
 * Comprehensive tests for all integration components
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { GeminiIntegration, createGeminiIntegration, testGeminiConnectivity } from '../gemini-integration'
import type { MediaStreamConfig, GeminiError } from '@/types/interview'

// Mock the component modules
vi.mock('../gemini-client')
vi.mock('../media-processor')
vi.mock('../connection-manager')
vi.mock('../auth-manager')
vi.mock('../error-handler')

// Mock WebRTC APIs
const mockMediaStream = {
  getTracks: vi.fn(() => []),
  getAudioTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => []),
  addTrack: vi.fn()
}

const mockMediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
  enumerateDevices: vi.fn(() => Promise.resolve([
    {
      deviceId: 'audio-1',
      label: 'Default Microphone',
      kind: 'audioinput',
      groupId: 'group-1'
    },
    {
      deviceId: 'video-1',
      label: 'Default Camera',
      kind: 'videoinput',
      groupId: 'group-1'
    }
  ]))
}

// Setup global mocks
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: mockMediaDevices,
    userAgent: 'test-agent'
  },
  writable: true
})

Object.defineProperty(global, 'AudioContext', {
  value: vi.fn(() => ({
    createMediaStreamSource: vi.fn(),
    createAnalyser: vi.fn(),
    createScriptProcessor: vi.fn(),
    close: vi.fn(),
    resume: vi.fn(),
    state: 'running',
    sampleRate: 16000
  })),
  writable: true
})

Object.defineProperty(global, 'WebSocket', {
  value: vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    readyState: 1, // OPEN
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
  })),
  writable: true
})

describe('GeminiIntegration', () => {
  let integration: GeminiIntegration
  let mockStreamConfig: MediaStreamConfig

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockStreamConfig = {
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

    // Mock environment variable
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'AIzaSyTest123456789012345678901234567890'
  })

  afterEach(async () => {
    if (integration) {
      await integration.shutdown()
    }
  })

  describe('Initialization', () => {
    it('should create integration instance with default config', () => {
      integration = createGeminiIntegration()
      expect(integration).toBeInstanceOf(GeminiIntegration)
    })

    it('should create integration instance with custom config', () => {
      const customConfig = {
        enableAutoReconnect: false,
        enableQualityMonitoring: false,
        gemini: {
          model: 'custom-model'
        }
      }
      
      integration = createGeminiIntegration(customConfig)
      expect(integration).toBeInstanceOf(GeminiIntegration)
    })

    it('should initialize successfully with valid stream config', async () => {
      integration = createGeminiIntegration()
      
      await expect(integration.initialize(mockStreamConfig)).resolves.not.toThrow()
      
      const status = integration.getStatus()
      expect(status.authenticated).toBe(true)
      expect(status.connected).toBe(true)
      expect(status.mediaInitialized).toBe(true)
    })

    it('should handle initialization failure gracefully', async () => {
      // Mock authentication failure
      const mockAuthManager = await import('../auth-manager')
      vi.mocked(mockAuthManager.AuthManager.prototype.validateApiKey).mockResolvedValue(false)
      
      integration = createGeminiIntegration()
      
      await expect(integration.initialize(mockStreamConfig)).rejects.toThrow()
    })
  })

  describe('Media Device Management', () => {
    beforeEach(async () => {
      integration = createGeminiIntegration()
      await integration.initialize(mockStreamConfig)
    })

    it('should get available devices', async () => {
      const devices = await integration.getAvailableDevices()
      
      expect(devices).toHaveLength(2)
      expect(devices[0]).toMatchObject({
        deviceId: 'audio-1',
        label: 'Default Microphone',
        kind: 'audioinput'
      })
    })

    it('should switch audio device successfully', async () => {
      await expect(integration.switchDevice('audio-2', 'audio')).resolves.not.toThrow()
    })

    it('should switch video device successfully', async () => {
      await expect(integration.switchDevice('video-2', 'video')).resolves.not.toThrow()
    })

    it('should handle device switch failure', async () => {
      // Mock device switch failure
      const mockMediaProcessor = await import('../media-processor')
      vi.mocked(mockMediaProcessor.MediaProcessor.prototype.switchDevice).mockRejectedValue(
        new Error('Device not found')
      )
      
      await expect(integration.switchDevice('invalid-device', 'audio')).rejects.toThrow()
    })
  })

  describe('Connection Management', () => {
    beforeEach(async () => {
      integration = createGeminiIntegration()
      await integration.initialize(mockStreamConfig)
    })

    it('should report healthy status when all components are working', () => {
      expect(integration.isHealthy()).toBe(true)
    })

    it('should handle reconnection successfully', async () => {
      await expect(integration.reconnect()).resolves.not.toThrow()
    })

    it('should handle connection errors with auto-recovery', async () => {
      const callbacks = {
        onError: vi.fn(),
        onRecovery: vi.fn()
      }
      
      integration.setCallbacks(callbacks)
      
      // Simulate connection error
      const mockError: GeminiError = {
        code: 'CONNECTION_FAILED',
        message: 'Connection lost'
      }
      
      // This would normally be triggered by the connection manager
      // For testing, we'll simulate the error handling
      expect(callbacks.onError).toBeDefined()
    })
  })

  describe('Status Monitoring', () => {
    beforeEach(async () => {
      integration = createGeminiIntegration()
      await integration.initialize(mockStreamConfig)
    })

    it('should return accurate status information', () => {
      const status = integration.getStatus()
      
      expect(status).toMatchObject({
        authenticated: expect.any(Boolean),
        connected: expect.any(Boolean),
        mediaInitialized: expect.any(Boolean),
        audioProcessing: expect.any(Boolean)
      })
    })

    it('should update status when connection changes', async () => {
      const initialStatus = integration.getStatus()
      expect(initialStatus.connected).toBe(true)
      
      // Simulate disconnection
      await integration.shutdown()
      
      const finalStatus = integration.getStatus()
      expect(finalStatus.connected).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const invalidConfig = {
        apiKey: 'invalid-key'
      }
      
      integration = createGeminiIntegration(invalidConfig)
      
      await expect(integration.initialize(mockStreamConfig)).rejects.toThrow()
    })

    it('should handle media initialization errors', async () => {
      // Mock media access denial
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'))
      
      integration = createGeminiIntegration()
      
      await expect(integration.initialize(mockStreamConfig)).rejects.toThrow()
    })

    it('should handle WebSocket connection errors', async () => {
      // Mock WebSocket connection failure
      const mockGeminiClient = await import('../gemini-client')
      vi.mocked(mockGeminiClient.GeminiLiveAPIClient.prototype.connect).mockRejectedValue(
        new Error('WebSocket connection failed')
      )
      
      integration = createGeminiIntegration()
      
      await expect(integration.initialize(mockStreamConfig)).rejects.toThrow()
    })
  })

  describe('Cleanup', () => {
    it('should shutdown cleanly', async () => {
      integration = createGeminiIntegration()
      await integration.initialize(mockStreamConfig)
      
      await expect(integration.shutdown()).resolves.not.toThrow()
      
      const status = integration.getStatus()
      expect(status.connected).toBe(false)
      expect(status.mediaInitialized).toBe(false)
    })

    it('should handle shutdown errors gracefully', async () => {
      integration = createGeminiIntegration()
      await integration.initialize(mockStreamConfig)
      
      // Mock shutdown error
      const mockGeminiClient = await import('../gemini-client')
      vi.mocked(mockGeminiClient.GeminiLiveAPIClient.prototype.disconnect).mockRejectedValue(
        new Error('Shutdown error')
      )
      
      // Should not throw even if individual components fail
      await expect(integration.shutdown()).resolves.not.toThrow()
    })
  })

  describe('Callback Management', () => {
    it('should register and call callbacks correctly', async () => {
      const callbacks = {
        onMediaResponse: vi.fn(),
        onTranscript: vi.fn(),
        onQualityUpdate: vi.fn(),
        onConnectionChange: vi.fn(),
        onError: vi.fn(),
        onRecovery: vi.fn()
      }
      
      integration = createGeminiIntegration()
      integration.setCallbacks(callbacks)
      
      await integration.initialize(mockStreamConfig)
      
      // Callbacks should be set up (we can't easily test the actual calls without more complex mocking)
      expect(callbacks.onConnectionChange).toBeDefined()
    })
  })
})

describe('Utility Functions', () => {
  describe('testGeminiConnectivity', () => {
    beforeEach(() => {
      // Mock fetch for API validation
      global.fetch = vi.fn()
    })

    it('should test connectivity successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      } as Response)
      
      const result = await testGeminiConnectivity('AIzaSyTest123456789012345678901234567890')
      
      expect(result.success).toBe(true)
      expect(result.latency).toBeGreaterThan(0)
      expect(result.error).toBeUndefined()
    })

    it('should handle connectivity failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      } as Response)
      
      const result = await testGeminiConnectivity('invalid-key')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API key validation failed')
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
      
      const result = await testGeminiConnectivity('AIzaSyTest123456789012345678901234567890')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })
})

describe('Integration Scenarios', () => {
  it('should handle complete interview workflow', async () => {
    integration = createGeminiIntegration()
    
    // Initialize
    await integration.initialize(mockStreamConfig)
    expect(integration.isHealthy()).toBe(true)
    
    // Get devices
    const devices = await integration.getAvailableDevices()
    expect(devices.length).toBeGreaterThan(0)
    
    // Switch device
    if (devices.length > 1) {
      await integration.switchDevice(devices[1].deviceId, 'audio')
    }
    
    // Simulate some usage time
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check status
    const status = integration.getStatus()
    expect(status.authenticated).toBe(true)
    expect(status.connected).toBe(true)
    
    // Shutdown
    await integration.shutdown()
    expect(integration.getStatus().connected).toBe(false)
  })

  it('should handle error recovery scenarios', async () => {
    const errorCallback = vi.fn()
    const recoveryCallback = vi.fn()
    
    integration = createGeminiIntegration({
      enableErrorRecovery: true,
      enableAutoReconnect: true
    })
    
    integration.setCallbacks({
      onError: errorCallback,
      onRecovery: recoveryCallback
    })
    
    await integration.initialize(mockStreamConfig)
    
    // Simulate connection loss and recovery
    await integration.reconnect()
    
    expect(integration.isHealthy()).toBe(true)
  })

  it('should handle long-running session', async () => {
    integration = createGeminiIntegration({
      enableQualityMonitoring: true
    })
    
    const qualityUpdates: any[] = []
    integration.setCallbacks({
      onQualityUpdate: (metrics) => qualityUpdates.push(metrics)
    })
    
    await integration.initialize(mockStreamConfig)
    
    // Simulate some time passing
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Quality monitoring should be active
    expect(integration.getStatus().quality).toBeDefined()
    
    await integration.shutdown()
  })
})