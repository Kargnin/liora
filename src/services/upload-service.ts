'use client'

import { 
  type FileUploadRequest, 
  type FileUploadResponse, 
  type FileUploadCompleteRequest,
  type FileUploadCompleteResponse 
} from '@/types/api'
import { 
  type FileUploadError, 
  type FileUploadResult 
} from '@/types/upload'

/**
 * File upload service for handling file uploads to the backend
 */
export class UploadService {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  /**
   * Request upload URL from backend
   */
  async requestUpload(request: FileUploadRequest): Promise<FileUploadResponse> {
    const response = await fetch(`${this.baseUrl}/upload/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Upload request failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Upload file to the provided URL with progress tracking
   */
  async uploadFile(
    file: File, 
    uploadUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress?.(progress)
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'))
      })

      // Start upload
      const formData = new FormData()
      formData.append('file', file)

      xhr.open('PUT', uploadUrl)
      xhr.send(formData)
    })
  }

  /**
   * Complete the upload process and get final file URL
   */
  async completeUpload(request: FileUploadCompleteRequest): Promise<FileUploadCompleteResponse> {
    const response = await fetch(`${this.baseUrl}/upload/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Upload completion failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Full upload workflow: request -> upload -> complete
   */
  async uploadFileComplete(
    file: File,
    companyId: string,
    fileType: 'pitch_deck' | 'pitch_video' | 'pitch_audio' | 'financial_docs' | 'other',
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      // Step 1: Request upload URL
      const uploadRequest: FileUploadRequest = {
        companyId,
        fileType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      }

      const uploadResponse = await this.requestUpload(uploadRequest)

      // Step 2: Upload file with progress tracking
      await this.uploadFile(file, uploadResponse.uploadUrl, onProgress)

      // Step 3: Complete upload and get final URL
      const completeRequest: FileUploadCompleteRequest = {
        uploadId: uploadResponse.uploadId,
        fileName: file.name,
        fileSize: file.size
      }

      const completeResponse = await this.completeUpload(completeRequest)

      return {
        success: true,
        file: {
          id: completeResponse.fileId,
          file,
          progress: 100,
          status: 'completed',
          url: completeResponse.url,
          uploadedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      const uploadError: FileUploadError = {
        type: error instanceof Error && error.message.includes('network') ? 'network' : 'server',
        message: error instanceof Error ? error.message : 'Upload failed',
        file,
        retryable: true
      }

      return {
        success: false,
        error: uploadError
      }
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/upload/${fileId}`, {
      method: 'DELETE',
      headers: {
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    })

    if (!response.ok) {
      throw new Error(`File deletion failed: ${response.statusText}`)
    }
  }
}

// Default upload service instance
export const uploadService = new UploadService()

// Export utility functions
export const createUploadService = (baseUrl?: string, apiKey?: string) => {
  return new UploadService(baseUrl, apiKey)
}