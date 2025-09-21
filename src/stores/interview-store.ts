/**
 * Interview State Management Store
 * Zustand store for managing interview session state and multi-agent coordination
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  InterviewSession, 
  MultiAgentSystem, 
  SharedContext,
  CaliberMetrics,
  TranscriptEntry,
  InterviewConfig,
  MediaStreamConfig,
  AudioQualityMetrics,
  InterviewData,
  ConversationEntry,
  AgentStateDemo
} from '@/types/interview'
import { DEFAULT_INTERVIEW_CONFIG, INTERVIEW_TOPICS } from '@/lib/interview/config'

interface InterviewStore {
  // Session State
  currentSession: InterviewSession | null
  isSessionActive: boolean
  sessionError: string | null
  
  // Multi-Agent System
  agentSystem: MultiAgentSystem | null
  sharedContext: SharedContext | null
  currentAgentState: AgentStateDemo | null
  
  // Media and Quality
  mediaConfig: MediaStreamConfig | null
  audioQuality: AudioQualityMetrics | null
  isMediaReady: boolean
  
  // Interview Progress
  transcript: TranscriptEntry[]
  caliberMetrics: CaliberMetrics | null
  conversationHistory: ConversationEntry[]
  
  // Configuration
  interviewConfig: InterviewConfig
  
  // Actions
  initializeSession: (founderId: string, config?: Partial<InterviewConfig>) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  completeSession: (data: InterviewData) => void
  updateSessionProgress: (updates: Partial<InterviewSession['progress']>) => void
  
  // Multi-Agent Actions
  setAgentSystem: (system: MultiAgentSystem) => void
  updateSharedContext: (updates: Partial<SharedContext>) => void
  setCurrentAgentState: (state: AgentStateDemo) => void
  
  // Media Actions
  setMediaConfig: (config: MediaStreamConfig) => void
  updateAudioQuality: (quality: AudioQualityMetrics) => void
  setMediaReady: (ready: boolean) => void
  
  // Transcript and Assessment Actions
  addTranscriptEntry: (entry: TranscriptEntry) => void
  updateCaliberMetrics: (metrics: CaliberMetrics) => void
  addConversationEntry: (entry: ConversationEntry) => void
  
  // Utility Actions
  resetSession: () => void
  setSessionError: (error: string | null) => void
  getTimeRemaining: () => number
  getProgressPercentage: () => number
}

export const useInterviewStore = create<InterviewStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentSession: null,
      isSessionActive: false,
      sessionError: null,
      agentSystem: null,
      sharedContext: null,
      currentAgentState: null,
      mediaConfig: null,
      audioQuality: null,
      isMediaReady: false,
      transcript: [],
      caliberMetrics: null,
      conversationHistory: [],
      interviewConfig: DEFAULT_INTERVIEW_CONFIG,

      // Session Management Actions
      initializeSession: (founderId: string, config?: Partial<InterviewConfig>) => {
        const mergedConfig = { ...DEFAULT_INTERVIEW_CONFIG, ...config }
        
        const newSession: InterviewSession = {
          id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          founderId,
          status: 'initializing',
          startTime: new Date(),
          currentTopic: {
            id: INTERVIEW_TOPICS.COMPANY_OVERVIEW.id,
            name: INTERVIEW_TOPICS.COMPANY_OVERVIEW.name,
            description: INTERVIEW_TOPICS.COMPANY_OVERVIEW.description,
            questions: [],
            completed: false,
            insights: [],
            priority: INTERVIEW_TOPICS.COMPANY_OVERVIEW.priority
          },
          progress: {
            completedTopics: [],
            currentQuestionIndex: 0,
            totalEstimatedQuestions: 15,
            elapsedTime: 0,
            remainingTime: mergedConfig.timeLimit * 60
          },
          transcript: [],
          audioQuality: {
            audio: {
              inputLevel: 0,
              outputLevel: 0,
              noiseLevel: 0,
              echoDetected: false,
              qualityScore: 0
            },
            video: {
              resolution: '1280x720',
              frameRate: 30,
              brightness: 0,
              qualityScore: 0
            },
            recommendations: []
          },
          sessionData: {
            companyInsights: {
              businessModel: {
                revenueStreams: [],
                customerSegments: [],
                valueProposition: '',
                scalabilityFactors: [],
                monetizationStrategy: ''
              },
              marketAnalysis: {
                size: '',
                growth: '',
                trends: [],
                competitorAnalysis: []
              },
              competitivePosition: {
                directCompetitors: [],
                competitiveAdvantages: [],
                marketPosition: '',
                differentiators: []
              },
              teamDynamics: {
                teamSize: 0,
                keyRoles: [],
                experience: [],
                gaps: []
              },
              financialMetrics: {
                revenue: '',
                growth: '',
                runway: '',
                fundingHistory: []
              },
              riskFactors: {
                marketRisks: [],
                technicalRisks: [],
                competitiveRisks: [],
                teamRisks: []
              }
            },
            founderInsights: {
              leadership: {
                style: '',
                experience: [],
                strengths: [],
                areas: []
              },
              vision: {
                clarity: 0,
                ambition: 0,
                feasibility: 0,
                alignment: 0
              },
              experience: {
                relevant: [],
                gaps: [],
                achievements: []
              },
              challenges: {
                identified: [],
                approach: [],
                resilience: 0
              }
            },
            keyQuotes: {
              impactful: [],
              concerning: [],
              insightful: []
            },
            metrics: {
              financial: [],
              operational: [],
              growth: [],
              market: []
            },
            redFlags: {
              critical: [],
              moderate: [],
              minor: []
            }
          },
          timeLimit: mergedConfig.timeLimit
        }

        set({ 
          currentSession: newSession,
          interviewConfig: mergedConfig,
          sessionError: null,
          transcript: [],
          conversationHistory: [],
          caliberMetrics: null
        })
      },

      startSession: () => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            status: 'active',
            startTime: new Date()
          },
          isSessionActive: true
        })
      },

      pauseSession: () => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            status: 'paused'
          },
          isSessionActive: false
        })
      },

      resumeSession: () => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            status: 'active'
          },
          isSessionActive: true
        })
      },

      completeSession: (data: InterviewData) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            status: 'completed',
            endTime: new Date(),
            sessionData: data
          },
          isSessionActive: false
        })
      },

      updateSessionProgress: (updates: Partial<InterviewSession['progress']>) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            progress: {
              ...currentSession.progress,
              ...updates
            }
          }
        })
      },

      // Multi-Agent System Actions
      setAgentSystem: (system: MultiAgentSystem) => {
        set({ agentSystem: system })
      },

      updateSharedContext: (updates: Partial<SharedContext>) => {
        const { sharedContext } = get()
        if (!sharedContext) return

        set({
          sharedContext: {
            ...sharedContext,
            ...updates
          }
        })
      },

      setCurrentAgentState: (state: AgentStateDemo) => {
        set({ currentAgentState: state })
      },

      // Media Actions
      setMediaConfig: (config: MediaStreamConfig) => {
        set({ mediaConfig: config })
      },

      updateAudioQuality: (quality: AudioQualityMetrics) => {
        const { currentSession } = get()
        
        set({ 
          audioQuality: quality,
          currentSession: currentSession ? {
            ...currentSession,
            audioQuality: quality
          } : null
        })
      },

      setMediaReady: (ready: boolean) => {
        set({ isMediaReady: ready })
      },

      // Transcript and Assessment Actions
      addTranscriptEntry: (entry: TranscriptEntry) => {
        const { transcript, currentSession } = get()
        const newTranscript = [...transcript, entry]
        
        set({ 
          transcript: newTranscript,
          currentSession: currentSession ? {
            ...currentSession,
            transcript: newTranscript
          } : null
        })
      },

      updateCaliberMetrics: (metrics: CaliberMetrics) => {
        set({ caliberMetrics: metrics })
      },

      addConversationEntry: (entry: ConversationEntry) => {
        const { conversationHistory } = get()
        set({
          conversationHistory: [...conversationHistory, entry]
        })
      },

      // Utility Actions
      resetSession: () => {
        set({
          currentSession: null,
          isSessionActive: false,
          sessionError: null,
          agentSystem: null,
          sharedContext: null,
          currentAgentState: null,
          mediaConfig: null,
          audioQuality: null,
          isMediaReady: false,
          transcript: [],
          caliberMetrics: null,
          conversationHistory: []
        })
      },

      setSessionError: (error: string | null) => {
        set({ sessionError: error })
      },

      getTimeRemaining: (): number => {
        const { currentSession } = get()
        if (!currentSession || currentSession.status !== 'active') return 0

        const elapsed = Date.now() - currentSession.startTime.getTime()
        const limit = currentSession.timeLimit * 60 * 1000 // Convert to ms
        return Math.max(limit - elapsed, 0)
      },

      getProgressPercentage: (): number => {
        const { currentSession } = get()
        if (!currentSession) return 0

        const elapsed = Date.now() - currentSession.startTime.getTime()
        const limit = currentSession.timeLimit * 60 * 1000 // Convert to ms
        return Math.min((elapsed / limit) * 100, 100)
      }
    }),
    {
      name: 'interview-store',
      partialize: (state) => ({
        // Only persist essential session data, not runtime state
        interviewConfig: state.interviewConfig,
        currentSession: state.currentSession?.status === 'completed' ? state.currentSession : null
      })
    }
  )
)

// Selectors for common state access patterns
export const useInterviewSession = () => useInterviewStore((state) => state.currentSession)
export const useIsSessionActive = () => useInterviewStore((state) => state.isSessionActive)
export const useSessionError = () => useInterviewStore((state) => state.sessionError)
export const useTranscript = () => useInterviewStore((state) => state.transcript)
export const useCaliberMetrics = () => useInterviewStore((state) => state.caliberMetrics)
export const useAudioQuality = () => useInterviewStore((state) => state.audioQuality)
export const useAgentState = () => useInterviewStore((state) => state.currentAgentState)
export const useInterviewProgress = () => useInterviewStore((state) => ({
  timeRemaining: state.getTimeRemaining(),
  progressPercentage: state.getProgressPercentage(),
  currentTopic: state.currentSession?.currentTopic.name || '',
  questionsCompleted: state.currentSession?.progress.currentQuestionIndex || 0,
  totalQuestions: state.currentSession?.progress.totalEstimatedQuestions || 0
}))