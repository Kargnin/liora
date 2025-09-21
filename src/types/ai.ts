// AI-related type definitions for interviews, questions, and analysis

// ============================================================================
// AI QUESTION TYPES
// ============================================================================

export interface AIQuestion {
  id: string
  text: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'scale' | 'boolean' | 'textarea'
  required: boolean
  category: string
  subcategory?: string
  order: number
  options?: AIQuestionOption[]
  validation?: AIQuestionValidation
  conditionalLogic?: AIConditionalLogic
  helpText?: string
  placeholder?: string
  metadata?: {
    aiGenerated: boolean
    confidence: number
    reasoning?: string
    basedOnAnalysis?: string[]
  }
}

export interface AIQuestionOption {
  value: string | number
  label: string
  description?: string
  followUpQuestions?: string[] // Question IDs
}

export interface AIQuestionValidation {
  min?: number
  max?: number
  pattern?: string
  customValidator?: string // Function name or expression
  errorMessage?: string
}

export interface AIConditionalLogic {
  dependsOn: string // Question ID
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range'
  value: string | number | boolean | [number, number]
  action: 'show' | 'hide' | 'require' | 'disable' | 'set_value'
  targetValue?: string | number | boolean
}

export interface AIQuestionCategory {
  id: string
  name: string
  description: string
  order: number
  questions: AIQuestion[]
  completionRequired: boolean
  estimatedTime: number // in minutes
  aiInsights?: {
    importance: 'low' | 'medium' | 'high' | 'critical'
    reasoning: string
    suggestedFocus: string[]
  }
}

export interface AIQuestionResponse {
  questionId: string
  answer: string | number | string[] | boolean
  timestamp: string
  confidence?: number
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative'
    keyPoints: string[]
    followUpSuggestions: string[]
    riskIndicators?: string[]
  }
}

// ============================================================================
// AI INTERVIEW TYPES
// ============================================================================

export interface AIInterviewConfig {
  sessionId: string
  founderId: string
  companyId: string
  interviewType: 'initial' | 'follow_up' | 'deep_dive'
  estimatedDuration: number // in minutes
  audioConfig: {
    sampleRate: 16000 | 22050 | 44100 | 48000
    channels: 1 | 2
    format: 'pcm' | 'wav' | 'mp3'
    bitDepth: 16 | 24 | 32
  }
  aiPersonality: {
    style: 'professional' | 'casual' | 'investigative' | 'supportive'
    tone: 'formal' | 'conversational' | 'friendly'
    expertise: string[] // Areas of focus
  }
}

export interface AIInterviewSession {
  id: string
  config: AIInterviewConfig
  status: 'initializing' | 'starting' | 'active' | 'paused' | 'completed' | 'error' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number // in seconds
  transcript: AITranscriptEntry[]
  audioRecordings: AIAudioSegment[]
  analysis: AIInterviewAnalysis
  metadata: {
    totalQuestions: number
    questionsAnswered: number
    averageResponseTime: number
    interruptionCount: number
    silenceDuration: number
  }
}

export interface AITranscriptEntry {
  id: string
  sessionId: string
  speaker: 'ai' | 'founder'
  text: string
  timestamp: number // milliseconds from start
  duration: number // milliseconds
  confidence: number // 0-1
  isFinal: boolean
  emotions?: {
    primary: string
    confidence: number
    secondary?: string[]
  }
  intent?: {
    category: string
    confidence: number
    entities?: Record<string, string>
  }
}

export interface AIAudioSegment {
  id: string
  sessionId: string
  speaker: 'ai' | 'founder'
  startTime: number
  endTime: number
  audioData: ArrayBuffer
  transcriptId: string
  audioFeatures?: {
    volume: number
    pitch: number
    speed: number
    clarity: number
  }
}

