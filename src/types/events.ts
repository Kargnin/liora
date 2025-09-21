// WebSocket event type definitions for real-time communication

import type { 
  Notification, 
  CallRequest, 
  CallResponse,
  TranscriptEntry 
} from './index'

// ============================================================================
// WEBSOCKET EVENT DEFINITIONS
// ============================================================================

export interface WebSocketEvents {
  // Connection Management Events
  'connection:established': {
    userId: string
    sessionId: string
    timestamp: string
  }
  'connection:lost': {
    reason: string
    timestamp: string
  }
  'connection:restored': {
    sessionId: string
    timestamp: string
  }
  
  // AI Interview Events
  'interview:start': {
    sessionId: string
    founderId: string
    audioConfig: {
      sampleRate: number
      channels: number
      format: string
    }
  }
  'interview:audio_chunk': {
    sessionId: string
    audio: ArrayBuffer
    sequenceNumber: number
    timestamp: number
  }
  'interview:transcript': {
    sessionId: string
    text: string
    speaker: 'ai' | 'founder'
    timestamp: number
    confidence?: number
    isFinal: boolean
  }
  'interview:ai_response': {
    sessionId: string
    audio: ArrayBuffer
    text: string
    timestamp: number
  }
  'interview:pause': {
    sessionId: string
    timestamp: number
  }
  'interview:resume': {
    sessionId: string
    timestamp: number
  }
  'interview:end': {
    sessionId: string
    duration: number
    transcriptLength: number
    timestamp: string
  }
  'interview:error': {
    sessionId: string
    error: string
    code?: string
    timestamp: string
  }
  
  // Notification Events
  'notification:new': Notification
  'notification:read': {
    notificationId: string
    userId: string
    timestamp: string
  }
  'notification:bulk_read': {
    notificationIds: string[]
    userId: string
    timestamp: string
  }
  
  // Call Scheduling Events
  'call:request': CallRequest
  'call:response': CallResponse
  'call:scheduled': {
    requestId: string
    investorId: string
    founderId: string
    scheduledTime: string
    duration: number
    meetingLink?: string
    agenda?: string
  }
  'call:cancelled': {
    requestId: string
    cancelledBy: string
    reason?: string
    timestamp: string
  }
  'call:reminder': {
    requestId: string
    participants: string[]
    scheduledTime: string
    minutesUntil: number
  }
  
  // Analysis and Memo Events
  'analysis:started': {
    companyId: string
    analysisId: string
    estimatedDuration: number
    timestamp: string
  }
  'analysis:progress': {
    companyId: string
    analysisId: string
    progress: number
    stage: string
    estimatedCompletion?: string
  }
  'analysis:completed': {
    companyId: string
    analysisId: string
    memoId: string
    timestamp: string
  }
  'analysis:error': {
    companyId: string
    analysisId: string
    error: string
    code?: string
    timestamp: string
  }
  'memo:updated': {
    companyId: string
    memoId: string
    version: string
    changes: string[]
    timestamp: string
  }
  'memo:viewed': {
    memoId: string
    viewerId: string
    timestamp: string
  }
  
  // User Presence Events
  'user:online': {
    userId: string
    userName: string
    userType: 'founder' | 'investor'
    timestamp: string
  }
  'user:offline': {
    userId: string
    timestamp: string
  }
  'user:status_change': {
    userId: string
    status: 'online' | 'away' | 'busy'
    timestamp: string
  }
  'user:typing': {
    userId: string
    context: string // e.g., 'chat', 'form', 'comment'
    timestamp: string
  }
  'user:stopped_typing': {
    userId: string
    context: string
    timestamp: string
  }
  
  // File Upload Events
  'upload:started': {
    uploadId: string
    fileName: string
    fileSize: number
    fileType: string
    companyId: string
  }
  'upload:progress': {
    uploadId: string
    progress: number
    bytesUploaded: number
    totalBytes: number
  }
  'upload:completed': {
    uploadId: string
    fileId: string
    url: string
    processedAt: string
  }
  'upload:error': {
    uploadId: string
    error: string
    code?: string
  }
  
  // System Events
  'system:maintenance': {
    message: string
    scheduledTime?: string
    duration?: number
    affectedServices?: string[]
  }
  'system:announcement': {
    id: string
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    targetUsers?: string[]
    expiresAt?: string
  }
  'system:error': {
    error: string
    code?: string
    timestamp: string
    context?: Record<string, unknown>
  }
  
  // Company Discovery Events
  'company:match_updated': {
    investorId: string
    companyId: string
    matchScore: number
    reasons: string[]
    timestamp: string
  }
  'company:new_listing': {
    companyId: string
    sector: string
    stage: string
    targetInvestors?: string[]
  }
  'company:profile_updated': {
    companyId: string
    changes: string[]
    timestamp: string
  }
  
  // Collaboration Events
  'collaboration:cursor_move': {
    userId: string
    x: number
    y: number
    elementId?: string
  }
  'collaboration:selection': {
    userId: string
    elementId: string
    startOffset: number
    endOffset: number
  }
  'collaboration:comment': {
    id: string
    userId: string
    elementId: string
    text: string
    timestamp: string
  }
  'collaboration:edit': {
    userId: string
    elementId: string
    operation: 'insert' | 'delete' | 'replace'
    content: string
    position: number
  }
}

// ============================================================================
// EVENT METADATA TYPES
// ============================================================================

export interface EventMetadata {
  eventId: string
  timestamp: string
  userId?: string
  sessionId?: string
  version: string
  retryCount?: number
}

export interface EventEnvelope<T extends keyof WebSocketEvents> {
  event: T
  data: WebSocketEvents[T]
  metadata: EventMetadata
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type EventHandler<T extends keyof WebSocketEvents> = (
  data: WebSocketEvents[T],
  metadata: EventMetadata
) => void | Promise<void>

export type EventHandlerMap = {
  [K in keyof WebSocketEvents]?: EventHandler<K>
}

// ============================================================================
// EVENT QUEUE TYPES
// ============================================================================

export interface QueuedEvent<T extends keyof WebSocketEvents = keyof WebSocketEvents> {
  id: string
  event: T
  data: WebSocketEvents[T]
  metadata: EventMetadata
  priority: 'low' | 'normal' | 'high' | 'critical'
  maxRetries: number
  retryCount: number
  nextRetryAt?: string
}

export interface EventQueue {
  pending: QueuedEvent[]
  processing: QueuedEvent[]
  failed: QueuedEvent[]
  completed: string[] // Event IDs
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WebSocketEventName = keyof WebSocketEvents
export type EventPriority = 'low' | 'normal' | 'high' | 'critical'
export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Event filtering and subscription types
export interface EventFilter {
  events?: WebSocketEventName[]
  userId?: string
  companyId?: string
  sessionId?: string
  priority?: EventPriority[]
}

export interface EventSubscription {
  id: string
  filter: EventFilter
  handler: EventHandler<WebSocketEventName>
  active: boolean
  createdAt: string
}

// Batch event processing
export interface EventBatch {
  id: string
  events: QueuedEvent[]
  createdAt: string
  processedAt?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}