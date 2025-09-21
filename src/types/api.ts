// API-specific type definitions for backend communication

import type { 
  User, 
  CompanyOverview, 
  InvestmentMemo, 
  InvestorPreferences,
  Question,
  CallRequest,
  Notification
} from './index'

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
    requestId: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    pagination: PaginationMeta
    timestamp: string
    requestId: string
  }
}

// ============================================================================
// AUTHENTICATION API TYPES
// ============================================================================

export interface LoginRequest {
  name: string
  userType: 'founder' | 'investor'
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  token: string
}

// ============================================================================
// COMPANY API TYPES
// ============================================================================

export interface CreateCompanyRequest {
  name: string
  description: string
  sector: string
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+'
  foundedYear: number
  location: string
  website?: string
  tagline: string
  employeeCount: number
  fundingRaised: number
  valuation?: number
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  id: string
}

export interface CompanyListRequest {
  page?: number
  limit?: number
  sector?: string[]
  stage?: string[]
  location?: string
  fundingMin?: number
  fundingMax?: number
  search?: string
  sortBy?: 'name' | 'funding' | 'stage' | 'match_score'
  sortOrder?: 'asc' | 'desc'
}

export interface CompanyMatchRequest {
  investorId: string
  preferences: InvestorPreferences
}

// ============================================================================
// FILE UPLOAD API TYPES
// ============================================================================

export interface FileUploadRequest {
  companyId: string
  fileType: 'pitch_deck' | 'pitch_video' | 'pitch_audio' | 'financial_docs' | 'other'
  fileName: string
  fileSize: number
  mimeType: string
}

export interface FileUploadResponse {
  uploadId: string
  uploadUrl: string
  expiresAt: string
  maxSize: number
}

export interface FileUploadCompleteRequest {
  uploadId: string
  fileName: string
  fileSize: number
  checksum?: string
}

export interface FileUploadCompleteResponse {
  fileId: string
  url: string
  processedAt?: string
}

// ============================================================================
// AI ANALYSIS API TYPES
// ============================================================================

export interface StartAnalysisRequest {
  companyId: string
  files: {
    fileId: string
    type: 'pitch_deck' | 'pitch_video' | 'pitch_audio' | 'financial_docs'
  }[]
  companyData: CompanyOverview
}

export interface AnalysisStatusResponse {
  companyId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  stage: string
  estimatedCompletion?: string
  error?: string
}

export interface GenerateQuestionsRequest {
  companyId: string
  analysisId: string
}

export interface QuestionsResponse {
  questions: Question[]
  totalQuestions: number
  estimatedTime: number
}

export interface SubmitAnswersRequest {
  companyId: string
  answers: {
    questionId: string
    answer: string | number | string[]
  }[]
}

// ============================================================================
// AI INTERVIEW API TYPES
// ============================================================================

export interface StartInterviewRequest {
  companyId: string
  founderId: string
  audioConfig: {
    sampleRate: number
    channels: number
    format: string
  }
}

export interface InterviewSessionResponse {
  sessionId: string
  websocketUrl: string
  token: string
  expiresAt: string
}

export interface InterviewStatusRequest {
  sessionId: string
}

export interface InterviewStatusResponse {
  sessionId: string
  status: 'starting' | 'active' | 'paused' | 'completed' | 'error'
  duration: number
  transcriptLength: number
  error?: string
}

// ============================================================================
// INVESTMENT MEMO API TYPES
// ============================================================================

export interface GetMemoRequest {
  companyId: string
  version?: string
}

export interface MemoListRequest {
  investorId: string
  page?: number
  limit?: number
  sector?: string[]
  stage?: string[]
  minScore?: number
  maxScore?: number
  sortBy?: 'score' | 'created_at' | 'company_name'
  sortOrder?: 'asc' | 'desc'
}

export interface MemoResponse extends InvestmentMemo {
  accessLevel: 'full' | 'summary' | 'restricted'
  viewCount: number
  lastViewed?: string
}

// ============================================================================
// INVESTOR PREFERENCES API TYPES
// ============================================================================

export interface UpdatePreferencesRequest {
  investorId: string
  preferences: InvestorPreferences
}

export interface PreferencesResponse {
  preferences: InvestorPreferences
  updatedAt: string
  matchingCompanies: number
}

// ============================================================================
// CALL SCHEDULING API TYPES
// ============================================================================

export interface CreateCallRequestRequest {
  investorId: string
  companyId: string
  message?: string
  preferredTimes?: string[]
}

export interface CallRequestResponse extends CallRequest {
  founderName: string
  companyName: string
  investorPreferences?: InvestorPreferences
}

export interface RespondToCallRequest {
  requestId: string
  status: 'accepted' | 'declined'
  message?: string
  proposedTimes?: string[]
}

export interface ScheduleCallRequest {
  requestId: string
  scheduledTime: string
  meetingLink?: string
  agenda?: string
}

// ============================================================================
// NOTIFICATION API TYPES
// ============================================================================

export interface NotificationListRequest {
  userId: string
  page?: number
  limit?: number
  type?: string[]
  read?: boolean
  since?: string
}

export interface MarkNotificationReadRequest {
  notificationId: string
  userId: string
}

export interface CreateNotificationRequest {
  userId: string
  type: 'call-request' | 'call-response' | 'memo-update' | 'system'
  title: string
  message: string
  metadata?: Record<string, unknown>
}

// ============================================================================
// ANALYTICS API TYPES
// ============================================================================

export interface AnalyticsRequest {
  userId: string
  userType: 'founder' | 'investor'
  dateRange: {
    start: string
    end: string
  }
  metrics?: string[]
}

export interface FounderAnalyticsResponse {
  profileViews: number
  memoGenerations: number
  callRequests: number
  interviewsCompleted: number
  averageScore: number
  sectorRanking?: number
}

export interface InvestorAnalyticsResponse {
  companiesViewed: number
  memosAccessed: number
  callsScheduled: number
  averageEngagement: number
  topSectors: string[]
  matchAccuracy: number
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
  requestId?: string
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR'
  details: Record<string, unknown> & {
    fields: {
      field: string
      message: string
      value?: unknown
    }[]
  }
}

export interface AuthenticationError extends ApiError {
  code: 'AUTHENTICATION_ERROR' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN'
}

export interface AuthorizationError extends ApiError {
  code: 'AUTHORIZATION_ERROR' | 'INSUFFICIENT_PERMISSIONS'
}

export interface NotFoundError extends ApiError {
  code: 'NOT_FOUND'
  details: {
    resource: string
    id: string
  }
}

export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED'
  details: {
    limit: number
    remaining: number
    resetTime: string
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc'
export type FileType = 'pitch_deck' | 'pitch_video' | 'pitch_audio' | 'financial_docs' | 'other'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type InterviewStatus = 'starting' | 'active' | 'paused' | 'completed' | 'error'
export type AccessLevel = 'full' | 'summary' | 'restricted'
export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'