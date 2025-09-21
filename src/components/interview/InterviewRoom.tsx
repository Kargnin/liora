'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { VideoPreview } from './VideoPreview'
import { MediaControls } from './MediaControls'
import { LiveCaptions } from './LiveCaptions'
import { TranscriptSidePanel } from './TranscriptSidePanel'
import {
  InterviewRoomProps,
  MediaStreamConfig,
  TranscriptEntry,
  LiveCaptionsConfig,
} from '@/types/interview'
import { Video, VideoOff, MicOff, Settings, X, Clock } from 'lucide-react'

// ============================================================================
// MOCK DATA TYPES AND GENERATORS
// ============================================================================

/**
 * Mock session type that allows status changes during interview
 * This represents the interview session state with all necessary properties
 * for the Google Meet-like interface demonstration
 */
type MockSession = {
  /** Unique interview session identifier */
  id: string
  /** ID of the founder being interviewed */
  founderId: string
  /** Current interview status - can change during session */
  status: 'active' | 'paused' | 'completed' | 'initializing' | 'error'
  /** When the interview session started */
  startTime: Date
  /** Current interview topic being discussed */
  currentTopic: {
    id: string
    name: string
    description: string
    questions: never[]
    completed: boolean
    insights: never[]
    priority: 'high'
  }
  /** Interview progress tracking */
  progress: {
    completedTopics: never[]
    currentQuestionIndex: number
    totalEstimatedQuestions: number
    elapsedTime: number
    remainingTime: number
  }
  /** Interview transcript entries */
  transcript: never[]
  /** Audio and video quality metrics */
  audioQuality: {
    audio: {
      inputLevel: number
      outputLevel: number
      noiseLevel: number
      echoDetected: boolean
      qualityScore: number
    }
    video: {
      resolution: string
      frameRate: number
      brightness: number
      qualityScore: number
    }
    recommendations: never[]
  }
  /** Collected interview data and insights */
  sessionData: any
  /** Interview time limit in minutes */
  timeLimit: number
}

/**
 * Create a mock interview session for demonstration
 * 
 * Generates a realistic interview session with proper initial state,
 * quality metrics, and progress tracking for the AI interview demo.
 * 
 * @param founderId - Unique identifier for the founder being interviewed
 * @returns Mock interview session with realistic data
 */
const createMockSession = (founderId: string): MockSession => ({
  id: `interview-${founderId}-${Date.now()}`,
  founderId,
  status: 'active',
  startTime: new Date(),
  currentTopic: {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    description: 'Understanding the market size and opportunity',
    questions: [],
    completed: false,
    insights: [],
    priority: 'high',
  },
  progress: {
    completedTopics: [],
    currentQuestionIndex: 1,
    totalEstimatedQuestions: 8,
    elapsedTime: 0,
    remainingTime: 600, // 10 minutes
  },
  transcript: [],
  audioQuality: {
    audio: {
      inputLevel: 75,
      outputLevel: 80,
      noiseLevel: 10,
      echoDetected: false,
      qualityScore: 85,
    },
    video: {
      resolution: '1920x1080',
      frameRate: 30,
      brightness: 70,
      qualityScore: 90,
    },
    recommendations: [],
  },
  sessionData: {
    companyInsights: {
      businessModel: {
        revenueStreams: [],
        customerSegments: [],
        valueProposition: '',
        scalabilityFactors: [],
        monetizationStrategy: '',
      },
      marketAnalysis: {
        size: '',
        growth: '',
        trends: [],
        competitorAnalysis: [],
      },
      competitivePosition: {
        directCompetitors: [],
        competitiveAdvantages: [],
        marketPosition: '',
        differentiators: [],
      },
      teamDynamics: {
        teamSize: 0,
        keyRoles: [],
        experience: [],
        gaps: [],
      },
      financialMetrics: {
        revenue: '',
        growth: '',
        runway: '',
        fundingHistory: [],
      },
      riskFactors: {
        marketRisks: [],
        technicalRisks: [],
        competitiveRisks: [],
        teamRisks: [],
      },
    },
    founderInsights: {
      leadership: {
        style: '',
        experience: [],
        strengths: [],
        areas: [],
      },
      vision: {
        clarity: 0,
        ambition: 0,
        feasibility: 0,
        alignment: 0,
      },
      experience: {
        relevant: [],
        gaps: [],
        achievements: [],
      },
      challenges: {
        identified: [],
        approach: [],
        resilience: 0,
      },
    },
    keyQuotes: { impactful: [], concerning: [], insightful: [] },
    metrics: { financial: [], operational: [], growth: [], market: [] },
    redFlags: { critical: [], moderate: [], minor: [] },
  },
  timeLimit: 10,
})

