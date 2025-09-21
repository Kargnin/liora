/**
 * Vitest setup file for test configuration
 */

import { vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api'
process.env.LANGSMITH_API_KEY = 'test-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock WebRTC APIs that might be used in media processing
Object.defineProperty(window, 'MediaStream', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getTracks: vi.fn(() => []),
    addTrack: vi.fn(),
    removeTrack: vi.fn()
  }))
})

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(),
    enumerateDevices: vi.fn(() => Promise.resolve([])),
    getDisplayMedia: vi.fn()
  }
})

// Mock audio context for audio processing
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createAnalyser: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      getByteFrequencyData: vi.fn(),
      frequencyBinCount: 1024
    })),
    createMediaStreamSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn()
    })),
    close: vi.fn(),
    resume: vi.fn(() => Promise.resolve())
  }))
})

// Mock WebSocket for real-time communication
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1 // OPEN
  }))
})

// Setup test timeout
vi.setConfig({
  testTimeout: 10000 // 10 seconds
})