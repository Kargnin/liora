/**
 * Interview Configuration Constants and Environment Variables
 * Configurable interview time limit system and core settings
 */

import { InterviewConfig } from '@/types/interview'

// ============================================================================
// Default Interview Configuration
// ============================================================================

export const DEFAULT_INTERVIEW_CONFIG: InterviewConfig = {
  timeLimit: 10, // Default 10 minutes, easily adjustable
  maxQuestions: 15, // Maximum questions per interview
  audioQualityThreshold: 0.7, // Minimum audio quality score (0-1)
  autoSaveInterval: 30, // Auto-save every 30 seconds
  memoryOptimizationThreshold: 8000, // Optimize memory at 8000 tokens
}

// ============================================================================
// Configurable Time Limits (in minutes)
// ============================================================================

export const INTERVIEW_TIME_LIMITS = {
  SHORT: 5,
  STANDARD: 10,
  EXTENDED: 20,
  LONG: 30,
  CUSTOM: 0, // Will be set dynamically
} as const

export type InterviewTimeLimit = keyof typeof INTERVIEW_TIME_LIMITS

// ============================================================================
// Environment Variables and API Configuration
// ============================================================================

export const INTERVIEW_ENV = {
  // Google Gemini Live API Configuration
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp',
  GEMINI_LIVE_ENDPOINT: process.env.NEXT_PUBLIC_GEMINI_LIVE_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent',
  
  // LangSmith Configuration (for demo purposes)
  LANGSMITH_API_KEY: process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || '',
  LANGSMITH_PROJECT: process.env.NEXT_PUBLIC_LANGSMITH_PROJECT || 'liora-ai-interview',
  LANGSMITH_ENDPOINT: process.env.NEXT_PUBLIC_LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
  
  // Backend RAG API Configuration
  RAG_API_ENDPOINT: process.env.NEXT_PUBLIC_RAG_API_ENDPOINT || 'http://localhost:3001/api/rag',
  RAG_API_KEY: process.env.NEXT_PUBLIC_RAG_API_KEY || '',
  
  // Interview Configuration
  DEFAULT_TIME_LIMIT: parseInt(process.env.NEXT_PUBLIC_DEFAULT_INTERVIEW_TIME_LIMIT || '10'),
  MAX_SESSION_DURATION: parseInt(process.env.NEXT_PUBLIC_MAX_SESSION_DURATION || '60'),
  ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true',
} as const

// ============================================================================
// Audio/Video Configuration
// ============================================================================

export const MEDIA_CONFIG = {
  audio: {
    sampleRate: 48000,
    channels: 1,
    bitDepth: 16,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user' as const,
  },
} as const

// ============================================================================
// Quality Thresholds and Monitoring
// ============================================================================

export const QUALITY_THRESHOLDS = {
  audio: {
    excellent: 0.9,
    good: 0.7,
    fair: 0.5,
    poor: 0.3,
  },
  video: {
    excellent: 0.9,
    good: 0.7,
    fair: 0.5,
    poor: 0.3,
  },
  latency: {
    excellent: 100, // ms
    good: 200,
    fair: 500,
    poor: 1000,
  },
} as const

// ============================================================================
// Agent Configuration
// ============================================================================

export const AGENT_CONFIG = {
  interviewer: {
    maxThinkingTime: 5000, // 5 seconds
    responseTimeout: 30000, // 30 seconds
    maxRetries: 3,
  },
  analyst: {
    assessmentInterval: 10000, // Assess every 10 seconds
    caliberUpdateThreshold: 0.1, // Update if score changes by 10%
    redFlagSensitivity: 0.7, // Sensitivity for red flag detection
  },
  memory: {
    compressionThreshold: 8000, // tokens
    maxMemorySize: 10000, // tokens
    contextWindow: 20, // Keep last 20 exchanges in active memory
  },
  rag: {
    retrievalTimeout: 5000, // 5 seconds
    maxResults: 10,
    relevanceThreshold: 0.6,
  },
} as const

