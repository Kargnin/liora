'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiveCaptionsProps } from '@/types/interview'
import { MessageSquare, MessageSquareOff, Settings, User, Bot } from 'lucide-react'

/**
 * LiveCaptions Component
 * 
 * Real-time caption overlay for AI interview sessions, similar to Google Meet captions.
 * Displays live speech-to-text with speaker identification and confidence indicators.
 * 
 * Key Features:
 * - Real-time caption display with auto-hide after 5 seconds
 * - Speaker identification (AI Investor vs Founder)
 * - Confidence score display (optional)
 * - Configurable positioning (top/bottom)
 * - Configurable font size (small/medium/large)
 * - Always-available toggle button (never disappears completely)
 * - Quick settings for position and speaker labels
 * 
 * Accessibility Features:
 * - High contrast text for readability
 * - Configurable font sizes for different needs
 * - Speaker identification for context
 * - Confidence indicators for speech recognition quality
 * 
 * @param props - LiveCaptions component props
 */
export function LiveCaptions({
  transcript,
  config,
  onConfigChange,
}: LiveCaptionsProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Current caption text being displayed
   * Shows the most recent transcript entry if it's within the last 10 seconds
   */
  const [currentCaption, setCurrentCaption] = useState('')
  
  /**
   * Caption visibility state
   * Controlled by user preference and current caption availability
   */
  const [isVisible, setIsVisible] = useState(config.enabled)
  
  /** Ref for auto-scrolling caption into view */
  const captionRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // CAPTION MANAGEMENT
  // ============================================================================
  
  /**
   * Update current caption from latest transcript entry
   * 
   * Monitors transcript for new entries and displays the most recent one
   * if it's within the last 10 seconds. Auto-hides captions after 5 seconds
   * of no new content to avoid cluttering the interface.
   */
  useEffect(() => {
    if (transcript.length > 0) {
      const latest = transcript[transcript.length - 1]
      // Only show captions for recent entries (within last 10 seconds)
      const isRecent = new Date().getTime() - latest.timestamp.getTime() < 10000

      if (isRecent) {
        setCurrentCaption(latest.text)

        // Auto-hide caption after 5 seconds if no new content
        const timer = setTimeout(() => {
          setCurrentCaption('')
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [transcript])

  /**
   * Auto-scroll captions into view
   * 
   * Ensures captions remain visible when they appear,
   * especially important for bottom-positioned captions.
   */
  useEffect(() => {
    if (captionRef.current && currentCaption) {
      captionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentCaption])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Toggle caption visibility
   * 
   * Allows users to show/hide captions while maintaining their preferences.
   * Updates the configuration to persist the user's choice.
   */
  const toggleCaptions = () => {
    const newEnabled = !isVisible
    setIsVisible(newEnabled)
    onConfigChange({ ...config, enabled: newEnabled })
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Get appropriate icon for speaker type
   * 
   * @param speaker - Speaker type (founder or ai)
   * @returns React icon component
   */
  const getSpeakerIcon = (speaker: 'founder' | 'ai') => {
    return speaker === 'ai' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />
  }

  /**
   * Get display label for speaker type
   * 
   * @param speaker - Speaker type (founder or ai)
   * @returns Human-readable speaker label
   */
  const getSpeakerLabel = (speaker: 'founder' | 'ai') => {
    return speaker === 'ai' ? 'AI Investor' : 'You'
  }

  /**
   * Get appropriate styling for speaker type
   * 
   * @param speaker - Speaker type (founder or ai)
   * @returns CSS classes for speaker-specific styling
   */
  const getSpeakerColor = (speaker: 'founder' | 'ai') => {
    return speaker === 'ai'
      ? 'bg-primary text-primary-foreground'
      : 'bg-secondary text-secondary-foreground'
  }

  // ============================================================================
  // RENDER STATES
  // ============================================================================
  
  /**
   * Render captions disabled state
   * 
   * Always shows a toggle button so users can re-enable captions.
   * This ensures the toggle is never completely hidden.
   */
  if (!isVisible) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCaptions}
          className="gap-2"
          aria-label="Show live captions"
        >
          <MessageSquare className="h-4 w-4" />
          Show Captions
        </Button>
      </div>
    )
  }

  /**
   * Render captions enabled but no current caption
   * 
   * Shows toggle button to hide captions when no active caption is displayed.
   */
  if (!currentCaption) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCaptions}
          className="gap-2"
          aria-label="Hide live captions"
        >
          <MessageSquareOff className="h-4 w-4" />
          Hide Captions
        </Button>
      </div>
    )
  }

  // ============================================================================
  // MAIN CAPTION DISPLAY
  // ============================================================================
  
  const latestEntry = transcript[transcript.length - 1]

  return (
    <div className="relative">
      {/* Caption Display Card */}
      <Card
        ref={captionRef}
        className={`
          mx-auto max-w-4xl transition-all duration-300
          ${config.position === 'top' ? 'mb-4' : 'mt-4'}
          ${
            config.fontSize === 'small'
              ? 'text-sm'
              : config.fontSize === 'large'
              ? 'text-lg'
              : 'text-base'
          }
        `}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Speaker Label */}
            {config.showSpeakerLabels && latestEntry && (
              <Badge
                className={`
                  flex items-center gap-1 shrink-0
                  ${getSpeakerColor(latestEntry.speaker)}
                `}
              >
                {getSpeakerIcon(latestEntry.speaker)}
                <span className="text-xs font-medium">
                  {getSpeakerLabel(latestEntry.speaker)}
                </span>
              </Badge>
            )}

            {/* Caption Text */}
            <div className="flex-1 min-w-0">
              <p className="leading-relaxed break-words">{currentCaption}</p>

              {/* Confidence Indicator */}
              {config.showConfidence && latestEntry && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence:
                  </span>
                  <Badge
                    variant={
                      latestEntry.confidence >= 0.9
                        ? 'default'
                        : latestEntry.confidence >= 0.7
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {Math.round(latestEntry.confidence * 100)}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Caption Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCaptions}
                className="h-6 w-6 p-0"
                aria-label="Hide captions"
              >
                <MessageSquareOff className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  // Cycle through font sizes
                  const sizes = ['small', 'medium', 'large'] as const
                  const currentIndex = sizes.indexOf(config.fontSize)
                  const nextSize = sizes[(currentIndex + 1) % sizes.length]
                  onConfigChange({ ...config, fontSize: nextSize })
                }}
                aria-label="Change font size"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <div className="absolute top-0 right-0 -mt-8 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onConfigChange({
              ...config,
              position: config.position === 'bottom' ? 'top' : 'bottom',
            })
          }
          className="h-6 text-xs"
          aria-label={`Move captions to ${config.position === 'bottom' ? 'top' : 'bottom'}`}
        >
          {config.position === 'bottom' ? 'Move Up' : 'Move Down'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onConfigChange({
              ...config,
              showSpeakerLabels: !config.showSpeakerLabels,
            })
          }
          className="h-6 text-xs"
          aria-label={`${config.showSpeakerLabels ? 'Hide' : 'Show'} speaker labels`}
        >
          {config.showSpeakerLabels ? 'Hide Labels' : 'Show Labels'}
        </Button>
      </div>
    </div>
  )
}