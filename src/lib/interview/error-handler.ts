/**
 * Error Handler for Google Gemini Live API Integration
 * Provides comprehensive error handling, recovery strategies, and user guidance
 */

import type { GeminiError } from '@/types/interview'

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'reconnect' | 'fallback' | 'user_action' | 'abort'
  description: string
  action?: () => Promise<void>
  userMessage?: string
  retryDelay?: number
  maxRetries?: number
}

export interface ErrorContext {
  component: string
  operation: string
  timestamp: Date
  userAgent?: string
  connectionStatus?: string
  additionalData?: Record<string, unknown>
}

export interface ErrorReport {
  error: GeminiError
  context: ErrorContext
  recoveryStrategy: ErrorRecoveryStrategy
  userGuidance: string[]
  technicalDetails: string[]
}

/**
 * Comprehensive error handler for Gemini Live API integration
 */
export class GeminiErrorHandler {
  private errorHistory: ErrorReport[] = []
  private maxHistorySize = 50
  private onErrorCallback: ((report: ErrorReport) => void) | null = null

  /**
   * Handle and analyze an error, providing recovery strategy and user guidance
   */
  handleError(error: GeminiError, context: ErrorContext): ErrorReport {
    const report = this.analyzeError(error, context)
    
    // Add to error history
    this.errorHistory.unshift(report)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
    
    // Log error details
    this.logError(report)
    
    // Notify callback
    if (this.onErrorCallback) {
      this.onErrorCallback(report)
    }
    
    return report
  }

