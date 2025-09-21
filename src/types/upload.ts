// File upload types and utilities for Liora platform

export interface FileUploadConfig {
  maxSize: number // in bytes
  accept: string // comma-separated file extensions like ".pdf,.ppt,.pptx"
  multiple: boolean
  maxFiles?: number
}

export interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
  uploadedAt?: string
}

export interface FileUploadError {
  type: 'size' | 'type' | 'network' | 'server' | 'validation'
  message: string
  file: File
  retryable: boolean
}

export interface FileUploadResponse {
  success: boolean
  fileId: string
  url?: string
  error?: string
}

export interface FileUploadResult {
  success: boolean
  file?: UploadedFile
  error?: FileUploadError
}

// File validation function
export function validateFile(file: File, config: FileUploadConfig): FileUploadError | null {
  // Check file size
  if (file.size > config.maxSize) {
    return {
      type: 'size',
      message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxSize)})`,
      file,
      retryable: false
    }
  }

  // Check file type
  const allowedExtensions = config.accept.split(',').map(ext => ext.trim().toLowerCase())
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      type: 'type',
      message: `File type ${fileExtension} is not allowed. Supported types: ${config.accept}`,
      file,
      retryable: false
    }
  }

  return null
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate unique file ID
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// File upload configurations for different use cases
export const UPLOAD_CONFIGS = {
  PITCH_DECK: {
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: '.pdf,.ppt,.pptx',
    multiple: false
  } as FileUploadConfig,
  
  PITCH_VIDEO: {
    maxSize: 500 * 1024 * 1024, // 500MB
    accept: '.mp4,.mov,.avi',
    multiple: false
  } as FileUploadConfig,
  
  PITCH_AUDIO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: '.mp3,.wav,.m4a',
    multiple: false
  } as FileUploadConfig,
  
  DOCUMENTS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: '.pdf,.doc,.docx,.txt',
    multiple: true,
    maxFiles: 5
  } as FileUploadConfig,
  
  IMAGES: {
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: '.jpg,.jpeg,.png,.gif,.webp',
    multiple: true,
    maxFiles: 10
  } as FileUploadConfig
} as const

// MIME type mappings for better validation
export const MIME_TYPE_MAP: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  '.mp4': ['video/mp4'],
  '.mov': ['video/quicktime'],
  '.avi': ['video/x-msvideo'],
  '.mp3': ['audio/mpeg'],
  '.wav': ['audio/wav'],
  '.m4a': ['audio/mp4'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.txt': ['text/plain']
}

// Validate file MIME type
export function validateMimeType(file: File, allowedExtensions: string[]): boolean {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedMimeTypes = MIME_TYPE_MAP[fileExtension] || []
  
  return allowedExtensions.includes(fileExtension) && 
         (allowedMimeTypes.length === 0 || allowedMimeTypes.includes(file.type))
}