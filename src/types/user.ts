// User and authentication type definitions

import { InvestorPreferences } from './investment'

export interface User {
  id: string
  name: string
  type: 'founder' | 'investor'
  email?: string
  preferences?: InvestorPreferences
  companyId?: string // For founders
  createdAt: string
  updatedAt: string
  profileComplete: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token?: string
  refreshToken?: string
  expiresAt?: string
}

export interface LoginCredentials {
  name: string
  userType: 'founder' | 'investor'
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

// Utility types
export type UserType = 'founder' | 'investor'