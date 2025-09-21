/**
 * Core TypeScript interfaces for AI Interview system
 * Multi-agent architecture, caliber assessment, and Google Meet-like interface
 */

// ============================================================================
// Interview Session Management
// ============================================================================

export interface InterviewSession {
  id: string
  founderId: string
  status: 'initializing' | 'active' | 'paused' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  currentTopic: InterviewTopic
  progress: InterviewProgress
  transcript: TranscriptEntry[]
  audioQuality: AudioQualityMetrics
  sessionData: InterviewData
  timeLimit: number // in minutes, configurable
}

export interface InterviewProgress {
  completedTopics: InterviewTopic[]
  currentQuestionIndex: number
  totalEstimatedQuestions: number
  elapsedTime: number // in seconds
  remainingTime: number // in seconds
}

export interface InterviewTopic {
  id: string
  name: string
  description: string
  questions: InterviewQuestion[]
  completed: boolean
  insights: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface InterviewQuestion {
  id: string
  text: string
  type: 'open-ended' | 'specific-metric' | 'clarification' | 'follow-up'
  expectedResponseType: 'text' | 'number' | 'date' | 'list'
  importance: 'high' | 'medium' | 'low'
  followUpTriggers: string[]
  contextData?: Record<string, unknown>
}

export interface TranscriptEntry {
  id: string
  timestamp: Date
  speaker: 'founder' | 'ai'
  text: string
  confidence: number
  audioUrl?: string
  keyInsights?: string[]
  questionId?: string
}

// ============================================================================
// Multi-Agent System Interfaces
// ============================================================================

export interface MultiAgentSystem {
  agents: {
    interviewer: InterviewerAgent
    analyst: AnalystAgent
    memoryManager: MemoryManagerAgent
    ragAgent: RAGAgent
  }
  coordinator: AgentCoordinator
  sharedContext: SharedContext
  executeWorkflow: () => Promise<void>
}

export interface BaseAgent {
  id: string
  type: string
  status: 'idle' | 'thinking' | 'processing' | 'error'
  lastActivity: Date
  currentTask?: string
}

export interface InterviewerAgent extends BaseAgent {
  type: 'interviewer'
  persona: InvestorPersona
  generateQuestion: (context: SharedContext) => Promise<InterviewQuestion>
  evaluateResponse: (response: string) => Promise<ResponseEvaluation>
  transitionTopic: (currentTopic: string, insights: Insight[]) => Promise<string>
}

export interface AnalystAgent extends BaseAgent {
  type: 'analyst'
  assessCaliberMetrics: (response: string, context: SharedContext) => Promise<CaliberMetrics>
  identifyRedFlags: (conversationHistory: ConversationEntry[]) => Promise<RedFlag[]>
  generateInsights: (responses: string[]) => Promise<FounderInsight[]>
  calculateInvestmentPotential: (session: InterviewSession) => Promise<InvestmentScore>
}

export interface MemoryManagerAgent extends BaseAgent {
  type: 'memory'
  storeConversation: (entry: ConversationEntry) => Promise<void>
  retrieveContext: (query: string) => Promise<ConversationContext>
  maintainContinuity: (newTopic: string) => Promise<ContinuityBridge>
  optimizeMemory: (sessionDuration: number) => Promise<void>
}

export interface RAGAgent extends BaseAgent {
  type: 'rag'
  retrieveFounderData: (founderId: string) => Promise<FounderData>
  retrievePublicData: (companyName: string, sector: string) => Promise<PublicData>
  injectContext: (question: string, context: RetrievedData) => Promise<ContextualQuestion>
  updateKnowledgeBase: (newInsights: Insight[]) => Promise<void>
}

export interface AgentCoordinator {
  executeInterviewCycle: () => Promise<void>
  getCurrentActiveAgent: () => BaseAgent | null
  updateSharedContext: (updates: Partial<SharedContext>) => void
  handleAgentError: (agentId: string, error: Error) => Promise<void>
}

export interface SharedContext {
  session: InterviewSession
  founderProfile: FounderProfile
  companyData: CompanyData
  conversationHistory: ConversationEntry[]
  currentInsights: InsightCollection
  caliberMetrics: CaliberMetrics
  ragData: RetrievedData
  memoryContext: ConversationContext
}

export interface InvestorPersona {
  name: string
  background: string
  investmentFocus: string[]
  questioningStyle: 'direct' | 'conversational' | 'analytical'
  experienceLevel: 'partner' | 'principal' | 'associate'
  specialties: string[]
}

// ============================================================================
// Media Processing and Google Meet-like Interface
// ============================================================================

export interface MediaStreamConfig {
  audio: {
    sampleRate: number
    channels: number
    bitDepth: number
    echoCancellation: boolean
    noiseSuppression: boolean
    autoGainControl: boolean
  }
  video: {
    width: number
    height: number
    frameRate: number
    facingMode: 'user' | 'environment'
  }
}

export interface MediaDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput' | 'videoinput'
  groupId: string
}

