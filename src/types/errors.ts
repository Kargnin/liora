// Error handling and exception type definitions

// ============================================================================
// BASE ERROR TYPES
// ============================================================================

export interface BaseError {
  code: string
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  context?: Record<string, unknown>
}

export interface AppError extends BaseError {
  type: 'network' | 'validation' | 'auth' | 'upload' | 'websocket' | 'ai' | 'business' | 'system'
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  userMessage?: string
  technicalDetails?: string
  suggestedActions?: string[]
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

export interface ValidationError extends BaseError {
  type: 'validation'
  field?: string
  value?: unknown
  constraints: {
    rule: string
    message: string
    params?: Record<string, unknown>
  }[]
}

export interface AuthenticationError extends BaseError {
  type: 'authentication'
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'session_expired' | 'account_locked'
  retryAfter?: number
}

export interface AuthorizationError extends BaseError {
  type: 'authorization'
  resource: string
  action: string
  requiredPermissions: string[]
  userPermissions: string[]
}

export interface NetworkError extends BaseError {
  type: 'network'
  status?: number
  statusText?: string
  url?: string
  method?: string
  timeout?: boolean
  retryCount?: number
}

export interface UploadError extends BaseError {
  type: 'upload'
  fileId: string
  fileName: string
  fileSize: number
  reason: 'file_too_large' | 'invalid_format' | 'upload_failed' | 'processing_failed' | 'virus_detected'
  maxSize?: number
  allowedFormats?: string[]
}

export interface WebSocketError extends BaseError {
  type: 'websocket'
  event?: string
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error'
  reconnectAttempts?: number
  lastConnected?: string
}

export interface AIError extends BaseError {
  type: 'ai'
  service: 'gemini' | 'analysis' | 'interview' | 'question_generation' | 'memo_generation'
  operation: string
  modelVersion?: string
  tokensUsed?: number
  reason: 'quota_exceeded' | 'model_unavailable' | 'processing_failed' | 'invalid_input' | 'timeout'
}

export interface BusinessError extends BaseError {
  type: 'business'
  domain: 'company' | 'investor' | 'memo' | 'interview' | 'call_scheduling'
  rule: string
  conflictingData?: Record<string, unknown>
}

export interface SystemError extends BaseError {
  type: 'system'
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedUsers?: string[]
  estimatedResolution?: string
}

// ============================================================================
// ERROR CONTEXT TYPES
// ============================================================================

export interface ErrorContext {
  // User context
  userId?: string
  userType?: 'founder' | 'investor'
  sessionId?: string
  
  // Request context
  requestId?: string
  endpoint?: string
  method?: string
  userAgent?: string
  ipAddress?: string
  
  // Application context
  component?: string
  feature?: string
  version?: string
  environment?: 'development' | 'staging' | 'production'
  
  // Business context
  companyId?: string
  memoId?: string
  interviewId?: string
  uploadId?: string
  
  // Technical context
  stackTrace?: string
  browserInfo?: {
    name: string
    version: string
    os: string
  }
  deviceInfo?: {
    type: 'desktop' | 'tablet' | 'mobile'
    screen: string
    memory?: number
  }
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorHandler {
  canHandle: (error: AppError) => boolean
  handle: (error: AppError, context?: ErrorContext) => Promise<ErrorHandlingResult>
  priority: number
}

export interface ErrorHandlingResult {
  handled: boolean
  retry?: boolean
  retryAfter?: number
  userNotification?: {
    type: 'toast' | 'modal' | 'banner'
    title: string
    message: string
    actions?: ErrorAction[]
  }
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  reportToService?: boolean
}

export interface ErrorAction {
  label: string
  action: 'retry' | 'refresh' | 'navigate' | 'contact_support' | 'dismiss'
  url?: string
  callback?: () => void
}

// ============================================================================
// ERROR REPORTING TYPES
// ============================================================================

export interface ErrorReport {
  id: string
  error: AppError
  context: ErrorContext
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  resolution?: string
  tags: string[]
  fingerprint: string // For grouping similar errors
  occurrenceCount: number
  firstSeen: string
  lastSeen: string
  affectedUsers: number
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByComponent: Record<string, number>
  errorRate: number
  meanTimeToResolution: number
  topErrors: {
    fingerprint: string
    count: number
    message: string
    lastSeen: string
  }[]
}

// ============================================================================
// RETRY POLICY TYPES
// ============================================================================

export interface RetryPolicy {
  maxAttempts: number
  baseDelay: number // milliseconds
  maxDelay: number // milliseconds
  backoffMultiplier: number
  jitter: boolean
  retryableErrors: string[] // Error codes
  nonRetryableErrors: string[] // Error codes
}

export interface RetryAttempt {
  attemptNumber: number
  timestamp: string
  error: AppError
  nextRetryAt?: string
}

export interface RetryState {
  attempts: RetryAttempt[]
  isRetrying: boolean
  nextRetryAt?: string
  giveUpAt?: string
}

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: {
    componentStack: string
  }
  errorId?: string
  retryCount: number
}

export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  retryCount: number
}

// ============================================================================
// FORM ERROR TYPES
// ============================================================================

export interface FormFieldError {
  field: string
  message: string
  type: 'required' | 'format' | 'min' | 'max' | 'custom'
  value?: unknown
}

export interface FormValidationError {
  fields: FormFieldError[]
  general?: string[]
  summary: string
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface APIErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    validation?: FormFieldError[]
  }
  meta?: {
    requestId: string
    timestamp: string
    version: string
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ErrorType = 'network' | 'validation' | 'auth' | 'upload' | 'websocket' | 'ai' | 'business' | 'system'
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type NotificationType = 'toast' | 'modal' | 'banner'
export type ErrorActionType = 'retry' | 'refresh' | 'navigate' | 'contact_support' | 'dismiss'
export type Environment = 'development' | 'staging' | 'production'
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// Error factory functions
export const createAppError = (
  type: ErrorType,
  code: string,
  message: string,
  options?: Partial<AppError>
): AppError => ({
  type,
  code,
  message,
  timestamp: new Date().toISOString(),
  retryable: false,
  severity: 'medium',
  ...options
})

export const createValidationError = (
  field: string,
  message: string,
  constraints: ValidationError['constraints']
): ValidationError => ({
  type: 'validation',
  code: 'VALIDATION_ERROR',
  message,
  timestamp: new Date().toISOString(),
  field,
  constraints
})

export const createNetworkError = (
  message: string,
  status?: number,
  url?: string
): NetworkError => ({
  type: 'network',
  code: 'NETWORK_ERROR',
  message,
  timestamp: new Date().toISOString(),
  status,
  url
})