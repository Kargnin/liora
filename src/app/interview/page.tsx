/**
 * AI Interview Demo Page
 * Demonstrates the core infrastructure setup for the AI interview system
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useInterviewSession } from '@/hooks/useInterviewSession'
import { validateInterviewEnvironment } from '@/lib/interview/config'
import { CheckCircle, XCircle, Clock, Mic, MicOff, Play, Pause, Square } from 'lucide-react'

export default function InterviewPage() {
  const [founderId] = useState('demo-founder-123')
  const [isRecording, setIsRecording] = useState(false)
  
  const {
    isInitialized,
    isActive,
    error,
    startInterview,
    pauseInterview,
    resumeInterview,
    completeInterview,
    startAudioRecording,
    stopAudioRecording,
    testConnection,
    transcript,
    caliberMetrics,
    timeRemaining,
    progressPercentage
  } = useInterviewSession({
    founderId,
    config: { timeLimit: 10 }, // 10 minute demo
    onComplete: (data) => {
      console.log('Interview completed:', data)
    },
    onError: (error) => {
      console.error('Interview error:', error)
    }
  })

  // Environment validation
  const envValidation = validateInterviewEnvironment()

  const handleStartRecording = async () => {
    try {
      await startAudioRecording()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const handleStopRecording = () => {
    stopAudioRecording()
    setIsRecording(false)
  }

  const handleTestConnection = async () => {
    const isConnected = await testConnection()
    console.log('Connection test result:', isConnected)
  }

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Interview System</h1>
          <p className="text-muted-foreground">Core Infrastructure Demo</p>
        </div>
        <Badge variant={isInitialized ? 'default' : 'secondary'}>
          {isInitialized ? 'Initialized' : 'Initializing'}
        </Badge>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Environment Configuration
            {envValidation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Required environment variables and system dependencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!envValidation.isValid && (
            <Alert>
              <AlertDescription>
                Missing required environment variables: {envValidation.missingVars.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {envValidation.warnings.length > 0 && (
            <Alert>
              <AlertDescription>
                Warnings: {envValidation.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Core Dependencies</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Google Gemini Live API SDK
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  LangGraph TypeScript
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  LangSmith Integration
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Zustand State Management
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Configuration</h4>
              <div className="space-y-1 text-sm">
                <div>Default Time Limit: 10 minutes</div>
                <div>Max Session Duration: 60 minutes</div>
                <div>Demo Mode: Enabled</div>
                <div>Audio Quality Threshold: 70%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Session Controls</CardTitle>
          <CardDescription>
            Start and manage the AI interview session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            {!isActive ? (
              <Button onClick={startInterview} disabled={!envValidation.isValid}>
                <Play className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={pauseInterview} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={completeInterview} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            )}

            <Button onClick={handleTestConnection} variant="outline">
              Test Connection
            </Button>
          </div>

          {isActive && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Time Remaining: {formatTime(timeRemaining)}
                  </span>
                </div>
                <Progress value={progressPercentage} className="flex-1" />
              </div>

              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button onClick={handleStartRecording} size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={handleStopRecording} size="sm" variant="destructive">
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                <Badge variant={isRecording ? 'destructive' : 'secondary'}>
                  {isRecording ? 'Recording' : 'Not Recording'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Data Display */}
      {isActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Live Transcript</CardTitle>
              <CardDescription>
                Real-time speech-to-text from Gemini Live API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No transcript data yet. Start recording to see live captions.
                  </p>
                ) : (
                  transcript.map((entry) => (
                    <div key={entry.id} className="flex gap-2 text-sm">
                      <Badge variant={entry.speaker === 'ai' ? 'default' : 'secondary'}>
                        {entry.speaker.toUpperCase()}
                      </Badge>
                      <span>{entry.text}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caliber Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Caliber Assessment</CardTitle>
              <CardDescription>
                Real-time founder caliber evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caliberMetrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <Badge>{caliberMetrics.overall}/100</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(caliberMetrics.categories).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <Progress value={data.score} className="w-24" />
                      </div>
                    ))}
                  </div>

                  {caliberMetrics.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Red Flags</h4>
                      <div className="space-y-1">
                        {caliberMetrics.redFlags.map((flag, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {flag.type}: {flag.severity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No caliber assessment data yet. Start the interview to see real-time analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Multi-agent system and infrastructure status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm">TypeScript Interfaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm">Gemini Live API</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm">LangSmith Monitor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">✓</div>
              <div className="text-sm">State Management</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}