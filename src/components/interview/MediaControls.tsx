'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InterviewSession } from '@/types/interview'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Square,
  Settings,
  MessageSquare,
  Volume2,
  Monitor,
  Wifi,
} from 'lucide-react'

/**
 * MediaControls Component Props
 */
interface MediaControlsProps {
  /** Current video input state (camera on/off) */
  isVideoEnabled: boolean
  /** Current audio input state (microphone on/off) */
  isAudioEnabled: boolean
  /** Callback to toggle video input */
  onToggleVideo: () => void
  /** Callback to toggle audio input */
  onToggleAudio: () => void
  /** Callback to end the interview session */
  onEnd: () => void
  /** Current interview session data for status display */
  session: InterviewSession | null
}

/**
 * MediaControls Component
 * 
 * Bottom control bar for the AI interview interface, similar to Google Meet controls.
 * Provides essential media controls and session information during the interview.
 * 
 * Key Features:
 * - Video/Audio toggle controls with visual state indicators
 * - End interview functionality (no pause - interviews are live sessions)
 * - Real-time connection and quality status indicators
 * - Session progress and topic information
 * - Additional controls (chat, settings) for future expansion
 * 
 * Design Philosophy:
 * - No pause functionality - interviews are live, continuous sessions
 * - Clear visual feedback for all control states
 * - Professional appearance matching video conferencing standards
 * - Responsive layout with logical grouping of controls
 * 
 * @param props - MediaControls component props
 */
export function MediaControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEnd,
  session,
}: MediaControlsProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left Side - Primary Media Controls */}
      <div className="flex items-center gap-2">
        {/* Video Toggle Button */}
        <Button
          variant={isVideoEnabled ? 'default' : 'secondary'}
          size="sm"
          onClick={onToggleVideo}
          className="gap-2"
          aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
          {isVideoEnabled ? 'Video On' : 'Video Off'}
        </Button>

        {/* Audio Toggle Button */}
        <Button
          variant={isAudioEnabled ? 'default' : 'secondary'}
          size="sm"
          onClick={onToggleAudio}
          className="gap-2"
          aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
          {isAudioEnabled ? 'Mic On' : 'Mic Off'}
        </Button>

        {/* Visual Separator */}
        <div className="h-6 w-px bg-border mx-2" />

        {/* End Interview Button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onEnd}
          disabled={!session}
          className="gap-2"
          aria-label="End interview session"
        >
          <Square className="h-4 w-4" />
          End Interview
        </Button>
      </div>

      {/* Center - Status Indicators */}
      <div className="flex items-center gap-4">
        {session && (
          <>
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <Badge variant="secondary" className="text-xs">
                Connected
              </Badge>
            </div>

            {/* Audio Quality Indicator */}
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Quality:</span>
                <Badge
                  variant={
                    session.audioQuality.audio.qualityScore >= 80
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {session.audioQuality.audio.qualityScore}%
                </Badge>
              </div>
            </div>

            {/* Video Quality Indicator */}
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Video:</span>
                <Badge
                  variant={
                    session.audioQuality.video.qualityScore >= 80
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {session.audioQuality.video.resolution}
                </Badge>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Side - Additional Controls and Session Info */}
      <div className="flex items-center gap-2">
        {/* Chat Button (Future Feature) */}
        <Button variant="ghost" size="sm" aria-label="Open chat">
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* Settings Button (Future Feature) */}
        <Button variant="ghost" size="sm" aria-label="Open settings">
          <Settings className="h-4 w-4" />
        </Button>

        {/* Session Progress Information */}
        {session && (
          <div className="ml-4 text-right">
            <div className="text-xs text-muted-foreground">
              Question {session.progress.currentQuestionIndex} of{' '}
              {session.progress.totalEstimatedQuestions}
            </div>
            <div className="text-xs font-medium">
              {session.currentTopic.name}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}