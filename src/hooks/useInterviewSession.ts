// /**
//  * Interview Session Management Hook
//  * Manages interview lifecycle, multi-agent coordination, and real-time updates
//  */

// import { useEffect, useCallback, useRef } from 'react'
// import { useInterviewStore } from '@/stores/interview-store'
// import { MultiAgentCoordinator } from '@/lib/agents/multi-agent-coordinator'
// import { GeminiLiveAPIClient } from '@/lib/interview/gemini-client'
// import { LangSmithMonitor } from '@/lib/interview/langsmith-monitor'
// import { 
//   InterviewConfig, 
//   InterviewData, 
//   CaliberMetrics,
//   TranscriptEntry,
//   ConversationEntry,
//   InterviewError
// } from '@/types/interview'
// import { validateInterviewEnvironment } from '@/lib/interview/config'

// interface UseInterviewSessionProps {
//   founderId: string
//   config?: Partial<InterviewConfig>
//   onComplete?: (data: InterviewData) => void
//   onError?: (error: InterviewError) => void
// }

// interface UseInterviewSessionReturn {
//   // Session State
//   isInitialized: boolean
//   isActive: boolean
//   isLoading: boolean
//   error: string | null
  
//   // Session Controls
//   startInterview: () => Promise<void>
//   pauseInterview: () => void
//   resumeInterview: () => void
//   completeInterview: () => void
  
//   // Media Controls
//   startAudioRecording: () => Promise<void>
//   stopAudioRecording: () => void
//   testConnection: () => Promise<boolean>
  
//   // Real-time Data
//   transcript: TranscriptEntry[]
//   caliberMetrics: CaliberMetrics | null
//   timeRemaining: number
//   progressPercentage: number
  
//   // Agent State (for demo)
//   currentAgentState: any
  
//   // Utilities
//   processResponse: (response: string, questionId: string) => Promise<void>
//   exportTranscript: () => string
// }

// export function useInterviewSession({
//   founderId,
//   config,
//   onComplete,
//   onError
// }: UseInterviewSessionProps): UseInterviewSessionReturn {
//   const {
//     currentSession,
//     isSessionActive,
//     sessionError,
//     transcript,
//     caliberMetrics,
//     currentAgentState,
//     getTimeRemaining,
//     getProgressPercentage,
//     initializeSession,
//     startSession,
//     pauseSession,
//     resumeSession,
//     completeSession,
//     addTranscriptEntry,
//     updateCaliberMetrics,
//     addConversationEntry,
//     setSessionError,
//     setCurrentAgentState
//   } = useInterviewStore()

//   // Refs for managing instances
//   const coordinatorRef = useRef<MultiAgentCoordinator | null>(null)
//   const geminiClientRef = useRef<GeminiLiveAPIClient | null>(null)
//   const langSmithMonitorRef = useRef<LangSmithMonitor | null>(null)
//   const isInitializedRef = useRef(false)

//   // Initialize interview system
//   const initializeInterview = useCallback(async () => {
//     try {
//       // Validate environment
//       const envValidation = validateInterviewEnvironment()
//       if (!envValidation.isValid) {
//         throw new Error(`Missing required environment variables: ${envValidation.missingVars.join(', ')}`)
//       }

//       // Initialize session
//       initializeSession(founderId, config)

//       // Initialize Gemini Live API client
//       geminiClientRef.current = new GeminiLiveAPIClient()
      
//       // Initialize LangSmith monitor for demo
//       langSmithMonitorRef.current = new LangSmithMonitor()

//       // Set up event handlers
//       setupEventHandlers()

//       isInitializedRef.current = true
//       setSessionError(null)

//     } catch (error) {
//       const interviewError: InterviewError = {
//         code: 'INITIALIZATION_FAILED',
//         message: error instanceof Error ? error.message : 'Failed to initialize interview',
//         recoverable: true
//       }
      
