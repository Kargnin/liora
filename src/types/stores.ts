// State management type definitions for Zustand stores

import type {
  User,
  InvestorPreferences,
  CompanyOverview,
  InvestmentMemo,
  Notification,
  Question,
  CompanyFilters,
  CallRequest,
  InterviewSession,
  TranscriptEntry
} from './index'

// ============================================================================
// GLOBAL APP STATE
// ============================================================================

export interface AppState {
  // User authentication
  user: User | null
  isAuthenticated: boolean
  userType: 'founder' | 'investor' | null
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  
  // Actions
  setUser: (user: User) => void
  logout: () => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (notificationId: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

// ============================================================================
// FOUNDER-SPECIFIC STATE
// ============================================================================

export interface FounderState {
  // Company data
  companyData: Partial<CompanyOverview>
  isCompanyDataComplete: boolean
  
  // File uploads
  uploadProgress: Record<string, number>
  uploadedFiles: Record<string, { id: string; url: string; type: string }>
  
  // Form progress
  currentStep: number
  completedSteps: number[]
  
  // AI questions
  aiQuestions: Question[]
  questionResponses: Record<string, string | number | string[]>
  questionsCompleted: boolean
  
  // Interview
  interviewStatus: 'not_started' | 'pending' | 'scheduled' | 'in_progress' | 'completed'
  interviewSession: InterviewSession | null
  
  // Analysis status
  analysisProgress: number
  analysisStage: string
  memoGenerated: boolean
  
  // Call requests
  incomingCallRequests: CallRequest[]
  
  // Actions
  updateCompanyData: (data: Partial<CompanyOverview>) => void
  setCompanyDataComplete: (complete: boolean) => void
  setUploadProgress: (fileId: string, progress: number) => void
  addUploadedFile: (fileId: string, file: { id: string; url: string; type: string }) => void
  removeUploadedFile: (fileId: string) => void
  setCurrentStep: (step: number) => void
  markStepCompleted: (step: number) => void
  setAiQuestions: (questions: Question[]) => void
  setQuestionResponse: (questionId: string, response: string | number | string[]) => void
  setQuestionsCompleted: (completed: boolean) => void
  setInterviewStatus: (status: 'not_started' | 'pending' | 'scheduled' | 'in_progress' | 'completed') => void
  setInterviewSession: (session: InterviewSession | null) => void
  setAnalysisProgress: (progress: number, stage: string) => void
  setMemoGenerated: (generated: boolean) => void
  addCallRequest: (request: CallRequest) => void
  updateCallRequest: (requestId: string, updates: Partial<CallRequest>) => void
  removeCallRequest: (requestId: string) => void
  resetFounderState: () => void
}

// ============================================================================
// INVESTOR-SPECIFIC STATE
// ============================================================================

export interface InvestorState {
  // Preferences
  preferences: InvestorPreferences | null
  preferencesSet: boolean
  
  // Company discovery
  companies: CompanyOverview[]
  totalCompanies: number
  currentPage: number
  
  // Filters and search
  filters: CompanyFilters
  searchQuery: string
  sortBy: 'match_score' | 'funding' | 'name' | 'stage' | 'founded'
  sortOrder: 'asc' | 'desc'
  
  // Selected company
  selectedCompany: InvestmentMemo | null
  companyHistory: string[] // Company IDs viewed
  
  // Call requests
  sentCallRequests: CallRequest[]
  scheduledCalls: Array<{
    id: string
    companyId: string
    companyName: string
    scheduledTime: string
    meetingLink?: string
  }>
  
  // Bookmarks and favorites
  bookmarkedCompanies: string[]
  
  // Actions
  setPreferences: (preferences: InvestorPreferences) => void
  setPreferencesSet: (set: boolean) => void
  setCompanies: (companies: CompanyOverview[], total: number) => void
  addCompanies: (companies: CompanyOverview[]) => void
  setCurrentPage: (page: number) => void
  setFilters: (filters: Partial<CompanyFilters>) => void
  setSearchQuery: (query: string) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  setSelectedCompany: (company: InvestmentMemo | null) => void
  addToHistory: (companyId: string) => void
  addCallRequest: (request: CallRequest) => void
  updateCallRequest: (requestId: string, updates: Partial<CallRequest>) => void
  addScheduledCall: (call: { id: string; companyId: string; companyName: string; scheduledTime: string; meetingLink?: string }) => void
  toggleBookmark: (companyId: string) => void
  resetInvestorState: () => void
}

// ============================================================================
// WEBSOCKET STATE
// ============================================================================

export interface WebSocketState {
  // Connection status
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastConnected: string | null
  reconnectAttempts: number
  
  // Audio streaming
  isRecording: boolean
  isPlaying: boolean
  audioLevel: number
  
  // Interview session
  activeSession: string | null
  transcript: TranscriptEntry[]
  
  // Real-time updates
  pendingUpdates: Array<{
    type: string
    data: unknown
    timestamp: string
  }>
  
  // Actions
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  setLastConnected: (timestamp: string) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  setRecording: (recording: boolean) => void
  setPlaying: (playing: boolean) => void
  setAudioLevel: (level: number) => void
  setActiveSession: (sessionId: string | null) => void
  addTranscriptEntry: (entry: TranscriptEntry) => void
  clearTranscript: () => void
  addPendingUpdate: (update: { type: string; data: unknown; timestamp: string }) => void
  processPendingUpdates: () => void
  resetWebSocketState: () => void
}

// ============================================================================
// UI STATE
// ============================================================================

export interface UIState {
  // Loading states
  loading: Record<string, boolean>
  
  // Modal states
  modals: Record<string, { open: boolean; data?: unknown }>
  
  // Toast notifications
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    timestamp: string
  }>
  
  // Form states
  forms: Record<string, {
    isDirty: boolean
    isSubmitting: boolean
    errors: Record<string, string>
  }>
  
  // Actions
  setLoading: (key: string, loading: boolean) => void
  openModal: (modalId: string, data?: unknown) => void
  closeModal: (modalId: string) => void
  addToast: (toast: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }) => void
  removeToast: (toastId: string) => void
  setFormState: (formId: string, state: Partial<{
    isDirty: boolean
    isSubmitting: boolean
    errors: Record<string, string>
  }>) => void
  resetFormState: (formId: string) => void
  resetUIState: () => void
}

