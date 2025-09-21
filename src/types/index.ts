// Core type definitions for Liora platform
// This file serves as the main entry point for all type definitions

import type { Notification, CallRequest, CallResponse } from './communication'

// ============================================================================
// RE-EXPORTS FROM SPECIALIZED TYPE FILES
// ============================================================================

// User and authentication types
export type {
  User,
  AuthState,
  LoginCredentials,
  AuthResponse,
  UserType
} from './user'

// Investment memo and company types
export type {
  CompanyOverview,
  MarketAnalysis,
  FounderProfile,
  CompetitorAnalysis,
  KPIMetrics,
  RiskAssessment,
  InvestmentMemo,
  InvestorPreferences,
  CompanyFilters,
  CompanyStage,
  RiskLevel
} from './investment'

// Communication and notification types
export type {
  Notification,
  CallRequest,
  CallResponse,
  MeetingSchedule,
  NotificationType,
  CallStatus,
  MeetingStatus
} from './communication'

// Form types
export type {
  FormField,
  FormState,
  CompanyDetailsFormData,
  InvestorPreferencesFormData,
  DynamicQuestion,
  QuestionResponse,
  FileUploadFormData,
  CompanySearchFormData,
  CallSchedulingFormData,
  FormWizardState,
  UseFormOptions,
  FormMethods,
  FormFieldType,
  ValidationRuleType,
  ConditionalAction,
  ConditionalCondition,
  MeetingType,
  CallDuration,
  SortBy
} from './forms'

// WebSocket types
export type {
  WebSocketConfig,
  ConnectionState,
  SocketEventMap,
  AudioStreamConfig,
  AudioChunk,
  AudioStreamState,
  UserPresence,
  WebSocketClient,
  SocketEvent,
  AudioFormat,
  UserStatus,
  MessagePriority,
  CollaborationType
} from './websocket'

// API types
export type {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  CreateCompanyRequest,
  FileUploadRequest,
  FileUploadResponse,
  StartAnalysisRequest,
  AnalysisStatusResponse,
  StartInterviewRequest,
  InterviewSessionResponse,
  MemoResponse,
  ApiError,
  SortOrder,
  FileType,
  AnalysisStatus,
  InterviewStatus,
  AccessLevel,
  ApiErrorCode
} from './api'

// State management types
export type {
  AppState,
  FounderState,
  InvestorState,
  UIState,
  WebSocketState,
  RootState,
  AppSlice,
  FounderSlice,
  InvestorSlice,
  WebSocketSlice,
  UISlice,
  PersistConfig,
  StorageAdapter
} from './stores'

// Chart types
export type {
  ChartDataPoint,
  ChartConfig,
  LineChartData,
  BarChartData,
  PieChartData,
  RadarChartData,
  MarketGrowthChartData,
  CompanyMetricsChartData,
  RiskRadarData,
  CompetitorComparisonData,
  ChartType,
  LegendPosition
} from './charts'

// Event types
export type {
  WebSocketEvents,
  EventMetadata,
  EventEnvelope,
  EventHandler,
  EventHandlerMap,
  QueuedEvent,
  EventQueue,
  WebSocketEventName,
  EventPriority,
  EventStatus,
  EventFilter,
  EventSubscription,
  EventBatch
} from './events'

// AI types
export type {
  AIQuestion,
  AIQuestionOption,
  AIQuestionValidation,
  AIConditionalLogic,
  AIQuestionCategory,
  AIQuestionResponse,
  AIInterviewConfig,
  AIInterviewSession,
  AITranscriptEntry,
  AIAudioSegment,
  AIInterviewAnalysis,
  AIAnalysisJob,
  AIAnalysisReport,
  AIProcessingPipeline,
  AIProcessingStage,
  AIProcessingResult,
  AIQuestionType,
  AIInterviewStatus,
  AIAnalysisStatus,
  AIPersonalityStyle,
  AIPersonalityTone,
  AISentiment,
  AIRiskLevel,
  AIInvestmentRecommendation,
  AIProcessingStageType,
  AIProcessingStatus
} from './ai'

// Error types
export type {
  BaseError,
  ValidationError as ErrorValidation,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  UploadError,
  WebSocketError,
  AIError,
  BusinessError,
  SystemError,
  ErrorContext,
  ErrorHandler,
  ErrorHandlingResult,
  ErrorAction,
  ErrorReport,
  ErrorMetrics,
  RetryPolicy,
  RetryAttempt,
  RetryState,
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorFallbackProps,
  FormFieldError,
  FormValidationError,
  APIErrorResponse,
  ErrorType,
  ErrorSeverity,
  LogLevel,
  ErrorActionType,
  Environment,
  DeviceType
} from './errors'

// Error factory functions
export {
  createAppError,
  createValidationError,
  createNetworkError
} from './errors'

// Validation utilities
export {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  hasProperty,
  isValidUserType,
  isValidUser,
  isValidCompanyStage,
  isValidCompanyOverview,
  isValidRiskLevel,
  isValidInvestmentMemo,
  isValidInvestorPreferences,
  isValidQuestionType,
  isValidQuestion,
  isValidNotificationType,
  isValidNotification,
  isValidCallStatus,
  isValidCallRequest,
  isValidUploadStatus,
  isValidFileUpload,
  isValidSocketEvent,
  validateEmail,
  validateUrl,
  validatePhoneNumber,
  validateYear,
  validateFunding,
  validateEmployeeCount,
  validateCompanyForm,
  validatePreferencesForm,
  sanitizeString,
  sanitizeNumber,
  sanitizeArray,
  deepClone,
  isEmpty
} from './validators'

// ============================================================================
// ADDITIONAL CORE TYPES
// ============================================================================

export interface Question {
  id: string
  text: string
  type: 'text' | 'number' | 'select' | 'multiselect'
  required: boolean
  options?: string[]
  category: string
}

export interface UploadProgress {
  [fileId: string]: number
}

// ============================================================================
// ADDITIONAL CORE TYPES FOR BACKWARD COMPATIBILITY
// ============================================================================

// Legacy WebSocket events interface for backward compatibility
export interface SocketEvents {
  // AI Interview Events
  'interview:start': { sessionId: string }
  'interview:audio': { audio: ArrayBuffer }
  'interview:transcript': { text: string; speaker: 'ai' | 'founder' }
  'interview:end': { sessionId: string }
  
  // Notification Events
  'notification:new': Notification
  'call:request': CallRequest
  'call:response': CallResponse
  
  // Status Update Events
  'memo:updated': { companyId: string; version: string }
  'analysis:progress': { companyId: string; progress: number }
  
  // Connection Events
  'connect': void
  'disconnect': void
  'error': { message: string; code?: string }
}

// Error handling types
export interface AppError {
  type: 'network' | 'validation' | 'auth' | 'upload' | 'websocket'
  message: string
  code?: string
  retryable: boolean
}

// Simplified API response for backward compatibility
export interface SimpleApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: AppError
  message?: string
}

// File upload types
export interface FileUpload {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
}

export interface UploadConfig {
  maxSize: number
  allowedTypes: string[]
  multiple: boolean
}

// Audio and interview types
export interface AudioConfig {
  sampleRate: number
  channels: number
  bitDepth: number
}

export interface InterviewSession {
  id: string
  founderId: string
  status: 'starting' | 'active' | 'paused' | 'completed' | 'error'
  startTime: string
  endTime?: string
  transcript: TranscriptEntry[]
  audioConfig: AudioConfig
}

export interface TranscriptEntry {
  id: string
  speaker: 'ai' | 'founder'
  text: string
  timestamp: string
  confidence?: number
}