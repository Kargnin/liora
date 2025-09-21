// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public type:
      | 'network'
      | 'validation'
      | 'auth'
      | 'upload'
      | 'websocket' = 'network',
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 'network', code, true)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'validation', undefined, false)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'auth', undefined, false)
    this.name = 'AuthError'
  }
}

export class UploadError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 'upload', code, true)
    this.name = 'UploadError'
  }
}

export class WebSocketError extends AppError {
  constructor(message: string) {
    super(message, 'websocket', undefined, true)
    this.name = 'WebSocketError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable
  }

  // Network errors are generally retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  return false
}
