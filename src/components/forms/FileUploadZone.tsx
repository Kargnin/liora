'use client'

import React, { useCallback } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { Upload, X, AlertCircle, CheckCircle, RefreshCw, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  type FileUploadConfig,
  type UploadedFile,
  type FileUploadError,
  formatFileSize,
  generateFileId
} from '@/types/upload'
import { useFileUpload } from '@/hooks/use-file-upload'

interface FileUploadZoneProps {
  config: FileUploadConfig
  onFilesChange: (files: UploadedFile[]) => void
  onUploadStart?: (file: UploadedFile) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string, url: string) => void
  onUploadError?: (fileId: string, error: FileUploadError) => void
  className?: string
  disabled?: boolean
  title?: string
  description?: string
}

export function FileUploadZone({
  config,
  onFilesChange,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  className,
  disabled = false,
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to select'
}: FileUploadZoneProps) {
  const {
    files: uploadedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    retryUpload
  } = useFileUpload({
    config,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError
  })

  // Notify parent component of file changes
  React.useEffect(() => {
    onFilesChange(uploadedFiles)
  }, [uploadedFiles, onFilesChange])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const error: FileUploadError = {
          type: 'type',
          message: errors.map((e) => e.message).join(', '),
          file,
          retryable: false
        }
        onUploadError?.(generateFileId(), error)
      })
    }

    // Upload accepted files
    if (acceptedFiles.length > 0) {
      uploadFiles(acceptedFiles)
    }
  }, [uploadFiles, onUploadError])

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: config.accept.split(',').reduce((acc, ext) => {
      acc[ext.trim()] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: config.maxSize,
    multiple: config.multiple,
    disabled: disabled || isUploading
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          dropzoneIsDragActive && 'border-primary bg-primary/10',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'p-4 rounded-full',
            dropzoneIsDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(config.maxSize)} • 
              Supported: {config.accept.replace(/\./g, '').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {isUploading ? 'Uploading Files...' : 'Uploaded Files'}
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <FileUploadItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                onRetry={() => retryUpload(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FileUploadItemProps {
  file: UploadedFile
  onRemove: () => void
  onRetry: () => void
}

function FileUploadItem({ file, onRemove, onRetry }: FileUploadItemProps) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      {getStatusIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.file.size)}
          </span>
        </div>
        
        {file.status === 'uploading' && (
          <div className="mt-2">
            <Progress value={file.progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(file.progress)}% uploaded
            </p>
          </div>
        )}
        
        {file.status === 'error' && file.error && (
          <Alert className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {file.error}
            </AlertDescription>
          </Alert>
        )}
        
        {file.status === 'completed' && file.uploadedAt && (
          <p className="text-xs text-green-600 mt-1">
            Uploaded successfully
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {file.status === 'error' && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-8 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-8 px-2 text-red-500 hover:text-red-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}