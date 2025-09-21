/**
 * Multi-Agent Coordinator for AI Interview System
 * Orchestrates interviewer, analyst, memory manager, and RAG agents
 * Integrates with LangGraph for workflow orchestration
 */

import { 
  MultiAgentSystem, 
  AgentCoordinator, 
  SharedContext, 
  InterviewSession,
  BaseAgent,
  InterviewerAgent,
  AnalystAgent,
  MemoryManagerAgent,
  RAGAgent,
  ConversationEntry,
  CaliberMetrics,
  InterviewQuestion
} from '@/types/interview'
import { LangGraphCoordinator } from './langgraph-coordinator'
import { QuestionManager } from './question-manager'
import { InterviewerAgentImpl } from './interviewer-agent'
import { AnalystAgentImpl } from './analyst-agent'
import { MemoryManagerAgentImpl } from './memory-manager-agent'
import { RAGAgentImpl } from './rag-agent'
import { AGENT_CONFIG } from '@/lib/interview/config'

export class MultiAgentCoordinator implements AgentCoordinator {
  private agents: MultiAgentSystem['agents']
  private sharedContext: SharedContext
  private isRunning: boolean = false
  private currentActiveAgent: BaseAgent | null = null
  private langGraphCoordinator: LangGraphCoordinator
  private questionManager: QuestionManager

  constructor(
    agents?: MultiAgentSystem['agents'],
    initialContext?: SharedContext
  ) {
    // Initialize agents if not provided
    this.agents = agents || {
      interviewer: new InterviewerAgentImpl(),
      analyst: new AnalystAgentImpl(),
      memoryManager: new MemoryManagerAgentImpl(),
      ragAgent: new RAGAgentImpl()
    }
    
    // Use provided context or create default
    this.sharedContext = initialContext || this.createDefaultContext()
    
    // Initialize LangGraph coordinator
    this.langGraphCoordinator = new LangGraphCoordinator(this.sharedContext)
    
    // Initialize question manager
    this.questionManager = new QuestionManager(this.sharedContext.session.timeLimit * 60)
  }

  /**
   * Create default shared context for testing/initialization
   */
  private createDefaultContext(): SharedContext {
    const mockSession: InterviewSession = {
      id: 'default-session',
      founderId: 'default-founder',
      status: 'initializing',
      startTime: new Date(),
      currentTopic: {
        id: 'introduction',
        name: 'Introduction',
        description: 'Getting to know the founder and company',
        questions: [],
        completed: false,
        insights: [],
        priority: 'high'
      },
      progress: {
        completedTopics: [],
        currentQuestionIndex: 0,
        totalEstimatedQuestions: 10,
        elapsedTime: 0,
        remainingTime: 600
      },
      transcript: [],
      audioQuality: {
        audio: { inputLevel: 0, outputLevel: 0, noiseLevel: 0, echoDetected: false, qualityScore: 0 },
        video: { resolution: '', frameRate: 0, brightness: 0, qualityScore: 0 },
        recommendations: []
      },
      sessionData: {} as any,
      timeLimit: 10
    }

    return {
      session: mockSession,
      founderProfile: {
        id: 'default-founder',
        name: 'Default Founder',
        email: 'founder@example.com',
        background: [],
        experience: [],
        education: [],
        previousCompanies: []
      },
      companyData: {
        id: 'default-company',
        name: 'Default Company',
        sector: 'Technology',
        stage: 'Seed',
        description: 'A technology startup'
      },
      conversationHistory: [],
      currentInsights: { strengths: [], concerns: [], opportunities: [], risks: [] },
      caliberMetrics: {
        overall: 0,
        categories: {
          communication: { score: 0, confidence: 0, evidence: [], keyIndicators: [] },
          leadership: { score: 0, confidence: 0, evidence: [], keyIndicators: [] },
          marketKnowledge: { score: 0, confidence: 0, evidence: [], keyIndicators: [] },
          strategicThinking: { score: 0, confidence: 0, evidence: [], keyIndicators: [] },
          resilience: { score: 0, confidence: 0, evidence: [], keyIndicators: [] },
          businessAcumen: { score: 0, confidence: 0, evidence: [], keyIndicators: [] }
        },
        redFlags: [],
        strengths: [],
        concerns: []
      },
      ragData: { relevanceScore: 0, timestamp: new Date() },
      memoryContext: { entries: [], summary: '', keyInsights: [] }
    }
  }

