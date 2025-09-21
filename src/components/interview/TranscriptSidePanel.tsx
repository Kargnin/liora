'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TranscriptSidePanelProps } from '@/types/interview'
import {
  FileText,
  Download,
  Search,
  User,
  Bot,
  Clock,
  Copy,
  X,
  MessageSquare,
} from 'lucide-react'

/**
 * TranscriptSidePanel Component
 * 
 * Comprehensive transcript management panel for AI interview sessions.
 * Provides full conversation history with search, filtering, and export capabilities.
 * 
 * Key Features:
 * - Real-time transcript display with auto-scroll
 * - Full-text search across all conversation entries
 * - Speaker filtering (All, AI Investor, Founder)
 * - Export functionality for session records
 * - Speaker identification with timestamps
 * - Confidence indicators for speech recognition quality
 * - Auto-scroll toggle for user control
 * - Conversation statistics and metadata
 * 
 * Design Philosophy:
 * - Comprehensive conversation record for review and analysis
 * - Professional appearance suitable for business contexts
 * - Efficient search and filtering for long conversations
 * - Export capabilities for documentation and follow-up
 * 
 * @param props - TranscriptSidePanel component props
 */
export function TranscriptSidePanel({
  transcript,
  onExport,
  onSearch,
}: TranscriptSidePanelProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Current search query for filtering transcript entries
   * Filters transcript entries by text content (case-insensitive)
   */
  const [searchQuery, setSearchQuery] = useState('')
  
  /**
   * Filtered transcript entries based on search and speaker filter
   * Updated whenever search query or speaker filter changes
   */
  const [filteredTranscript, setFilteredTranscript] = useState(transcript)
  
  /**
   * Auto-scroll behavior toggle
   * When enabled, automatically scrolls to show new messages
   * Users can disable this to review earlier parts of the conversation
   */
  const [autoScroll, setAutoScroll] = useState(true)
  
  /**
   * Speaker filter selection
   * Allows filtering transcript to show only specific speakers or all
   */
  const [selectedSpeaker, setSelectedSpeaker] = useState<
    'all' | 'founder' | 'ai'
  >('all')

  /** Ref for scroll area to control scrolling behavior */
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  /** Ref for bottom element to enable auto-scroll to latest messages */
  const bottomRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // TRANSCRIPT FILTERING
  // ============================================================================
  
  /**
   * Filter transcript based on search query and speaker selection
   * 
   * Applies both speaker filtering and text search to provide
   * relevant transcript entries. Updates whenever transcript,
   * search query, or speaker filter changes.
   */
  useEffect(() => {
    let filtered = transcript

    // Apply speaker filter
    if (selectedSpeaker !== 'all') {
      filtered = filtered.filter(entry => entry.speaker === selectedSpeaker)
    }

    // Apply text search filter (case-insensitive)
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTranscript(filtered)
  }, [transcript, searchQuery, selectedSpeaker])

  /**
   * Auto-scroll to bottom when new messages arrive
   * 
   * Automatically scrolls to show the latest messages when auto-scroll
   * is enabled. Users can disable this to review earlier conversation.
   */
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript, autoScroll])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle search input changes
   * 
   * Updates search query and notifies parent component for
   * potential additional search functionality.
   * 
   * @param query - Search query string
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  /**
   * Copy transcript to clipboard
   * 
   * Formats the filtered transcript as plain text and copies
   * to clipboard for easy sharing or documentation.
   */
  const handleCopyTranscript = () => {
    const text = filteredTranscript
      .map(entry => `${getSpeakerLabel(entry.speaker)}: ${entry.text}`)
      .join('\n\n')

    navigator.clipboard.writeText(text)
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
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-secondary/10 text-secondary-foreground border-secondary/20'
  }

  /**
   * Format timestamp for display
   * 
   * @param timestamp - Date object to format
   * @returns Formatted time string (HH:MM:SS)
   */
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  /**
   * Calculate transcript statistics
   * 
   * @returns Object with message counts by speaker and total
   */
  const getEntryStats = () => {
    const aiEntries = transcript.filter(entry => entry.speaker === 'ai').length
    const founderEntries = transcript.filter(
      entry => entry.speaker === 'founder'
    ).length
    return { aiEntries, founderEntries, total: transcript.length }
  }

  const stats = getEntryStats()

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================
  
  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h3 className="font-semibold">Live Transcript</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyTranscript}
              className="h-6 w-6 p-0"
              aria-label="Copy transcript to clipboard"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="h-6 w-6 p-0"
              aria-label="Export transcript"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Transcript Statistics */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <span>{stats.total} messages</span>
          <span>•</span>
          <span>{stats.aiEntries} AI</span>
          <span>•</span>
          <span>{stats.founderEntries} You</span>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch('')}
              className="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Speaker Filter Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedSpeaker === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedSpeaker('all')}
            className="h-6 text-xs"
          >
            All
          </Button>
          <Button
            variant={selectedSpeaker === 'ai' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedSpeaker('ai')}
            className="h-6 text-xs gap-1"
          >
            <Bot className="h-3 w-3" />
            AI
          </Button>
          <Button
            variant={selectedSpeaker === 'founder' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedSpeaker('founder')}
            className="h-6 text-xs gap-1"
          >
            <User className="h-3 w-3" />
            You
          </Button>
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {filteredTranscript.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? (
                <div>
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No messages found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                <div>
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Transcript will appear here as the interview progresses
                  </p>
                </div>
              )}
            </div>
          ) : (
            filteredTranscript.map(entry => (
              <div key={entry.id} className="space-y-2">
                {/* Message Bubble */}
                <div
                  className={`
                  p-3 rounded-lg border transition-colors
                  ${getSpeakerColor(entry.speaker)}
                `}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="h-5 text-xs gap-1 border-current"
                      >
                        {getSpeakerIcon(entry.speaker)}
                        {getSpeakerLabel(entry.speaker)}
                      </Badge>
                      {entry.confidence && (
                        <Badge
                          variant={
                            entry.confidence >= 0.9
                              ? 'default'
                              : entry.confidence >= 0.7
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="h-5 text-xs"
                        >
                          {Math.round(entry.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-sm leading-relaxed">
                    {searchQuery ? (
                      entry.text
                        .split(new RegExp(`(${searchQuery})`, 'gi'))
                        .map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark
                              key={i}
                              className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
                            >
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )
                    ) : (
                      entry.text
                    )}
                  </p>

                  {/* Key Insights */}
                  {entry.keyInsights && entry.keyInsights.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.keyInsights.map((insight, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Footer Controls */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="text-xs"
          >
            Auto-scroll: {autoScroll ? 'On' : 'Off'}
          </Button>

          <div className="text-xs text-muted-foreground">
            {filteredTranscript.length} of {transcript.length} messages
          </div>
        </div>
      </div>
    </div>
  )
}