export interface AIInterviewAnalysis {
  sessionId: string
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  keyInsights: string[]
  strengths: string[]
  concerns: string[]
  redFlags: string[]
  followUpRecommendations: string[]
  confidenceScore: number // 0-100
  completenessScore: number // 0-100
  topics: {
    name: string
    coverage: number // 0-100
    sentiment: 'positive' | 'neutral' | 'negative'
    keyPoints: string[]
  }[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigationSuggestions: string[]
  }
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export interface AIAnalysisJob {
  id: string
  companyId: string
  type: 'initial' | 'update' | 'deep_analysis'
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  startedAt?: string
  completedAt?: string
  progress: number // 0-100
  currentStage: string
  estimatedCompletion?: string
  inputData: {
    companyData: Record<string, unknown>
    uploadedFiles: string[] // File IDs
    questionResponses?: AIQuestionResponse[]
    interviewTranscript?: string
  }
  outputData?: {
    memoId: string
    analysisReport: AIAnalysisReport
    generatedQuestions?: AIQuestion[]
  }
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface AIAnalysisReport {
  id: string
  companyId: string
  version: string
  createdAt: string
  analysisType: 'comprehensive' | 'quick' | 'focused'
  dataQuality: {
    completeness: number // 0-100
    accuracy: number // 0-100
    freshness: number // 0-100
    reliability: number // 0-100
  }
  keyFindings: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  marketAnalysis: {
    marketSize: number
    growthRate: number
    competitivePosition: string
    marketTrends: string[]
    barriers: string[]
  }
  teamAnalysis: {
    founderStrengths: string[]
    experienceGaps: string[]
    teamComposition: string
    leadershipAssessment: string
  }
  productAnalysis: {
    innovationLevel: 'low' | 'medium' | 'high'
    marketFit: 'poor' | 'fair' | 'good' | 'excellent'
    scalability: 'low' | 'medium' | 'high'
    differentiation: string[]
  }
  financialAnalysis: {
    revenueModel: string
    profitabilityOutlook: string
    fundingNeeds: number
    burnRate?: number
    runway?: number
  }
  riskAnalysis: {
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: {
      category: string
      level: 'low' | 'medium' | 'high'
      description: string
      mitigation?: string
    }[]
  }
  recommendations: {
    investmentRecommendation: 'strong_buy' | 'buy' | 'hold' | 'pass'
    confidence: number // 0-100
    reasoning: string[]
    suggestedActions: string[]
    followUpQuestions: string[]
  }
}

// ============================================================================
// AI PROCESSING TYPES
// ============================================================================

export interface AIProcessingPipeline {
  id: string
  name: string
  stages: AIProcessingStage[]
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  version: string
  isActive: boolean
}

export interface AIProcessingStage {
  id: string
  name: string
  type: 'data_extraction' | 'analysis' | 'generation' | 'validation' | 'enrichment'
  processor: string // AI model or service name
  config: Record<string, unknown>
  dependencies: string[] // Stage IDs
  timeout: number // seconds
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffTime: number
  }
}

export interface AIProcessingResult {
  stageId: string
  status: 'success' | 'error' | 'timeout' | 'cancelled'
  startTime: string
  endTime: string
  duration: number // milliseconds
  inputData: Record<string, unknown>
  outputData?: Record<string, unknown>
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  metrics: {
    tokensUsed?: number
    apiCalls?: number
    confidence?: number
    processingTime?: number
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AIQuestionType = 'text' | 'number' | 'select' | 'multiselect' | 'scale' | 'boolean' | 'textarea'
export type AIInterviewStatus = 'initializing' | 'starting' | 'active' | 'paused' | 'completed' | 'error' | 'cancelled'
export type AIAnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type AIPersonalityStyle = 'professional' | 'casual' | 'investigative' | 'supportive'
export type AIPersonalityTone = 'formal' | 'conversational' | 'friendly'
export type AISentiment = 'positive' | 'neutral' | 'negative' | 'mixed'
export type AIRiskLevel = 'low' | 'medium' | 'high'
export type AIInvestmentRecommendation = 'strong_buy' | 'buy' | 'hold' | 'pass'
export type AIProcessingStageType = 'data_extraction' | 'analysis' | 'generation' | 'validation' | 'enrichment'
export type AIProcessingStatus = 'success' | 'error' | 'timeout' | 'cancelled'