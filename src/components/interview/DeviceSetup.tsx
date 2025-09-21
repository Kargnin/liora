"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useMediaDevices } from '@/hooks/useMediaDevices'
import type { DeviceSetupProps, DeviceTestResult } from '@/types/interview'

export function DeviceSetup({ onDeviceSelected, onTestComplete, onQualityUpdate }: DeviceSetupProps) {
  const {
    devices,
    selectedDevices,
    isLoading,
    error,
    audioLevels,
    videoQuality,
    previewStream,
    selectDevice,
    testDevice,
    startPreview,
    stopPreview,
    getMediaConfig
  } = useMediaDevices()

  const [testResults, setTestResults] = useState<Record<string, DeviceTestResult>>({})
  const [isTestingDevice, setIsTestingDevice] = useState<string | null>(null)
  const [previewActive, setPreviewActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  // Update video preview when stream changes
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream
    }
  }, [previewStream])

  // Handle device selection
  const handleDeviceSelect = async (deviceId: string, type: 'audioinput' | 'audiooutput' | 'videoinput') => {
    selectDevice(deviceId, type)
    onDeviceSelected(deviceId, type === 'videoinput' ? 'video' : 'audio')
    
    // Auto-test the selected device
    if (type !== 'audiooutput') { // Skip testing audio output for now
      await handleTestDevice(deviceId, type === 'videoinput' ? 'video' : 'audio')
    }
  }

  // Test individual device
  const handleTestDevice = async (deviceId: string, type: 'audio' | 'video') => {
    setIsTestingDevice(deviceId)
    
    try {
      const result = await testDevice(deviceId, type)
      setTestResults(prev => ({ ...prev, [deviceId]: result }))
      onTestComplete(result)
    } catch (err) {
      console.error('Device test failed:', err)
    } finally {
      setIsTestingDevice(null)
    }
  }

  // Start/stop preview
  const handlePreviewToggle = async () => {
    if (previewActive) {
      stopPreview()
      setPreviewActive(false)
    } else {
      await startPreview()
      setPreviewActive(true)
    }
  }

  // Get quality badge color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Get quality icon
  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4" />
      case 'fair':
      case 'poor':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Detecting audio and video devices...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Setup
            </CardTitle>
            <CardDescription>
              Configure your microphone and speakers for the interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microphone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Microphone</label>
              <Select
                value={selectedDevices.audioInput || ''}
                onValueChange={(value) => handleDeviceSelect(value, 'audioinput')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {devices.audioInput.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDevices.audioInput && testResults[selectedDevices.audioInput] && (
                <div className="flex items-center gap-2">
                  <Badge className={getQualityColor(testResults[selectedDevices.audioInput].quality)}>
                    {getQualityIcon(testResults[selectedDevices.audioInput].quality)}
                    {testResults[selectedDevices.audioInput].quality}
                  </Badge>
                  {testResults[selectedDevices.audioInput].issues.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {testResults[selectedDevices.audioInput].issues[0]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Speaker Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Speakers</label>
              <Select
                value={selectedDevices.audioOutput || ''}
                onValueChange={(value) => handleDeviceSelect(value, 'audiooutput')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speakers" />
                </SelectTrigger>
                <SelectContent>
                  {devices.audioOutput.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Level Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Input Level</label>
                <div className="flex items-center gap-2">
                  {audioLevels.isActive ? (
                    <Mic className="h-4 w-4 text-green-500" />
                  ) : (
                    <MicOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {Math.round(audioLevels.inputLevel)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={audioLevels.inputLevel} 
                className="h-2"
              />
              {audioLevels.inputLevel < 10 && previewActive && (
                <p className="text-sm text-yellow-600">
                  Speak louder or adjust microphone position
                </p>
              )}
            </div>

            {/* Test Audio Button */}
            {selectedDevices.audioInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestDevice(selectedDevices.audioInput!, 'audio')}
                disabled={isTestingDevice === selectedDevices.audioInput}
              >
                {isTestingDevice === selectedDevices.audioInput ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-2" />
                )}
                Test Microphone
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Video Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Setup
            </CardTitle>
            <CardDescription>
              Configure your camera for the interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Camera</label>
              <Select
                value={selectedDevices.videoInput || ''}
                onValueChange={(value) => handleDeviceSelect(value, 'videoinput')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.videoInput.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDevices.videoInput && testResults[selectedDevices.videoInput] && (
                <div className="flex items-center gap-2">
                  <Badge className={getQualityColor(testResults[selectedDevices.videoInput].quality)}>
                    {getQualityIcon(testResults[selectedDevices.videoInput].quality)}
                    {testResults[selectedDevices.videoInput].quality}
                  </Badge>
                  {testResults[selectedDevices.videoInput].issues.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {testResults[selectedDevices.videoInput].issues[0]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Video Quality Indicators */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Quality</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{videoQuality.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame Rate:</span>
                  <span>{videoQuality.frameRate} fps</span>
                </div>
              </div>
              <Progress 
                value={videoQuality.brightness} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Brightness</span>
                <Badge className={getQualityColor(videoQuality.quality)}>
                  {videoQuality.quality}
                </Badge>
              </div>
            </div>

            {/* Test Video Button */}
            {selectedDevices.videoInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestDevice(selectedDevices.videoInput!, 'video')}
                disabled={isTestingDevice === selectedDevices.videoInput}
              >
                {isTestingDevice === selectedDevices.videoInput ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Video className="h-4 w-4 mr-2" />
                )}
                Test Camera
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Camera Preview
            </span>
            <Button
              variant={previewActive ? "destructive" : "default"}
              onClick={handlePreviewToggle}
              disabled={!selectedDevices.videoInput || !selectedDevices.audioInput}
            >
              {previewActive ? (
                <>
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Start Preview
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Test your camera and microphone before starting the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {previewActive && previewStream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Start Preview" to test your camera</p>
                </div>
              </div>
            )}
            
            {/* Audio Level Overlay */}
            {previewActive && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {audioLevels.isActive ? (
                      <Mic className="h-4 w-4 text-green-400" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-white text-sm">
                      Audio: {Math.round(audioLevels.inputLevel)}%
                    </span>
                  </div>
                  <Progress 
                    value={audioLevels.inputLevel} 
                    className="h-1 bg-white/20"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Quality Recommendations */}
          {previewActive && (
            <div className="mt-4 space-y-2">
              {Object.values(testResults).map((result, index) => (
                result.recommendations.length > 0 && (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{result.type === 'audio' ? 'Audio' : 'Video'}:</strong>{' '}
                      {result.recommendations[0]}
                    </AlertDescription>
                  </Alert>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}