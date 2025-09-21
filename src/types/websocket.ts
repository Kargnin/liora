// WebSocket-specific type definitions for real-time communication

import type { Notification, CallRequest, CallResponse } from './index'

// ============================================================================
// WEBSOCKET CONNECTION TYPES
// ============================================================================

export interface WebSocketConfig {
  url: string
  reconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  timeout: number
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected?: string
  reconnectAttempts: number
  error?: string
}

// ============================================================================
// WEBSOCKET EVENT DEFINITIONS
// ============================================================================

export interface SocketEventMap {
  // Connection events
  connect: void
  disconnect: { reason: string }
  error: { message: string; code?: string }
  
  // AI Interview events
  'interview:start': { sessionId: string; founderId: string }
  'interview:audio': { sessionId: string; audio: ArrayBuffer; timestamp: number }
  'interview:transcript': { 
    sessionId: string
    text: string
    speaker: 'ai' | 'founder'
    timestamp: number
    confidence?: number
  }
  'interview:end': { sessionId: string; duration: number }
  'interview:error': { sessionId: string; error: string }
  
  // Notification events
  'notification:new': Notification
  'notification:read': { notificationId: string; userId: string }
  
  // Call scheduling events
  'call:request': CallRequest
  'call:response': CallResponse
  'call:scheduled': { 
    requestId: string
    scheduledTime: string
    meetingLink?: string
  }
  
  // Status update events
  'memo:updated': { companyId: string; version: string; progress: number }
  'analysis:progress': { companyId: string; progress: number; stage: string }
  'analysis:complete': { companyId: string; memoId: string }
  'analysis:error': { companyId: string; error: string }
  
  // User presence events
  'user:online': { userId: string; userType: 'founder' | 'investor' }
  'user:offline': { userId: string }
  
  // System events
  'system:maintenance': { message: string; scheduledTime?: string }
  'system:announcement': { title: string; message: string; priority: 'low' | 'medium' | 'high' }
}

// ============================================================================
// AUDIO STREAMING TYPES
// ============================================================================

export interface AudioStreamConfig {
  sampleRate: 16000 | 22050 | 44100 | 48000
  channels: 1 | 2
  bitDepth: 16 | 24 | 32
  format: 'pcm' | 'wav' | 'mp3'
  chunkSize: number
}

export interface AudioChunk {
  sessionId: string
  sequenceNumber: number
  data: ArrayBuffer
  timestamp: number
  isLast: boolean
}

export interface AudioStreamState {
  isRecording: boolean
  isPlaying: boolean
  volume: number
  muted: boolean
  deviceId?: string
}

// ============================================================================
// REAL-TIME COLLABORATION TYPES
// ============================================================================

export interface UserPresence {
  userId: string
  userName: string
  userType: 'founder' | 'investor'
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
  currentPage?: string
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'comment'
  userId: string
  timestamp: number
  data: Record<string, unknown>
}

// ============================================================================
// MESSAGE QUEUE TYPES
// ============================================================================

export interface QueuedMessage {
  id: string
  event: keyof SocketEventMap
  data: unknown
  timestamp: number
  retryCount: number
  priority: 'low' | 'normal' | 'high'
}

export interface MessageQueue {
  pending: QueuedMessage[]
  failed: QueuedMessage[]
  maxRetries: number
  retryDelay: number
}

// ============================================================================
// WEBSOCKET CLIENT INTERFACE
// ============================================================================

export interface WebSocketClient {
  connect: () => Promise<void>
  disconnect: () => void
  emit: <K extends keyof SocketEventMap>(
    event: K,
    data: SocketEventMap[K]
  ) => void
  on: <K extends keyof SocketEventMap>(
    event: K,
    handler: (data: SocketEventMap[K]) => void
  ) => void
  off: <K extends keyof SocketEventMap>(
    event: K,
    handler?: (data: SocketEventMap[K]) => void
  ) => void
  getConnectionState: () => ConnectionState
  isConnected: () => boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SocketEvent = keyof SocketEventMap
export type AudioFormat = 'pcm' | 'wav' | 'mp3'
export type UserStatus = 'online' | 'away' | 'busy' | 'offline'
export type MessagePriority = 'low' | 'normal' | 'high'
export type CollaborationType = 'cursor' | 'selection' | 'edit' | 'comment'