// ============================================================================
// COMBINED STORE TYPE
// ============================================================================

export interface RootState {
  app: AppState
  founder: FounderState
  investor: InvestorState
  websocket: WebSocketState
  ui: UIState
}

// ============================================================================
// STORE SLICE TYPES
// ============================================================================

export type AppSlice = (
  set: (fn: (state: AppState) => void) => void,
  get: () => AppState
) => AppState

export type FounderSlice = (
  set: (fn: (state: FounderState) => void) => void,
  get: () => FounderState
) => FounderState

export type InvestorSlice = (
  set: (fn: (state: InvestorState) => void) => void,
  get: () => InvestorState
) => InvestorState

export type WebSocketSlice = (
  set: (fn: (state: WebSocketState) => void) => void,
  get: () => WebSocketState
) => WebSocketSlice

export type UISlice = (
  set: (fn: (state: UIState) => void) => void,
  get: () => UIState
) => UIState

// ============================================================================
// STORE PERSISTENCE TYPES
// ============================================================================

export interface PersistConfig {
  name: string
  version: number
  partialize?: (state: unknown) => unknown
  migrate?: (persistedState: unknown, version: number) => unknown
  whitelist?: string[]
  blacklist?: string[]
}

export interface StorageAdapter {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type StoreSlice<T> = (
  set: (fn: (state: T) => void) => void,
  get: () => T
) => T

export type StoreActions<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? T[K] : never
}

export type StoreState<T> = Omit<T, keyof StoreActions<T>>