/**
 * Create mock transcript entries for demonstration
 * 
 * Generates realistic conversation between AI investor and founder
 * to demonstrate the live transcript and captions functionality.
 * 
 * @returns Array of mock transcript entries with timestamps
 */
const createMockTranscript = (): TranscriptEntry[] => [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30000),
    speaker: 'ai',
    text: "Welcome! I'm Alex Chen, a partner at Venture Capital Partners. I'm excited to learn about your startup today.",
    confidence: 0.95,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 25000),
    speaker: 'founder',
    text: "Thank you for taking the time to meet with me. I'm really excited to share what we've been building.",
    confidence: 0.92,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 15000),
    speaker: 'ai',
    text: "Let's start with your market opportunity. Can you tell me about the problem you're solving and the size of the market you're targeting?",
    confidence: 0.97,
  },
]

// ============================================================================
// MAIN INTERVIEW ROOM COMPONENT
// ============================================================================

/**
 * InterviewRoom Component
 * 
 * Main Google Meet-like interface for AI-powered investor-founder interviews.
 * Provides a professional video call experience with real-time features:
 * 
 * Key Features:
 * - Dual video layout (AI investor + founder)
 * - Live captions with speaker identification
 * - Real-time transcript with search and export
 * - Media controls (video/audio toggle, end interview)
 * - Progress tracking and session management
 * - Responsive design optimized for desktop (1920x1080+)
 * 
 * Interview Flow:
 * 1. Device setup and testing (VideoPreview)
 * 2. Live interview with AI investor (main interface)
 * 3. Real-time transcript and analysis
 * 4. Session completion and data export
 * 
 * @param founderId - Unique identifier for the founder being interviewed
 * @param onComplete - Callback fired when interview is completed with session data
 */