//       setSessionError(interviewError.message)
//       onError?.(interviewError)
//     }
//   }, [founderId, config, initializeSession, setSessionError, onError])

//   // Set up event handlers for real-time updates
//   const setupEventHandlers = useCallback(() => {
//     if (!geminiClientRef.current) return

//     // Handle transcript updates
//     geminiClientRef.current.onTranscript((transcriptData) => {
//       const entry: TranscriptEntry = {
//         id: `transcript-${Date.now()}-${Math.random()}`,
//         timestamp: transcriptData.timestamp,
//         speaker: transcriptData.speaker,
//         text: transcriptData.text,
//         confidence: transcriptData.confidence,
//         keyInsights: transcriptData.keyPhrases
//       }
      
//       addTranscriptEntry(entry)
//     })

//     // Handle errors
//     geminiClientRef.current.onError((error) => {
//       const interviewError: InterviewError = {
//         code: error.code,
//         message: error.message,
//         details: error.details,
//         recoverable: error.code !== 'AUTHENTICATION_FAILED'
//       }
      
//       setSessionError(interviewError.message)
//       onError?.(interviewError)
//     })
//   }, [addTranscriptEntry, setSessionError, onError])

//   // Start interview
//   const startInterview = useCallback(async () => {
//     if (!isInitializedRef.current) {
//       await initializeInterview()
//     }

//     try {
//       // Connect to Gemini Live API
//       if (geminiClientRef.current) {
//         await geminiClientRef.current.connect()
//       }

//       // Start LangSmith trace
//       if (langSmithMonitorRef.current && currentSession) {
//         await langSmithMonitorRef.current.startTrace(currentSession.id, founderId)
//       }

//       // Start the session
//       startSession()

//       // TODO: Initialize multi-agent coordinator when agents are implemented
//       // This will be completed in subsequent tasks

//     } catch (error) {
//       const interviewError: InterviewError = {
//         code: 'START_FAILED',
//         message: error instanceof Error ? error.message : 'Failed to start interview',
//         recoverable: true
//       }
      
//       setSessionError(interviewError.message)
//       onError?.(interviewError)
//     }
//   }, [initializeInterview, currentSession, founderId, startSession, setSessionError, onError])

//   // Audio recording controls
//   const startAudioRecording = useCallback(async () => {
//     if (!geminiClientRef.current) {
//       throw new Error('Gemini client not initialized')
//     }

//     try {
//       // Start recording
//       await geminiClientRef.current.startAudioRecording(null)
//     } catch (error) {
//       const interviewError: InterviewError = {
//         code: 'AUDIO_START_FAILED',
//         message: error instanceof Error ? error.message : 'Failed to start audio recording',
//         recoverable: true
//       }
      
//       setSessionError(interviewError.message)
//       onError?.(interviewError)
//       throw interviewError
//     }
//   }, [setSessionError, onError])

//   const stopAudioRecording = useCallback(() => {
//     if (geminiClientRef.current) {
//       geminiClientRef.current.stopAudioRecording()
//     }
//   }, [])

//   // Test connection
//   const testConnection = useCallback(async (): Promise<boolean> => {
//     if (!geminiClientRef.current) return false

//     try {
//       const result = await geminiClientRef.current.testConnection()
//       return result.connected && result.audioQuality > 0.5
//     } catch (error) {
//       console.error('Connection test failed:', error)
//       return false
//     }
//   }, [])

//   // Process founder response
//   const processResponse = useCallback(async (response: string, questionId: string) => {
//     if (!coordinatorRef.current) {
//       console.warn('Multi-agent coordinator not initialized yet')
//       return
//     }

//     try {
//       // This will be implemented when the coordinator is fully set up
//       const metrics = await coordinatorRef.current.processFounderResponse(response, questionId)
//       updateCaliberMetrics(metrics)