  /**
   * Set callback for error notifications
   */
  onError(callback: (report: ErrorReport) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Get error history
   */
  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory]
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: GeminiError): boolean {
    const recoverableErrors = [
      'CONNECTION_FAILED',
      'WEBSOCKET_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT',
      'RATE_LIMITED',
      'TEMPORARY_UNAVAILABLE'
    ]
    
    return recoverableErrors.includes(error.code)
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: GeminiError): string {
    const messages: Record<string, string> = {
      'CONNECTION_FAILED': 'Unable to connect to the AI interview service. Please check your internet connection and try again.',
      'WEBSOCKET_ERROR': 'Connection to the interview service was interrupted. Attempting to reconnect...',
      'AUTHENTICATION_FAILED': 'Authentication failed. Please check your API credentials.',
      'PERMISSION_DENIED': 'Access denied. Please verify your account permissions.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment before trying again.',
      'MEDIA_INIT_FAILED': 'Unable to access your camera or microphone. Please check your device permissions.',
      'AUDIO_PROCESSING_FAILED': 'Audio processing error. Please check your microphone settings.',
      'DEVICE_ENUMERATION_FAILED': 'Unable to detect audio/video devices. Please check your device connections.',
      'DEVICE_SWITCH_FAILED': 'Unable to switch devices. Please try selecting a different device.',
      'MEDIA_SEND_FAILED': 'Unable to send audio/video data. Please check your connection.',
      'API_KEY_INVALID': 'Invalid API key. Please check your configuration.',
      'QUOTA_EXCEEDED': 'API quota exceeded. Please try again later or upgrade your plan.',
      'MODEL_NOT_FOUND': 'AI model not available. Please try again later.',
      'INVALID_REQUEST': 'Invalid request format. Please refresh the page and try again.',
      'TIMEOUT': 'Request timed out. Please check your connection and try again.',
      'NETWORK_ERROR': 'Network error occurred. Please check your internet connection.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again or contact support.'
    }
    
    return messages[error.code] || messages['UNKNOWN_ERROR']
  }

  // Private methods

  private analyzeError(error: GeminiError, context: ErrorContext): ErrorReport {
    const recoveryStrategy = this.determineRecoveryStrategy(error, context)
    const userGuidance = this.generateUserGuidance(error, context)
    const technicalDetails = this.generateTechnicalDetails(error, context)
    
    return {
      error,
      context,
      recoveryStrategy,
      userGuidance,
      technicalDetails
    }
  }

  private determineRecoveryStrategy(error: GeminiError, context: ErrorContext): ErrorRecoveryStrategy {
    switch (error.code) {
      case 'CONNECTION_FAILED':
      case 'WEBSOCKET_ERROR':
        return {
          type: 'reconnect',
          description: 'Attempt to reconnect to the service',
          userMessage: 'Reconnecting to the interview service...',
          retryDelay: 2000,
          maxRetries: 3
        }
      
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return {
          type: 'retry',
          description: 'Retry the failed operation',
          userMessage: 'Retrying connection...',
          retryDelay: 1000,
          maxRetries: 3
        }
      
      case 'RATE_LIMITED':
        return {
          type: 'retry',
          description: 'Wait and retry after rate limit expires',
          userMessage: 'Please wait a moment before trying again',
          retryDelay: 5000,
          maxRetries: 2
        }
      
      case 'MEDIA_INIT_FAILED':
      case 'DEVICE_ENUMERATION_FAILED':
        return {
          type: 'user_action',
          description: 'User needs to grant media permissions',
          userMessage: 'Please allow access to your camera and microphone, then refresh the page'
        }
      
      case 'AUTHENTICATION_FAILED':
      case 'API_KEY_INVALID':
        return {
          type: 'user_action',
          description: 'User needs to check API credentials',
          userMessage: 'Please check your API configuration and refresh the page'
        }
      
      case 'PERMISSION_DENIED':
        return {
          type: 'user_action',
          description: 'User needs to verify account permissions',
          userMessage: 'Please verify your account has the necessary permissions'
        }
      
      case 'QUOTA_EXCEEDED':
        return {
          type: 'user_action',
          description: 'User needs to wait or upgrade plan',
          userMessage: 'API quota exceeded. Please try again later or upgrade your plan'
        }
      
      case 'AUDIO_PROCESSING_FAILED':
        return {
          type: 'fallback',
          description: 'Fall back to basic audio processing',
          userMessage: 'Switching to basic audio mode...'
        }
      
      case 'DEVICE_SWITCH_FAILED':
        return {
          type: 'fallback',
          description: 'Fall back to default device',
          userMessage: 'Using default audio device...'
        }
      
      default:
        return {
          type: 'abort',
          description: 'Unrecoverable error - abort operation',
          userMessage: 'An unexpected error occurred. Please refresh the page and try again'
        }
    }
  }

  private generateUserGuidance(error: GeminiError, context: ErrorContext): string[] {
    const guidance: string[] = []
    
    // Add general user message
    guidance.push(this.getUserMessage(error))
    
    // Add specific guidance based on error type
    switch (error.code) {
      case 'CONNECTION_FAILED':
      case 'NETWORK_ERROR':
        guidance.push('Check your internet connection')
        guidance.push('Try refreshing the page')
        guidance.push('Disable VPN if you are using one')
        break
      
      case 'MEDIA_INIT_FAILED':
        guidance.push('Click the camera/microphone icon in your browser address bar')
        guidance.push('Select "Allow" for camera and microphone permissions')
        guidance.push('Make sure no other applications are using your camera/microphone')
        guidance.push('Try using a different browser if the issue persists')
        break
      
      case 'AUDIO_PROCESSING_FAILED':
        guidance.push('Check that your microphone is properly connected')
        guidance.push('Try adjusting your microphone volume')
        guidance.push('Close other applications that might be using your microphone')
        break
      
      case 'DEVICE_ENUMERATION_FAILED':
        guidance.push('Make sure your audio/video devices are properly connected')
        guidance.push('Try unplugging and reconnecting your devices')
        guidance.push('Restart your browser')
        break
      
      case 'RATE_LIMITED':
        guidance.push('Wait a few minutes before trying again')
        guidance.push('Avoid making too many requests in a short time')
        break
      
      case 'AUTHENTICATION_FAILED':
        guidance.push('Verify your API key is correct')
        guidance.push('Check that your API key has the necessary permissions')
        guidance.push('Contact your administrator if you continue to have issues')
        break
    }
    
    return guidance
  }

  private generateTechnicalDetails(error: GeminiError, context: ErrorContext): string[] {
    const details: string[] = []
    
    details.push(`Error Code: ${error.code}`)
    details.push(`Message: ${error.message}`)
    details.push(`Component: ${context.component}`)
    details.push(`Operation: ${context.operation}`)
    details.push(`Timestamp: ${context.timestamp.toISOString()}`)
    
    if (context.userAgent) {
      details.push(`User Agent: ${context.userAgent}`)
    }
    
    if (context.connectionStatus) {
      details.push(`Connection Status: ${context.connectionStatus}`)
    }
    
    if (error.details) {
      details.push(`Details: ${JSON.stringify(error.details, null, 2)}`)
    }
    
    if (context.additionalData) {
      details.push(`Additional Data: ${JSON.stringify(context.additionalData, null, 2)}`)
    }
    
    return details
  }

  private logError(report: ErrorReport): void {
    console.group(`🚨 Gemini Live API Error: ${report.error.code}`)
    console.error('Error:', report.error.message)
    console.log('Context:', report.context)
    console.log('Recovery Strategy:', report.recoveryStrategy)
    console.log('User Guidance:', report.userGuidance)
    console.log('Technical Details:', report.technicalDetails)
    console.groupEnd()
  }
}

/**
 * Utility functions for common error scenarios
 */

export function createNetworkError(message: string, details?: Record<string, unknown>): GeminiError {
  return {
    code: 'NETWORK_ERROR',
    message,
    details
  }
}

export function createAuthenticationError(message: string, details?: Record<string, unknown>): GeminiError {
  return {
    code: 'AUTHENTICATION_FAILED',
    message,
    details
  }
}

export function createMediaError(message: string, details?: Record<string, unknown>): GeminiError {
  return {
    code: 'MEDIA_INIT_FAILED',
    message,
    details
  }
}

export function createConnectionError(message: string, details?: Record<string, unknown>): GeminiError {
  return {
    code: 'CONNECTION_FAILED',
    message,
    details
  }
}

export function createTimeoutError(message: string, details?: Record<string, unknown>): GeminiError {
  return {
    code: 'TIMEOUT',
    message,
    details
  }
}

/**
 * Global error handler instance
 */
export const geminiErrorHandler = new GeminiErrorHandler()

/**
 * Utility function to handle errors with context
 */
export function handleGeminiError(
  error: GeminiError,
  component: string,
  operation: string,
  additionalData?: Record<string, unknown>
): ErrorReport {
  const context: ErrorContext = {
    component,
    operation,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    additionalData
  }
  
  return geminiErrorHandler.handleError(error, context)
}