export function InterviewRoom({ founderId, onComplete }: InterviewRoomProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Current interview session state
   * Contains all session data, progress, and quality metrics
   */
  const [session, setSession] = useState<MockSession>(() =>
    createMockSession(founderId)
  )
  
  /**
   * Setup completion status
   * Controls whether to show setup interface or main interview interface
   */
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  
  /**
   * Media stream configuration from setup
   * Contains audio/video settings validated during setup
   */
  const [mediaConfig, setMediaConfig] = useState<MediaStreamConfig | null>(null)
  
  /**
   * Live transcript entries
   * Real-time conversation between AI investor and founder
   */
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  
  /**
   * Live captions configuration
   * User preferences for caption display and behavior
   */
  const [captionsConfig, setCaptionsConfig] = useState<LiveCaptionsConfig>({
    enabled: true,
    position: 'bottom',
    fontSize: 'medium',
    showSpeakerLabels: true,
    showConfidence: false,
  })
  
  /**
   * Video input state
   * User preference for camera on/off during interview
   */
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  
  /**
   * Audio input state
   * User preference for microphone on/off during interview
   */
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  // ============================================================================
  // INITIALIZATION AND MOCK DATA
  // ============================================================================
  
  /**
   * Initialize mock transcript after setup completion
   * 
   * Loads demonstration transcript entries to show live transcript
   * and captions functionality during the interview demo.
   */
  useEffect(() => {
    if (isSetupComplete && mediaConfig) {
      setTranscript(createMockTranscript())
    }
  }, [isSetupComplete, mediaConfig])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle setup completion from VideoPreview
   * 
   * Called when user completes device setup and validation.
   * Transitions from setup interface to main interview interface.
   * 
   * @param config - Validated media stream configuration
   */
  const handleSetupComplete = (config: MediaStreamConfig) => {
    setMediaConfig(config)
    setIsSetupComplete(true)
  }

  /**
   * Handle device changes during setup
   * 
   * Called when user selects different audio/video devices.
   * Logs device changes for debugging and monitoring.
   * 
   * @param deviceId - Selected device identifier
   * @param type - Device type (audio or video)
   */
  const handleDeviceChange = (deviceId: string, type: 'audio' | 'video') => {
    console.log(`Device changed: ${type} - ${deviceId}`)
  }

  /**
   * Toggle video input during interview
   * 
   * Allows founder to turn camera on/off during the interview.
   * Video is optional but recommended for better engagement.
   */
  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
  }

  /**
   * Toggle audio input during interview
   * 
   * Allows founder to mute/unmute microphone during interview.
   * Note: Audio is essential for AI interview functionality.
   */
  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
  }

  /**
   * End the interview session
   * 
   * Completes the interview, marks session as finished, and
   * calls the completion callback with collected session data.
   */
  const handleEndInterview = () => {
    const completedSession = {
      ...session,
      status: 'completed' as const,
      endTime: new Date(),
    }
    onComplete(completedSession.sessionData)
  }

  /**
   * Format time duration for display
   * 
   * Converts seconds to MM:SS format for time displays.
   * 
   * @param seconds - Time duration in seconds
   * @returns Formatted time string (MM:SS)
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ============================================================================
  // SETUP INTERFACE
  // ============================================================================
  
  /**
   * Render device setup interface
   * 
   * Shows VideoPreview component for device testing and validation
   * before starting the actual interview session.
   */
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                AI Interview Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoPreview
                onSetupComplete={handleSetupComplete}
                onDeviceChange={handleDeviceChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN INTERVIEW INTERFACE
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="border-b bg-card p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">
                AI Interview - Investor Meeting
              </h1>
            </div>
            <Badge
              variant={session.status === 'active' ? 'default' : 'secondary'}
            >
              {session.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(session.progress.elapsedTime)} /{' '}
                {formatTime(session.timeLimit * 60)}
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEndInterview}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Area */}
        <div className="flex-1 p-6">
          <div className="grid h-full grid-cols-2 gap-6">
            {/* AI Investor Video */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Alex Chen</p>
                    <p className="text-xs text-muted-foreground">AI Investor</p>
                  </div>
                  <Badge
                    className="absolute bottom-2 left-2"
                    variant="secondary"
                  >
                    Speaking
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Founder Video */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                      {isVideoEnabled ? (
                        <Video className="h-8 w-8 text-secondary" />
                      ) : (
                        <VideoOff className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm font-medium">You</p>
                    <p className="text-xs text-muted-foreground">Founder</p>
                  </div>
                  {!isAudioEnabled && (
                    <Badge
                      className="absolute bottom-2 left-2"
                      variant="destructive"
                    >
                      <MicOff className="h-3 w-3 mr-1" />
                      Muted
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Captions */}
          {captionsConfig.enabled && (
            <div className="mt-4">
              <LiveCaptions
                transcript={transcript}
                config={captionsConfig}
                onConfigChange={setCaptionsConfig}
              />
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Interview Progress</span>
              <span>
                {session.progress.currentQuestionIndex} of{' '}
                {session.progress.totalEstimatedQuestions} questions
              </span>
            </div>
            <Progress
              value={
                (session.progress.currentQuestionIndex /
                  session.progress.totalEstimatedQuestions) *
                100
              }
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l bg-card">
          <TranscriptSidePanel
            transcript={transcript}
            isOpen={true}
            onToggle={() => {}}
            onExport={() => console.log('Export transcript')}
            onSearch={query => console.log('Search:', query)}
          />
        </div>
      </div>

      {/* Media Controls */}
      <div className="border-t bg-card p-4">
        <div className="mx-auto max-w-7xl">
          <MediaControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={handleToggleVideo}
            onToggleAudio={handleToggleAudio}
            onEnd={handleEndInterview}
            session={session}
          />
        </div>
      </div>
    </div>
  )
}