  /**
   * Initialize the interview system
   */
  async initializeInterview(): Promise<void> {
    try {
      // Initialize question queue
      await this.questionManager.initializeQuestions(this.sharedContext)
      
      // Update session status
      this.updateSharedContext({
        session: {
          ...this.sharedContext.session,
          status: 'active'
        }
      })
      
      console.log('Interview system initialized successfully')
    } catch (error) {
      console.error('Failed to initialize interview:', error)
      throw error
    }
  }

  /**
   * Main interview cycle execution using LangGraph
   */
  async executeInterviewCycle(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Interview cycle is already running')
    }

    this.isRunning = true
    
    try {
      // Initialize if not already done
      if (this.sharedContext.session.status === 'initializing') {
        await this.initializeInterview()
      }

      // Execute LangGraph workflow
      const workflowState = await this.langGraphCoordinator.executeWorkflow({
        sharedContext: this.sharedContext,
        messages: [],
        agentThinking: {},
        nextAction: 'rag_retrieval',
        isComplete: false
      })

      // Update shared context with workflow results
      this.sharedContext = workflowState.sharedContext

    } catch (error) {
      console.error('Error in interview cycle:', error)
      await this.handleSystemError(error as Error)
    } finally {
      this.isRunning = false
      this.currentActiveAgent = null
    }
  }

  /**
   * Get next question for the interview
   */
  async getNextQuestion(): Promise<InterviewQuestion | null> {
    try {
      return await this.questionManager.getNextQuestion(this.sharedContext)
    } catch (error) {
      console.error('Error getting next question:', error)
      return null
    }
  }

  /**
   * Execute a single interview cycle
   */
  private async executeSingleCycle(): Promise<void> {
    try {
      // 1. RAG Agent retrieves relevant context
      this.currentActiveAgent = this.agents.ragAgent
      const ragContext = await this.agents.ragAgent.retrieveFounderData(
        this.sharedContext.session.founderId
      )

      // 2. Memory Manager provides conversational continuity
      this.currentActiveAgent = this.agents.memoryManager
      const memoryContext = await this.agents.memoryManager.retrieveContext(
        this.sharedContext.session.currentTopic.name
      )

      // 3. Interviewer Agent generates contextual question
      this.currentActiveAgent = this.agents.interviewer
      const question = await this.agents.interviewer.generateQuestion({
        ...this.sharedContext,
        ragData: { 
          founderData: ragContext, 
          relevanceScore: 0.8, 
          timestamp: new Date() 
        },
        memoryContext
      })

      // 4. Present question and wait for response (handled by UI)
      // This will be triggered by the UI components
      this.sharedContext.session.progress.currentQuestionIndex++

      // 5. Update shared context for next cycle
      this.updateSharedContext({ 
        session: {
          ...this.sharedContext.session,
          progress: {
            ...this.sharedContext.session.progress,
            currentQuestionIndex: this.sharedContext.session.progress.currentQuestionIndex
          }
        }
      })

    } catch (error) {
      await this.handleAgentError(
        this.currentActiveAgent?.id || 'unknown',
        error as Error
      )
    }
  }

  /**
   * Process founder's response through LangGraph workflow
   */
  async processFounderResponse(response: string, questionId: string): Promise<CaliberMetrics> {
    try {
      // Get current workflow state
      const currentState = {
        messages: [],
        sharedContext: this.sharedContext,
        founderResponse: response,
        agentThinking: {},
        nextAction: 'response_analysis',
        isComplete: false
      }

      // Process through LangGraph workflow
      const updatedState = await this.langGraphCoordinator.processFounderResponse(response, currentState)
      
      // Update shared context
      this.sharedContext = updatedState.sharedContext

      // Process through question manager
      const responseEvaluation = await this.agents.interviewer.evaluateResponse(response)
      await this.questionManager.processAnswer(questionId, response, responseEvaluation, this.sharedContext)

      return updatedState.caliberMetrics || this.sharedContext.caliberMetrics
    } catch (error) {
      console.error('Error processing founder response:', error)
      throw error
    }
  }

  /**
   * Get the currently active agent
   */
  getCurrentActiveAgent(): BaseAgent | null {
    return this.currentActiveAgent
  }

  /**
   * Update shared context with partial updates
   */
  updateSharedContext(updates: Partial<SharedContext>): void {
    this.sharedContext = {
      ...this.sharedContext,
      ...updates
    }
  }

  /**
   * Handle agent-specific errors
   */
  async handleAgentError(agentId: string, error: Error): Promise<void> {
    console.error(`Agent ${agentId} error:`, error)
    
    // Update agent status
    const agent = this.findAgentById(agentId)
    if (agent) {
      agent.status = 'error'
      agent.lastActivity = new Date()
    }

    // Implement retry logic based on agent type
    const maxRetries = AGENT_CONFIG.interviewer.maxRetries
    
    // For now, log the error and continue
    // In production, implement sophisticated error recovery
  }

  /**
   * Check if interview should complete
   */
  private isInterviewComplete(): boolean {
    const session = this.sharedContext.session
    
    // Check time limit
    const elapsed = Date.now() - session.startTime.getTime()
    const timeLimit = session.timeLimit * 60 * 1000 // Convert to ms
    
    if (elapsed >= timeLimit) {
      return true
    }

    // Check if all topics are completed
    const allTopicsCompleted = session.progress.completedTopics.length >= 
      Object.keys(session.progress).length

    // Check if maximum questions reached
    const maxQuestionsReached = session.progress.currentQuestionIndex >= 
      session.progress.totalEstimatedQuestions

    return allTopicsCompleted || maxQuestionsReached || session.status === 'completed'
  }

  /**
   * Check if interview should pause
   */
  private shouldPauseInterview(): boolean {
    return this.sharedContext.session.status === 'paused'
  }

  /**
   * Handle system-level errors
   */
  private async handleSystemError(error: Error): Promise<void> {
    console.error('System error in interview coordinator:', error)
    
    // Update session status
    this.updateSharedContext({
      session: {
        ...this.sharedContext.session,
        status: 'error'
      }
    })

    // In production, implement error reporting and recovery
  }

  /**
   * Find agent by ID
   */
  private findAgentById(agentId: string): BaseAgent | null {
    const allAgents = [
      this.agents.interviewer,
      this.agents.analyst,
      this.agents.memoryManager,
      this.agents.ragAgent
    ]
    
    return allAgents.find(agent => agent.id === agentId) || null
  }

  /**
   * Find question by ID in current session
   */
  private findQuestionById(questionId: string): InterviewQuestion | null {
    const currentTopic = this.sharedContext.session.currentTopic
    return currentTopic.questions.find(q => q.id === questionId) || null
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current interview progress
   */
  getInterviewProgress(): {
    percentage: number
    timeRemaining: number
    questionsRemaining: number
    currentTopic: string
  } {
    const session = this.sharedContext.session
    const elapsed = Date.now() - session.startTime.getTime()
    const timeLimit = session.timeLimit * 60 * 1000
    
    return {
      percentage: Math.min((elapsed / timeLimit) * 100, 100),
      timeRemaining: Math.max(timeLimit - elapsed, 0),
      questionsRemaining: session.progress.totalEstimatedQuestions - session.progress.currentQuestionIndex,
      currentTopic: session.currentTopic.name
    }
  }

  /**
   * Pause the interview
   */
  pauseInterview(): void {
    this.updateSharedContext({
      session: {
        ...this.sharedContext.session,
        status: 'paused'
      }
    })
  }

  /**
   * Resume the interview
   */
  resumeInterview(): void {
    this.updateSharedContext({
      session: {
        ...this.sharedContext.session,
        status: 'active'
      }
    })
  }

  /**
   * Complete the interview
   */
  completeInterview(): void {
    this.updateSharedContext({
      session: {
        ...this.sharedContext.session,
        status: 'completed',
        endTime: new Date()
      }
    })
  }

  /**
   * Get shared context (read-only)
   */
  getSharedContext(): Readonly<SharedContext> {
    return this.sharedContext
  }

  /**
   * Get question manager for external access
   */
  getQuestionManager(): QuestionManager {
    return this.questionManager
  }

  /**
   * Get LangGraph coordinator for monitoring
   */
  getLangGraphCoordinator(): LangGraphCoordinator {
    return this.langGraphCoordinator
  }

  /**
   * Get current agent thinking for demo purposes
   */
  getCurrentAgentThinking(): Record<string, any> {
    const workflowState = {
      messages: [],
      sharedContext: this.sharedContext,
      agentThinking: {},
      nextAction: 'idle',
      isComplete: false
    }
    
    return this.langGraphCoordinator.getCurrentAgentThinking(workflowState)
  }

  /**
   * Get workflow status for monitoring
   */
  getWorkflowStatus(): {
    currentStep: string
    progress: number
    agentStatuses: Record<string, string>
    questionQueueStatus: any
  } {
    const workflowState = {
      messages: [],
      sharedContext: this.sharedContext,
      agentThinking: {},
      nextAction: 'idle',
      isComplete: false
    }
    
    const workflowStatus = this.langGraphCoordinator.getWorkflowState(workflowState)
    const questionStatus = this.questionManager.getQueueStatus()
    
    return {
      ...workflowStatus,
      questionQueueStatus: questionStatus
    }
  }

  /**
   * Force skip current question
   */
  skipCurrentQuestion(reason: string): boolean {
    const currentQuestion = this.sharedContext.session.currentTopic.questions[0]
    if (currentQuestion) {
      return this.questionManager.skipQuestion(currentQuestion.id, reason)
    }
    return false
  }

  /**
   * Add custom question to interview
   */
  addCustomQuestion(question: InterviewQuestion, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    this.questionManager.addCustomQuestion(question, priority)
  }

  /**
   * Get interview statistics
   */
  getInterviewStats(): {
    duration: number
    questionsAsked: number
    questionsRemaining: number
    averageResponseTime: number
    caliberTrend: number[]
    topicsCovered: string[]
  } {
    const session = this.sharedContext.session
    const duration = Date.now() - session.startTime.getTime()
    const questionStatus = this.questionManager.getQueueStatus()
    
    // Calculate caliber trend from conversation history
    const caliberTrend = this.sharedContext.conversationHistory
      .filter(entry => entry.caliberMetrics)
      .map(entry => entry.caliberMetrics!.overall)
    
    // Extract topics covered
    const topicsCovered = [...new Set(
      this.sharedContext.conversationHistory.map(entry => {
        // Extract topic from question content
        const question = entry.question.toLowerCase()
        if (question.includes('market')) return 'Market Analysis'
        if (question.includes('team')) return 'Team Dynamics'
        if (question.includes('revenue')) return 'Financial Metrics'
        if (question.includes('product')) return 'Product Development'
        return 'General Discussion'
      })
    )]
    
    return {
      duration: Math.floor(duration / 1000), // in seconds
      questionsAsked: questionStatus.completedQuestions,
      questionsRemaining: questionStatus.remainingQuestions,
      averageResponseTime: duration / Math.max(questionStatus.completedQuestions, 1),
      caliberTrend,
      topicsCovered
    }
  }

  /**
   * Export interview data for analysis
   */
  exportInterviewData(): {
    session: InterviewSession
    conversationHistory: ConversationEntry[]
    caliberMetrics: CaliberMetrics
    questionQueueStatus: any
    agentThinking: Record<string, any>
  } {
    return {
      session: this.sharedContext.session,
      conversationHistory: this.sharedContext.conversationHistory,
      caliberMetrics: this.sharedContext.caliberMetrics,
      questionQueueStatus: this.questionManager.getQueueStatus(),
      agentThinking: this.getCurrentAgentThinking()
    }
  }
}