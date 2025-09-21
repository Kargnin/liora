// State management type definitions

import { User } from './user'
import { Notification } from './communication'
import { CompanyOverview, InvestorPreferences, InvestmentMemo, CompanyFilters } from './investment'
import { DynamicQuestion } from './forms'

// Global app state
export interface AppState {
  user: User | null
  isAuthenticated: boolean
  userType: 'founder' | 'investor' | null
  notifications: Notification[]
  setUser: (user: User) => void
  logout: () => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void
}

// Founder-specific state
export interface FounderState {
  companyData: Partial<CompanyOverview>
  uploadProgress: Record<string, number>
  currentStep: number
  aiQuestions: DynamicQuestion[]
  interviewStatus: 'pending' | 'scheduled' | 'completed'
  memoStatus: 'not-started' | 'processing' | 'completed' | 'error'
  updateCompanyData: (data: Partial<CompanyOverview>) => void
  setUploadProgress: (fileId: string, progress: number) => void
  setCurrentStep: (step: number) => void
  setAiQuestions: (questions: DynamicQuestion[]) => void
  setInterviewStatus: (status: 'pending' | 'scheduled' | 'completed') => void
  setMemoStatus: (status: 'not-started' | 'processing' | 'completed' | 'error') => void
  resetFounderState: () => void
}

// Investor-specific state
export interface InvestorState {
  preferences: InvestorPreferences | null
  companies: CompanyOverview[]
  selectedCompany: InvestmentMemo | null
  filters: CompanyFilters
  searchQuery: string
  sortBy: 'match' | 'funding' | 'stage' | 'name'
  sortOrder: 'asc' | 'desc'
  setPreferences: (preferences: InvestorPreferences) => void
  setCompanies: (companies: CompanyOverview[]) => void
  setSelectedCompany: (company: InvestmentMemo | null) => void
  setFilters: (filters: CompanyFilters) => void
  setSearchQuery: (query: string) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  resetInvestorState: () => void
}

// UI state for loading, errors, etc.
export interface UIState {
  isLoading: boolean
  error: string | null
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  modalOpen: boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setModalOpen: (open: boolean) => void
}

// WebSocket connection state
export interface WebSocketState {
  connected: boolean
  reconnecting: boolean
  error: string | null
  lastConnected: string | null
  reconnectAttempts: number
  setConnected: (connected: boolean) => void
  setReconnecting: (reconnecting: boolean) => void
  setError: (error: string | null) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
}

// Utility types
export type InterviewStatus = 'pending' | 'scheduled' | 'completed'
export type MemoStatus = 'not-started' | 'processing' | 'completed' | 'error'
export type Theme = 'light' | 'dark' | 'system'
export type SortBy = 'match' | 'funding' | 'stage' | 'name'
export type SortOrder = 'asc' | 'desc'