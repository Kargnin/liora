/**
 * Type definitions for Interview API responses
 * Uses proper LangChain message serialization
 */

export interface SerializedMessage {
  id?: string
  type: 'ai' | 'human' | 'system'
  content: string
  additional_kwargs?: Record<string, unknown>
  response_metadata?: Record<string, unknown>
}

export interface WorkflowStatus {
  currentStep: string
  progress: number
  questionsRemaining: number
}

export interface MemoryStats {
  totalConversations: number
  memoryHealth: 'good' | 'fair' | 'poor'
}

export interface InterviewState {
  messages: SerializedMessage[]
  currentQuestion: string
  founderResponse: string
  conversationHistory: string[]
  isComplete: boolean
  questionCount: number
}

export interface InterviewApiResponse {
  success: boolean
  state?: InterviewState
  memoryStats?: MemoryStats
  workflowStatus?: WorkflowStatus
  error?: string
}

export interface InterviewApiRequest {
  action: 'initialize' | 'processResponse' | 'reset' | 'getStats'
  sessionId: string
  data?: {
    response?: string
  }
}