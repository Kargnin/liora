'use client'

import React, { useState } from 'react'
import { FileUploadZone } from './FileUploadZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { 
  type UploadedFile, 
  type FileUploadError,
  UPLOAD_CONFIGS 
} from '@/types/upload'
import { Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function FileUploadDemo() {
  const [pitchDeckFiles, setPitchDeckFiles] = useState<UploadedFile[]>([])
  const [pitchVideoFiles, setPitchVideoFiles] = useState<UploadedFile[]>([])
  const [documentFiles, setDocumentFiles] = useState<UploadedFile[]>([])

  const handleUploadStart = (file: UploadedFile) => {
    console.log('Upload started:', file.file.name)
    toast.info(`Started uploading ${file.file.name}`)
  }

  const handleUploadProgress = (fileId: string, progress: number) => {
    console.log(`Upload progress for ${fileId}: ${progress}%`)
  }

  const handleUploadComplete = (fileId: string, url: string) => {
    console.log('Upload completed:', fileId, url)
    toast.success('Upload completed successfully')
  }

  const handleUploadError = (fileId: string, error: FileUploadError) => {
    console.error('Upload error:', error)
    toast.error(`Upload failed: ${error.message}`)
  }

  const clearAllFiles = () => {
    setPitchDeckFiles([])
    setPitchVideoFiles([])
    setDocumentFiles([])
    toast.info('All files cleared')
  }

  const getUploadStats = () => {
    const allFiles = [...pitchDeckFiles, ...pitchVideoFiles, ...documentFiles]
    const completed = allFiles.filter(f => f.status === 'completed').length
    const uploading = allFiles.filter(f => f.status === 'uploading').length
    const errors = allFiles.filter(f => f.status === 'error').length
    
    return { total: allFiles.length, completed, uploading, errors }
  }

  const stats = getUploadStats()

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">File Upload Infrastructure Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of drag-and-drop file upload with progress tracking and validation
        </p>
      </div>

      {/* Upload Statistics */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="secondary">Total: {stats.total}</Badge>
              <StatusBadge status="success" label={`Completed: ${stats.completed}`} />
              {stats.uploading > 0 && (
                <StatusBadge status="pending" label={`Uploading: ${stats.uploading}`} />
              )}
              {stats.errors > 0 && (
                <StatusBadge status="error" label={`Errors: ${stats.errors}`} />
              )}
            </div>
            {stats.total > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFiles}
                className="mt-3"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Files
              </Button>
            )}
          </CardContent>
        </Card>
      )}



      {/* Pitch Deck Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Pitch Deck Upload</CardTitle>
          <CardDescription>
            Upload your pitch deck (PDF, PPT, PPTX) - Max 50MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            config={UPLOAD_CONFIGS.PITCH_DECK}
            onFilesChange={setPitchDeckFiles}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            title="Upload Pitch Deck"
            description="Drag and drop your pitch deck here, or click to select"
          />
        </CardContent>
      </Card>

      {/* Pitch Video Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Pitch Video Upload</CardTitle>
          <CardDescription>
            Upload your pitch video (MP4, MOV, AVI) - Max 500MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            config={UPLOAD_CONFIGS.PITCH_VIDEO}
            onFilesChange={setPitchVideoFiles}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            title="Upload Pitch Video"
            description="Drag and drop your pitch video here, or click to select"
          />
        </CardContent>
      </Card>

      {/* Documents Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload supporting documents (PDF, DOC, DOCX, TXT) - Max 10MB each, up to 5 files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            config={UPLOAD_CONFIGS.DOCUMENTS}
            onFilesChange={setDocumentFiles}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            title="Upload Documents"
            description="Drag and drop your documents here, or click to select multiple files"
          />
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Configurations</CardTitle>
          <CardDescription>
            Available upload configurations for different file types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Pitch Deck</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Max size: 50MB</li>
                <li>• Types: PDF, PPT, PPTX</li>
                <li>• Single file only</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pitch Video</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Max size: 500MB</li>
                <li>• Types: MP4, MOV, AVI</li>
                <li>• Single file only</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Documents</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Max size: 10MB each</li>
                <li>• Types: PDF, DOC, DOCX, TXT</li>
                <li>• Up to 5 files</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Images</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Max size: 5MB each</li>
                <li>• Types: JPG, PNG, GIF, WebP</li>
                <li>• Up to 10 files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}