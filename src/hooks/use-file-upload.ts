'use client'

import { useState, useCallback, useRef } from 'react'
import { 
  type UploadedFile, 
  type FileUploadError, 
  type FileUploadConfig,
  type FileUploadResponse,
  validateFile,
  generateFileId
} from '@/types/upload'

interface UseFileUploadOptions {
  config: FileUploadConfig
  onUploadStart?: (file: UploadedFile) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string, url: string) => void
  onUploadError?: (fileId: string, error: FileUploadError) => void
  uploadEndpoint?: string
}

interface UseFileUploadReturn {
  files: UploadedFile[]
  isUploading: boolean
  uploadFiles: (files: File[]) => void
  removeFile: (fileId: string) => void
  retryUpload: (fileId: string) => void
  clearFiles: () => void
  getUploadProgress: () => number
}

export function useFileUpload({
  config,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadEndpoint = '/api/upload'
}: UseFileUploadOptions): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  const updateFileStatus = useCallback((fileId: string, status: UploadedFile['status']) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status } : f
    ))
  }, [])

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
    ))
  }, [])

  const updateFileComplete = useCallback((fileId: string, url: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'completed' as const, 
        progress: 100, 
        url,
        uploadedAt: new Date().toISOString(),
        error: undefined
      } : f
    ))
  }, [])

  const updateFileError = useCallback((fileId: string, error: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'error' as const, error } : f
    ))
  }, [])

  const uploadSingleFile = useCallback(async (uploadedFile: UploadedFile): Promise<void> => {
    const abortController = new AbortController()
    abortControllers.current.set(uploadedFile.id, abortController)

    // Update file status to uploading
    updateFileStatus(uploadedFile.id, 'uploading')
    onUploadStart?.(uploadedFile)

    try {
      // Use enhanced upload utility for proper progress tracking
      const { simulateFileUpload } = await import('@/lib/upload')
      
      // Use simulation for development (replace with real upload in production)
      const result: FileUploadResponse = await simulateFileUpload(
        uploadedFile.file,
        uploadedFile.id,
        (progress) => {
          updateFileProgress(uploadedFile.id, progress)
          onUploadProgress?.(uploadedFile.id, progress)
        }
      )
      
      if (result.success && result.url) {
        updateFileComplete(uploadedFile.id, result.url)
        onUploadComplete?.(uploadedFile.id, result.url)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Upload was cancelled
        updateFileStatus(uploadedFile.id, 'pending')
      } else {
        const uploadError: FileUploadError = error as FileUploadError || {
          type: 'network',
          message: error instanceof Error ? error.message : 'Upload failed',
          file: uploadedFile.file,
          retryable: true
        }
        
        updateFileError(uploadedFile.id, uploadError.message)
        onUploadError?.(uploadedFile.id, uploadError)
      }
    } finally {
      abortControllers.current.delete(uploadedFile.id)
    }
  }, [onUploadStart, onUploadProgress, onUploadComplete, onUploadError, updateFileStatus, updateFileProgress, updateFileComplete, updateFileError])

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    // Validate files first
    const validatedFiles: UploadedFile[] = filesToUpload.map(file => {
      const fileId = generateFileId()
      const validationError = validateFile(file, config)
      
      if (validationError) {
        onUploadError?.(fileId, validationError)
        return {
          id: fileId,
          file,
          progress: 0,
          status: 'error' as const,
          error: validationError.message
        }
      }

      return {
        id: fileId,
        file,
        progress: 0,
        status: 'pending' as const
      }
    })

    // Update files state
    setFiles(prev => {
      const newFiles = config.multiple ? [...prev, ...validatedFiles] : validatedFiles
      return newFiles
    })

    // Start uploading valid files
    const validFiles = validatedFiles.filter(f => f.status === 'pending')
    if (validFiles.length > 0) {
      setIsUploading(true)
      
      try {
        await Promise.all(validFiles.map(file => uploadSingleFile(file)))
      } finally {
        setIsUploading(false)
      }
    }
  }, [config, onUploadError, uploadSingleFile])

  const removeFile = useCallback((fileId: string) => {
    // Cancel upload if in progress
    const controller = abortControllers.current.get(fileId)
    if (controller) {
      controller.abort()
      abortControllers.current.delete(fileId)
    }

    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const retryUpload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file && file.status === 'error') {
      const retryFile = { ...file, status: 'pending' as const, error: undefined, progress: 0 }
      setFiles(prev => prev.map(f => f.id === fileId ? retryFile : f))
      uploadSingleFile(retryFile)
    }
  }, [files, uploadSingleFile])

  const clearFiles = useCallback(() => {
    // Cancel all ongoing uploads
    abortControllers.current.forEach(controller => controller.abort())
    abortControllers.current.clear()
    
    setFiles([])
    setIsUploading(false)
  }, [])

  const getUploadProgress = useCallback(() => {
    if (files.length === 0) return 0
    
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0)
    return Math.round(totalProgress / files.length)
  }, [files])

  return {
    files,
    isUploading,
    uploadFiles,
    removeFile,
    retryUpload,
    clearFiles,
    getUploadProgress
  }
}