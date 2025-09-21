/**
 * Authentication Manager for Google Gemini Live API
 * Handles API key management, token validation, and secure authentication
 */

import type { GeminiError } from '@/types/interview'

export interface AuthConfig {
  apiKey: string
  projectId?: string
  region?: string
  validateOnInit?: boolean
}

export interface AuthStatus {
  authenticated: boolean
  apiKeyValid: boolean
  lastValidated: Date | null
  expiresAt: Date | null
  error?: string
}

/**
 * Manages authentication for Google Gemini Live API
 */
export class AuthManager {
  private config: AuthConfig
  private status: AuthStatus = {
    authenticated: false,
    apiKeyValid: false,
    lastValidated: null,
    expiresAt: null
  }
  private validationTimer: NodeJS.Timeout | null = null

  constructor(config: AuthConfig) {
    this.config = config
    
    if (config.validateOnInit) {
      this.validateApiKey()
    }
  }

  /**
   * Validate the API key with Google's API
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Clear any existing validation timer
      if (this.validationTimer) {
        clearTimeout(this.validationTimer)
      }

      // Validate API key format
      if (!this.isValidApiKeyFormat(this.config.apiKey)) {
        throw new Error('Invalid API key format')
      }

      // Test API key with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${this.config.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API key validation failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`)
      }

      // Update status
      this.status = {
        authenticated: true,
        apiKeyValid: true,
        lastValidated: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        error: undefined
      }

      // Schedule next validation
      this.scheduleRevalidation()

      console.log('API key validated successfully')
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      
      this.status = {
        authenticated: false,
        apiKeyValid: false,
        lastValidated: new Date(),
        expiresAt: null,
        error: errorMessage
      }

      console.error('API key validation failed:', errorMessage)
      return false
    }
  }

  /**
   * Get current authentication status
   */
  getAuthStatus(): AuthStatus {
    return { ...this.status }
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.status.authenticated && this.status.apiKeyValid && !this.isExpired()
  }

  /**
   * Get the API key for requests
   */
  getApiKey(): string {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please validate API key first.')
    }
    return this.config.apiKey
  }

  /**
   * Update API key and revalidate
   */
  async updateApiKey(newApiKey: string): Promise<boolean> {
    this.config.apiKey = newApiKey
    return await this.validateApiKey()
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please validate API key first.')
    }

    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.config.apiKey
    }
  }

  /**
   * Get WebSocket authentication parameters
   */
  getWebSocketAuthParams(): URLSearchParams {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please validate API key first.')
    }

    const params = new URLSearchParams()
    params.append('key', this.config.apiKey)
    
    if (this.config.projectId) {
      params.append('project', this.config.projectId)
    }
    
    if (this.config.region) {
      params.append('region', this.config.region)
    }

    return params
  }

  /**
   * Refresh authentication if needed
   */
  async refreshAuth(): Promise<boolean> {
    if (this.isExpired() || !this.status.apiKeyValid) {
      return await this.validateApiKey()
    }
    return true
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: GeminiError): void {
    if (error.code === 'UNAUTHENTICATED' || error.code === 'PERMISSION_DENIED') {
      this.status.authenticated = false
      this.status.apiKeyValid = false
      this.status.error = error.message
      
      console.error('Authentication error:', error.message)
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer)
      this.validationTimer = null
    }
  }

  // Private methods

  private isValidApiKeyFormat(apiKey: string): boolean {
    // Google API keys typically start with 'AIza' and are 39 characters long
    return /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey)
  }

  private isExpired(): boolean {
    if (!this.status.expiresAt) return true
    return new Date() > this.status.expiresAt
  }

  private scheduleRevalidation(): void {
    // Revalidate 1 hour before expiration
    const revalidateAt = this.status.expiresAt 
      ? new Date(this.status.expiresAt.getTime() - 60 * 60 * 1000)
      : new Date(Date.now() + 23 * 60 * 60 * 1000) // 23 hours from now

    const delay = Math.max(0, revalidateAt.getTime() - Date.now())

    this.validationTimer = setTimeout(async () => {
      console.log('Revalidating API key...')
      await this.validateApiKey()
    }, delay)
  }
}

/**
 * Utility function to create AuthManager from environment variables
 */
export function createAuthManagerFromEnv(): AuthManager {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables. Please set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY.')
  }

  return new AuthManager({
    apiKey,
    projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
    region: process.env.NEXT_PUBLIC_GOOGLE_REGION || 'us-central1',
    validateOnInit: true
  })
}

/**
 * Utility function to validate API key format
 */
export function validateApiKeyFormat(apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' }
  }

  if (typeof apiKey !== 'string') {
    return { valid: false, error: 'API key must be a string' }
  }

  if (apiKey.length !== 39) {
    return { valid: false, error: 'API key must be 39 characters long' }
  }

  if (!apiKey.startsWith('AIza')) {
    return { valid: false, error: 'API key must start with "AIza"' }
  }

  if (!/^AIza[0-9A-Za-z-_]{35}$/.test(apiKey)) {
    return { valid: false, error: 'API key contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Utility function to mask API key for logging
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***'
  }
  
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
}