export interface DeviceTestResult {
  deviceId: string
  type: 'audio' | 'video'
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  recommendations: string[]
}

export interface AudioLevelMeter {
  inputLevel: number // 0-100
  outputLevel: number // 0-100
  noiseLevel: number // 0-100
  isActive: boolean
}

export interface VideoQualityIndicator {
  resolution: string
  frameRate: number
  brightness: number // 0-100
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
}

export interface AudioQualityMetrics {
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
  recommendations: string[]
}

export interface GeminiLiveClient {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendMedia: (mediaData: MediaData) => Promise<void>
  onMediaResponse: (callback: (media: MediaResponse) => void) => void
  onTranscript: (callback: (transcript: TranscriptData) => void) => void
  onError: (callback: (error: GeminiError) => void) => void
  getConnectionStatus: () => ConnectionStatus
}

export interface MediaData {
  type: 'audio' | 'video'
  data: ArrayBuffer
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface MediaResponse {
  type: 'audio' | 'video'
  data: ArrayBuffer
  timestamp: number
}

export interface TranscriptData {
  text: string
  confidence: number
  isFinal: boolean
  speaker: 'founder' | 'ai'
  timestamp: Date
  alternatives?: TranscriptAlternative[]
  keyPhrases?: string[]
}

export interface TranscriptAlternative {
  text: string
  confidence: number
}

export interface GeminiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ConnectionStatus {
  connected: boolean
  latency?: number
  quality?: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface LiveCaptionsConfig {
  enabled: boolean
  position: 'bottom' | 'top'
  fontSize: 'small' | 'medium' | 'large'
  showSpeakerLabels: boolean
  showConfidence: boolean
}

// ============================================================================
// Caliber Assessment and Investment Evaluation
// ============================================================================

export interface CaliberMetrics {
  overall: number // 0-100
  categories: {
    communication: CaliberCategory
    leadership: CaliberCategory
    marketKnowledge: CaliberCategory
    strategicThinking: CaliberCategory
    resilience: CaliberCategory
    businessAcumen: CaliberCategory
  }
  redFlags: RedFlag[]
  strengths: Strength[]
  concerns: Concern[]
}

export interface CaliberCategory {
  score: number // 0-100
  confidence: number // 0-1
  evidence: string[]
  keyIndicators: string[]
}

export interface RedFlag {
  type: 'financial' | 'market' | 'team' | 'product' | 'legal'
  severity: 'low' | 'medium' | 'high'
  description: string
  evidence: string[]
  timestamp: Date
}

export interface Strength {
  category: string
  description: string
  evidence: string[]
  impact: 'high' | 'medium' | 'low'
}

export interface Concern {
  category: string
  description: string
  evidence: string[]
  severity: 'low' | 'medium' | 'high'
}

// ============================================================================
// Interview Data Collection and RAG System
// ============================================================================

export interface InterviewData {
  companyInsights: {
    businessModel: BusinessModelInsights
    marketAnalysis: MarketInsights
    competitivePosition: CompetitiveInsights
    teamDynamics: TeamInsights
    financialMetrics: FinancialInsights
    riskFactors: RiskInsights
  }
  founderInsights: {
    leadership: LeadershipInsights
    vision: VisionInsights
    experience: ExperienceInsights
    challenges: ChallengeInsights
  }
  keyQuotes: QuoteCollection
  metrics: MetricCollection
  redFlags: RedFlagCollection
}

export interface BusinessModelInsights {
  revenueStreams: RevenueStream[]
  customerSegments: CustomerSegment[]
  valueProposition: string
  scalabilityFactors: string[]
  monetizationStrategy: string
}

export interface MarketInsights {
  size: string
  growth: string
  trends: string[]
  competitorAnalysis: CompetitorAnalysis[]
}

export interface CompetitiveInsights {
  directCompetitors: string[]
  competitiveAdvantages: string[]
  marketPosition: string
  differentiators: string[]
}

export interface TeamInsights {
  teamSize: number
  keyRoles: string[]
  experience: string[]
  gaps: string[]
}

export interface FinancialInsights {
  revenue: string
  growth: string
  runway: string
  fundingHistory: string[]
}

export interface RiskInsights {
  marketRisks: string[]
  technicalRisks: string[]
  competitiveRisks: string[]
  teamRisks: string[]
}

export interface LeadershipInsights {
  style: string
  experience: string[]
  strengths: string[]
  areas: string[]
}

export interface VisionInsights {
  clarity: number
  ambition: number
  feasibility: number
  alignment: number
}

export interface ExperienceInsights {
  relevant: string[]
  gaps: string[]
  achievements: string[]
}

export interface ChallengeInsights {
  identified: string[]
  approach: string[]
  resilience: number
}

export interface QuoteCollection {
  impactful: Quote[]
  concerning: Quote[]
  insightful: Quote[]
}

export interface Quote {
  text: string
  context: string
  timestamp: Date
  significance: 'high' | 'medium' | 'low'
}

export interface MetricCollection {
  financial: FinancialMetric[]
  operational: OperationalMetric[]
  growth: GrowthMetric[]
  market: MarketMetric[]
}

export interface FinancialMetric {
  name: string
  value: string | number
  unit?: string
  period?: string
  context?: string
}

export interface OperationalMetric {
  name: string
  value: string | number
  unit?: string
  benchmark?: string
}

export interface GrowthMetric {
  name: string
  value: string | number
  period: string
  trend: 'up' | 'down' | 'stable'
}

export interface MarketMetric {
  name: string
  value: string | number
  source?: string
  relevance?: string
}

export interface RedFlagCollection {
  critical: RedFlag[]
  moderate: RedFlag[]
  minor: RedFlag[]
}

// ============================================================================
// RAG System and Data Retrieval
// ============================================================================

export interface FounderData {
  profile: FounderProfile
  company: CompanyData
  documents: DocumentData[]
  previousInterviews: InterviewSummary[]
}

export interface FounderProfile {
  id: string
  name: string
  email: string
  background: string[]
  experience: string[]
  education: string[]
  previousCompanies: string[]
}

export interface CompanyData {
  id: string
  name: string
  sector: string
  stage: string
  description: string
  website?: string
  foundedDate?: Date
  location?: string
}

export interface DocumentData {
  id: string
  name: string
  type: string
  content: string
  uploadDate: Date
}

export interface InterviewSummary {
  id: string
  date: Date
  duration: number
  topics: string[]
  keyInsights: string[]
  caliberScore: number
}

export interface PublicData {
  market: MarketData
  competitors: CompetitorData[]
  trends: string[]
  benchmarks: BenchmarkData
}

export interface MarketData {
  size: string
  growth: string
  trends: string[]
}

export interface CompetitorData {
  name: string
  funding: string
  marketShare: string
  strengths?: string[]
}

export interface BenchmarkData {
  revenueGrowth: string
  customerAcquisitionCost: string
  churnRate: string
  [key: string]: string
}

export interface RetrievedData {
  founderData?: FounderData
  publicData?: PublicData
  relevanceScore: number
  timestamp: Date
}

export interface ContextualQuestion {
  originalQuestion: string
  enhancedQuestion: string
  contextUsed: RetrievedData
  relevanceScore: number
}

// ============================================================================
// Conversation and Memory Management
// ============================================================================

export interface ConversationEntry {
  id: string
  question: string
  response: string
  timestamp: Date
  caliberMetrics?: CaliberMetrics
  insights?: string[]
}

export interface ConversationContext {
  entries: ConversationEntry[]
  summary: string
  keyInsights: string[]
  totalEntries?: number
  recentExchanges?: string
}

export interface ContinuityBridge {
  previousTopic: string
  newTopic: string
  connectionPoints: string[]
  transitionPhrase: string
}

export interface ConversationMemory {
  entries: ConversationEntry[]
  compressedSummary: string
  keyInsights: string[]
  totalTokens: number
}

// ============================================================================
// Response Evaluation and Insights
// ============================================================================

export interface ResponseEvaluation {
  quality: number // 0-100
  completeness: number // 0-100
  credibility: number // 0-100
  insights: string[]
  followUpNeeded: boolean
  suggestedFollowUps: string[]
}

export interface Insight {
  type: 'strength' | 'concern' | 'opportunity' | 'risk'
  category: string
  description: string
  evidence: string[]
  confidence: number // 0-1
}

export interface FounderInsight {
  founderId: string
  category: string
  insight: string
  evidence: string[]
  timestamp: Date
  confidence: number
}

export interface InsightCollection {
  strengths: Insight[]
  concerns: Insight[]
  opportunities: Insight[]
  risks: Insight[]
}

export interface InvestmentScore {
  overall: number // 0-100
  categories: {
    market: number
    product: number
    team: number
    traction: number
    financials: number
  }
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  reasoning: string[]
}

// ============================================================================
// Component Props and UI Interfaces
// ============================================================================

export interface InterviewRoomProps {
  founderId: string
  onComplete: (data: InterviewData) => void
  onError: (error: InterviewError) => void
}

export interface VideoPreviewProps {
  onSetupComplete: (config: MediaStreamConfig) => void
  onDeviceChange: (deviceId: string, type: 'audio' | 'video') => void
}

export interface DeviceSetupProps {
  onDeviceSelected: (deviceId: string, type: 'audio' | 'video') => void
  onTestComplete: (result: DeviceTestResult) => void
  onQualityUpdate: (quality: AudioQualityMetrics) => void
}

export interface LiveCaptionsProps {
  transcript: TranscriptEntry[]
  config: LiveCaptionsConfig
  onConfigChange: (config: LiveCaptionsConfig) => void
}

export interface TranscriptSidePanelProps {
  transcript: TranscriptEntry[]
  isOpen: boolean
  onToggle: () => void
  onExport: () => void
  onSearch: (query: string) => void
}

export interface CaliberIndicatorsProps {
  metrics: CaliberMetrics
  showRealTime: boolean
  onDetailView: (category: string) => void
}

export interface InterviewError {
  code: string
  message: string
  details?: Record<string, unknown>
  recoverable: boolean
}

// ============================================================================
// Configuration and Constants
// ============================================================================

export interface InterviewConfig {
  timeLimit: number // minutes
  maxQuestions: number
  audioQualityThreshold: number
  autoSaveInterval: number // seconds
  memoryOptimizationThreshold: number // tokens
}

export interface AgentThinking {
  currentTask: string
  reasoning: string
  dataFetched: Record<string, unknown>
  nextAction: string
  confidence: number
}

export interface AgentStateDemo {
  currentAgent: string
  thinking: AgentThinking
  dataBeingFetched: string[]
  traceUrl?: string
}

// ============================================================================
// Utility Types
// ============================================================================

export type InterviewStatus = InterviewSession['status']
export type AgentType = BaseAgent['type']
export type CaliberCategoryName = keyof CaliberMetrics['categories']
export type RedFlagType = RedFlag['type']
export type RedFlagSeverity = RedFlag['severity']

// Revenue stream types
export interface RevenueStream {
  name: string
  type: 'subscription' | 'transaction' | 'licensing' | 'advertising' | 'other'
  amount?: string
  percentage?: number
}

export interface CustomerSegment {
  name: string
  size: string
  characteristics: string[]
  needs: string[]
}

export interface CompetitorAnalysis {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare?: string
  funding?: string
}