//       // Add to conversation history
//       const conversationEntry: ConversationEntry = {
//         id: `conv-${Date.now()}-${Math.random()}`,
//         question: `Question for ${questionId}`, // Will be populated by coordinator
//         response,
//         timestamp: new Date(),
//         caliberMetrics: metrics
//       }
      
//       addConversationEntry(conversationEntry)

//       // Log to LangSmith for demo
//       if (langSmithMonitorRef.current) {
//         await langSmithMonitorRef.current.logCaliberAssessment(metrics, response, questionId)
//       }

//     } catch (error) {
//       console.error('Error processing response:', error)
//       const interviewError: InterviewError = {
//         code: 'RESPONSE_PROCESSING_FAILED',
//         message: error instanceof Error ? error.message : 'Failed to process response',
//         recoverable: true
//       }
//       onError?.(interviewError)
//     }
//   }, [updateCaliberMetrics, addConversationEntry, onError])

//   // Export transcript
//   const exportTranscript = useCallback((): string => {
//     return transcript.map(entry => 
//       `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker.toUpperCase()}: ${entry.text}`
//     ).join('\n')
//   }, [transcript])

//   // Pause/Resume controls
//   const handlePauseInterview = useCallback(() => {
//     pauseSession()
//     stopAudioRecording()
//   }, [pauseSession, stopAudioRecording])

//   const handleResumeInterview = useCallback(() => {
//     resumeSession()
//     // Audio recording will be restarted by UI component
//   }, [resumeSession])

//   // Complete interview
//   const handleCompleteInterview = useCallback(() => {
//     if (!currentSession) return

//     // Stop all recording
//     stopAudioRecording()

//     // Disconnect from services
//     if (geminiClientRef.current) {
//       geminiClientRef.current.disconnect()
//     }

//     // End LangSmith trace
//     if (langSmithMonitorRef.current) {
//       langSmithMonitorRef.current.endTrace({
//         totalQuestions: currentSession.progress.currentQuestionIndex,
//         finalCaliberScore: caliberMetrics?.overall || 0,
//         duration: Date.now() - currentSession.startTime.getTime(),
//         topicsCovered: currentSession.progress.completedTopics.map(t => t.name),
//         completionReason: 'manual'
//       })
//     }

//     // Complete session
//     completeSession(currentSession.sessionData)
    
//     // Notify completion
//     onComplete?.(currentSession.sessionData)
//   }, [currentSession, caliberMetrics, stopAudioRecording, completeSession, onComplete])

//   // Auto-complete on time limit
//   useEffect(() => {
//     if (!isSessionActive || !currentSession) return

//     const checkTimeLimit = () => {
//       const remaining = getTimeRemaining()
//       if (remaining <= 0) {
//         handleCompleteInterview()
//       }
//     }

//     const interval = setInterval(checkTimeLimit, 1000)
//     return () => clearInterval(interval)
//   }, [isSessionActive, currentSession, getTimeRemaining, handleCompleteInterview])

//   // Initialize on mount
//   useEffect(() => {
//     if (!isInitializedRef.current) {
//       initializeInterview()
//     }
//   }, [initializeInterview])

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (geminiClientRef.current) {
//         geminiClientRef.current.disconnect()
//       }
//     }
//   }, [])

//   return {
//     // Session State
//     isInitialized: isInitializedRef.current,
//     isActive: isSessionActive,
//     isLoading: false, // Will be implemented with actual loading states
//     error: sessionError,
    
//     // Session Controls
//     startInterview,
//     pauseInterview: handlePauseInterview,
//     resumeInterview: handleResumeInterview,
//     completeInterview: handleCompleteInterview,
    
//     // Media Controls
//     startAudioRecording,
//     stopAudioRecording,
//     testConnection,
    
//     // Real-time Data
//     transcript,
//     caliberMetrics,
//     timeRemaining: getTimeRemaining(),
//     progressPercentage: getProgressPercentage(),
    
//     // Agent State
//     currentAgentState,
    
//     // Utilities
//     processResponse,
//     exportTranscript
//   }
// }