// ============================================================================
// Interview Topics and Question Categories
// ============================================================================

export const INTERVIEW_TOPICS = {
  COMPANY_OVERVIEW: {
    id: 'company-overview',
    name: 'Company Overview',
    description: 'Understanding the business model and value proposition',
    priority: 'high' as const,
    estimatedQuestions: 3,
  },
  MARKET_OPPORTUNITY: {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    description: 'Market size, competition, and positioning',
    priority: 'high' as const,
    estimatedQuestions: 4,
  },
  TRACTION_METRICS: {
    id: 'traction-metrics',
    name: 'Traction & Metrics',
    description: 'Growth metrics, customer acquisition, and KPIs',
    priority: 'high' as const,
    estimatedQuestions: 3,
  },
  TEAM_LEADERSHIP: {
    id: 'team-leadership',
    name: 'Team & Leadership',
    description: 'Team composition, experience, and leadership style',
    priority: 'medium' as const,
    estimatedQuestions: 2,
  },
  FUNDING_STRATEGY: {
    id: 'funding-strategy',
    name: 'Funding Strategy',
    description: 'Funding needs, use of capital, and growth plans',
    priority: 'medium' as const,
    estimatedQuestions: 2,
  },
  CHALLENGES_RISKS: {
    id: 'challenges-risks',
    name: 'Challenges & Risks',
    description: 'Key challenges, risk mitigation, and contingency plans',
    priority: 'low' as const,
    estimatedQuestions: 1,
  },
} as const

// ============================================================================
// Investor Persona Configuration
// ============================================================================

export const DEFAULT_INVESTOR_PERSONA = {
  name: 'Alex Chen',
  background: 'Former founder turned VC partner with 15 years experience in B2B SaaS and fintech',
  investmentFocus: ['B2B SaaS', 'Fintech', 'AI/ML', 'Enterprise Software'],
  questioningStyle: 'conversational' as const,
  experienceLevel: 'partner' as const,
  specialties: ['go-to-market strategy', 'product-market fit', 'scaling teams', 'enterprise sales'],
} as const

// ============================================================================
// Live Captions Configuration
// ============================================================================

export const LIVE_CAPTIONS_CONFIG = {
  enabled: true,
  position: 'bottom' as const,
  fontSize: 'medium' as const,
  showSpeakerLabels: true,
  showConfidence: false,
} as const

// ============================================================================
// Utility Functions for Configuration
// ============================================================================

/**
 * Get interview configuration with custom time limit
 */
export function getInterviewConfig(customTimeLimit?: number): InterviewConfig {
  return {
    ...DEFAULT_INTERVIEW_CONFIG,
    timeLimit: customTimeLimit || DEFAULT_INTERVIEW_CONFIG.timeLimit,
  }
}

/**
 * Validate environment variables for interview system
 */
export function validateInterviewEnvironment(): {
  isValid: boolean
  missingVars: string[]
  warnings: string[]
} {
  const required = ['NEXT_PUBLIC_GEMINI_API_KEY']
  const optional = [
    'NEXT_PUBLIC_LANGSMITH_API_KEY',
    'NEXT_PUBLIC_RAG_API_ENDPOINT',
    'NEXT_PUBLIC_RAG_API_KEY',
  ]

  const missingVars: string[] = []
  const warnings: string[] = []

  // Check required variables
  required.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })

  // Check optional variables and warn if missing
  optional.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable ${varName} is not set`)
    }
  })

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  }
}

/**
 * Get time limit in milliseconds
 */
export function getTimeLimitMs(timeLimit: number): number {
  return timeLimit * 60 * 1000
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(remainingMs: number): string {
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Check if interview should auto-complete based on time
 */
export function shouldAutoComplete(
  startTime: Date,
  timeLimit: number,
  bufferSeconds: number = 30
): boolean {
  const elapsed = Date.now() - startTime.getTime()
  const limit = getTimeLimitMs(timeLimit)
  return elapsed >= limit - bufferSeconds * 1000
}