// Enhanced file upload utilities with proper progress tracking

import { type FileUploadResponse, type FileUploadError } from '@/types/upload'

export interface UploadOptions {
  endpoint: string
  onProgress?: (progress: number) => void
  onSuccess?: (response: FileUploadResponse) => void
  onError?: (error: FileUploadError) => void
  signal?: AbortSignal
}

export function uploadFileWithProgress(
  file: File, 
  fileId: string, 
  options: UploadOptions
): Promise<FileUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    
    formData.append('file', file)
    formData.append('fileId', fileId)

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded * 100) / event.total)
        options.onProgress?.(progress)
      }
    })

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: FileUploadResponse = JSON.parse(xhr.responseText)
          options.onSuccess?.(response)
          resolve(response)
        } catch {
          const parseError: FileUploadError = {
            type: 'server',
            message: 'Invalid response from server',
            file,
            retryable: true
          }
          options.onError?.(parseError)
          reject(parseError)
        }
      } else {
        const networkError: FileUploadError = {
          type: 'network',
          message: `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
          file,
          retryable: xhr.status >= 500 // Retry on server errors
        }
        options.onError?.(networkError)
        reject(networkError)
      }
    })

    // Handle network errors
    xhr.addEventListener('error', () => {
      const networkError: FileUploadError = {
        type: 'network',
        message: 'Network error during upload',
        file,
        retryable: true
      }
      options.onError?.(networkError)
      reject(networkError)
    })

    // Handle upload cancellation
    xhr.addEventListener('abort', () => {
      const abortError: FileUploadError = {
        type: 'network',
        message: 'Upload cancelled',
        file,
        retryable: true
      }
      reject(abortError)
    })

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      const timeoutError: FileUploadError = {
        type: 'network',
        message: 'Upload timeout',
        file,
        retryable: true
      }
      options.onError?.(timeoutError)
      reject(timeoutError)
    })

    // Set timeout (30 seconds)
    xhr.timeout = 30000

    // Handle abort signal
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort()
      })
    }

    // Start the upload
    xhr.open('POST', options.endpoint)
    xhr.send(formData)
  })
}

// Utility to create a mock upload endpoint for development
export function createMockUploadEndpoint(): string {
  return '/api/upload'
}

// Simulate upload for development/testing
export function simulateFileUpload(
  file: File,
  fileId: string,
  onProgress?: (progress: number) => void,
  successRate: number = 0.9
): Promise<FileUploadResponse> {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // Random progress between 5-20%
      
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        onProgress?.(100)
        
        // Simulate success/failure based on success rate
        setTimeout(() => {
          if (Math.random() < successRate) {
            resolve({
              success: true,
              fileId,
              url: `https://example.com/uploads/${fileId}/${file.name}`
            })
          } else {
            reject({
              type: 'server',
              message: 'Simulated upload failure',
              file,
              retryable: true
            } as FileUploadError)
          }
        }, 200)
      } else {
        onProgress?.(Math.min(progress, 100))
      }
    }, 100 + Math.random() * 200) // Random interval between 100-300ms
  })
}