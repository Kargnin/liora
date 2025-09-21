/**
 * LangGraph Multi-Agent Coordinator
 * Integrates the multi-agent system with LangGraph for workflow orchestration
 */

import { StateGraph, END, START } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import {
  SharedContext,
  InterviewQuestion,
  CaliberMetrics,
  ConversationEntry,
  AgentThinking,
} from '@/types/interview'
import { InterviewerAgentImpl } from './interviewer-agent'
import { AnalystAgentImpl } from './analyst-agent'
import { MemoryManagerAgentImpl } from './memory-manager-agent'
import { RAGAgentImpl } from './rag-agent'

// LangGraph State Interface
interface InterviewState {
  messages: BaseMessage[]
  sharedContext: SharedContext
  currentQuestion?: InterviewQuestion
  founderResponse?: string
  caliberMetrics?: CaliberMetrics
  agentThinking: Record<string, AgentThinking>
  nextAction: string
  isComplete: boolean
}

export class LangGraphCoordinator {
  private interviewer: InterviewerAgentImpl
  private analyst: AnalystAgentImpl
  private memoryManager: MemoryManagerAgentImpl
  private ragAgent: RAGAgentImpl
  private workflow: StateGraph<InterviewState>

  constructor(initialContext: SharedContext) {
    // Initialize agents
    this.interviewer = new InterviewerAgentImpl()
    this.analyst = new AnalystAgentImpl()
    this.memoryManager = new MemoryManagerAgentImpl()
    this.ragAgent = new RAGAgentImpl()

    // Build LangGraph workflow
    this.workflow = this.buildWorkflow(initialContext)
  }

  /**
   * Build the LangGraph workflow for interview orchestration
   */
  private buildWorkflow(
    initialContext: SharedContext
  ): StateGraph<InterviewState> {
    const workflow = new StateGraph<InterviewState>({
      channels: {
        messages: {
          reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
          default: () => [],
        },
        sharedContext: {
          reducer: (x: SharedContext, y: SharedContext) => ({ ...x, ...y }),
          default: () => initialContext,
        },
        currentQuestion: {
          reducer: (
            x: InterviewQuestion | undefined,
            y: InterviewQuestion | undefined
          ) => y || x,
          default: () => undefined,
        },
        founderResponse: {
          reducer: (x: string | undefined, y: string | undefined) => y || x,
          default: () => undefined,
        },
        caliberMetrics: {
          reducer: (
            x: CaliberMetrics | undefined,
            y: CaliberMetrics | undefined
          ) => y || x,
          default: () => undefined,
        },
        agentThinking: {
          reducer: (
            x: Record<string, AgentThinking>,
            y: Record<string, AgentThinking>
          ) => ({ ...x, ...y }),
          default: () => ({}),
        },
        nextAction: {
          reducer: (x: string, y: string) => y || x,
          default: () => 'rag_retrieval',
        },
        isComplete: {
          reducer: (x: boolean, y: boolean) => (y !== undefined ? y : x),
          default: () => false,
        },
      },
    })

    // Add nodes for each agent
    workflow.addNode('rag_retrieval', this.ragRetrievalNode.bind(this))
    workflow.addNode('memory_context', this.memoryContextNode.bind(this))
    workflow.addNode(
      'question_generation',
      this.questionGenerationNode.bind(this)
    )
    workflow.addNode('response_analysis', this.responseAnalysisNode.bind(this))
    workflow.addNode('memory_storage', this.memoryStorageNode.bind(this))
    workflow.addNode('completion_check', this.completionCheckNode.bind(this))

    // Define workflow edges
    workflow.addEdge(START, 'rag_retrieval')
    workflow.addEdge('rag_retrieval', 'memory_context')
    workflow.addEdge('memory_context', 'question_generation')
    workflow.addEdge('question_generation', 'response_analysis')
    workflow.addEdge('response_analysis', 'memory_storage')
    workflow.addEdge('memory_storage', 'completion_check')

    // Conditional edges for completion
    workflow.addConditionalEdges(
      'completion_check',
      this.shouldContinue.bind(this),
      {
        continue: 'rag_retrieval',
        end: END,
      }
    )

    return workflow
  }

  /**
   * RAG Retrieval Node - Fetch contextual data
   */
  private async ragRetrievalNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Retrieving contextual data for interview',
      reasoning:
        'Need to gather founder and market data to inform question generation',
      dataFetched: {},
      nextAction: 'fetch_founder_data',
      confidence: 0.9,
    }

    try {
      // Retrieve founder data
      const founderData = await this.ragAgent.retrieveFounderData(
        state.sharedContext.session.founderId
      )

      // Retrieve public market data
      const publicData = await this.ragAgent.retrievePublicData(
        state.sharedContext.companyData.name,
        state.sharedContext.companyData.sector
      )

      const updatedContext: Partial<SharedContext> = {
        ragData: {
          founderData,
          publicData,
          relevanceScore: 0.8,
          timestamp: new Date(),
        },
      }

      thinking.dataFetched = { founderData, publicData }
      thinking.nextAction = 'memory_context'

      return {
        sharedContext: { ...state.sharedContext, ...updatedContext },
        agentThinking: { ...state.agentThinking, rag: thinking },
        nextAction: 'memory_context',
      }
    } catch (error) {
      console.error('RAG retrieval error:', error)
      thinking.reasoning =
        'Failed to retrieve data, proceeding with available context'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, rag: thinking },
        nextAction: 'memory_context',
      }
    }
  }

  /**
   * Memory Context Node - Retrieve conversation context
   */
  private async memoryContextNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Retrieving conversation context',
      reasoning:
        'Need to understand previous conversation to maintain continuity',
      dataFetched: {},
      nextAction: 'retrieve_context',
      confidence: 0.85,
    }

    try {
      const memoryContext = await this.memoryManager.retrieveContext(
        state.sharedContext.session.currentTopic.name
      )

      const updatedContext: Partial<SharedContext> = {
        memoryContext,
      }

      thinking.dataFetched = { memoryContext }
      thinking.nextAction = 'question_generation'

      return {
        sharedContext: { ...state.sharedContext, ...updatedContext },
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'question_generation',
      }
    } catch (error) {
      console.error('Memory context error:', error)
      thinking.reasoning =
        'Failed to retrieve memory context, proceeding without history'
      thinking.confidence = 0.4

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'question_generation',
      }
    }
  }

  /**
   * Question Generation Node - Generate contextual interview question
   */
  private async questionGenerationNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Generating contextual interview question',
      reasoning:
        'Using RAG data and memory context to create relevant question',
      dataFetched: {},
      nextAction: 'generate_question',
      confidence: 0.9,
    }

    try {
      const question = await this.interviewer.generateQuestion(
        state.sharedContext
      )

      // Inject context if available
      let contextualQuestion = question
      if (state.sharedContext.ragData) {
        const enhanced = await this.ragAgent.injectContext(
          question.text,
          state.sharedContext.ragData
        )
        contextualQuestion = {
          ...question,
          text: enhanced.enhancedQuestion,
          contextData: {
            ragDataUsed: true,
            relevanceScore: enhanced.relevanceScore,
          },
        }
      }

      thinking.dataFetched = { question: contextualQuestion }
      thinking.nextAction = 'wait_for_response'

      // Add question to messages
      const questionMessage = new AIMessage(contextualQuestion.text)

      return {
        currentQuestion: contextualQuestion,
        messages: [questionMessage],
        agentThinking: { ...state.agentThinking, interviewer: thinking },
        nextAction: 'response_analysis',
      }
    } catch (error) {
      console.error('Question generation error:', error)
      thinking.reasoning = 'Failed to generate question, using fallback'
      thinking.confidence = 0.2

      const fallbackQuestion: InterviewQuestion = {
        id: 'fallback',
        text: 'Can you tell me more about your company?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: [],
      }

      return {
        currentQuestion: fallbackQuestion,
        messages: [new AIMessage(fallbackQuestion.text)],
        agentThinking: { ...state.agentThinking, interviewer: thinking },
        nextAction: 'response_analysis',
      }
    }
  }

  /**
   * Response Analysis Node - Analyze founder's response
   */
  private async responseAnalysisNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Analyzing founder response',
      reasoning: 'Evaluating response quality and assessing founder caliber',
      dataFetched: {},
      nextAction: 'analyze_response',
      confidence: 0.85,
    }

    // Wait for founder response (this would be set by UI)
    if (!state.founderResponse) {
      thinking.reasoning = 'Waiting for founder response'
      thinking.nextAction = 'wait_for_response'

      return {
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'response_analysis', // Stay in this node until response received
      }
    }

    try {
      // Analyze response for caliber metrics
      const caliberMetrics = await this.analyst.assessCaliberMetrics(
        state.founderResponse,
        state.sharedContext
      )

      // Evaluate response quality
      const responseEvaluation = await this.interviewer.evaluateResponse(
        state.founderResponse
      )

      thinking.dataFetched = { caliberMetrics, responseEvaluation }
      thinking.nextAction = 'memory_storage'

      // Add response to messages
      const responseMessage = new HumanMessage(state.founderResponse)

      return {
        caliberMetrics,
        messages: [responseMessage],
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'memory_storage',
      }
    } catch (error) {
      console.error('Response analysis error:', error)
      thinking.reasoning =
        'Failed to analyze response, proceeding with basic metrics'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'memory_storage',
      }
    }
  }

  /**
   * Memory Storage Node - Store conversation in memory
   */
  private async memoryStorageNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Storing conversation in memory',
      reasoning: 'Preserving conversation context for future reference',
      dataFetched: {},
      nextAction: 'store_conversation',
      confidence: 0.9,
    }

    try {
      if (state.currentQuestion && state.founderResponse) {
        const conversationEntry: ConversationEntry = {
          id: `${Date.now()}-${Math.random()}`,
          question: state.currentQuestion.text,
          response: state.founderResponse,
          timestamp: new Date(),
          caliberMetrics: state.caliberMetrics,
          insights: [],
        }

        await this.memoryManager.storeConversation(conversationEntry)

        // Update shared context with new conversation
        const updatedContext: Partial<SharedContext> = {
          conversationHistory: [
            ...state.sharedContext.conversationHistory,
            conversationEntry,
          ],
          caliberMetrics:
            state.caliberMetrics || state.sharedContext.caliberMetrics,
        }

        thinking.dataFetched = { conversationEntry }
        thinking.nextAction = 'completion_check'

        return {
          sharedContext: { ...state.sharedContext, ...updatedContext },
          agentThinking: { ...state.agentThinking, memory: thinking },
          nextAction: 'completion_check',
        }
      }

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'completion_check',
      }
    } catch (error) {
      console.error('Memory storage error:', error)
      thinking.reasoning = 'Failed to store conversation, proceeding anyway'
      thinking.confidence = 0.4

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'completion_check',
      }
    }
  }

  /**
   * Completion Check Node - Determine if interview should continue
   */
  private async completionCheckNode(
    state: InterviewState
  ): Promise<Partial<InterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Checking interview completion status',
      reasoning: 'Evaluating if interview should continue or end',
      dataFetched: {},
      nextAction: 'check_completion',
      confidence: 0.95,
    }

    try {
      const session = state.sharedContext.session

      // Check time limit
      const elapsed = Date.now() - session.startTime.getTime()
      const timeLimit = session.timeLimit * 60 * 1000 // Convert to ms

      const isTimeUp = elapsed >= timeLimit
      const maxQuestionsReached =
        session.progress.currentQuestionIndex >=
        session.progress.totalEstimatedQuestions
      const isManuallyCompleted = session.status === 'completed'

      const shouldComplete =
        isTimeUp || maxQuestionsReached || isManuallyCompleted

      thinking.dataFetched = {
        elapsed,
        timeLimit,
        isTimeUp,
        maxQuestionsReached,
        shouldComplete,
      }

      if (shouldComplete) {
        thinking.nextAction = 'end_interview'
        thinking.reasoning = `Interview complete: ${isTimeUp ? 'time limit reached' : maxQuestionsReached ? 'max questions reached' : 'manually completed'}`
      } else {
        thinking.nextAction = 'continue_interview'
        thinking.reasoning = 'Interview should continue with next question'
      }

      return {
        isComplete: shouldComplete,
        agentThinking: { ...state.agentThinking, coordinator: thinking },
        nextAction: shouldComplete ? 'end' : 'rag_retrieval',
      }
    } catch (error) {
      console.error('Completion check error:', error)
      thinking.reasoning = 'Error checking completion, defaulting to continue'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, coordinator: thinking },
        nextAction: 'rag_retrieval',
      }
    }
  }

  /**
   * Conditional edge function to determine workflow continuation
   */
  private shouldContinue(state: InterviewState): string {
    return state.isComplete ? 'end' : 'continue'
  }

  /**
   * Execute the interview workflow
   */
  async executeWorkflow(
    initialState?: Partial<InterviewState>
  ): Promise<InterviewState> {
    const compiledWorkflow = this.workflow.compile()

    const defaultState: InterviewState = {
      messages: [],
      sharedContext: {} as SharedContext, // Will be set by constructor
      agentThinking: {},
      nextAction: 'rag_retrieval',
      isComplete: false,
      ...initialState,
    }

    try {
      const result = await compiledWorkflow.invoke(defaultState)
      return result
    } catch (error) {
      console.error('Workflow execution error:', error)
      throw error
    }
  }

  /**
   * Process founder response and continue workflow
   */
  async processFounderResponse(
    response: string,
    currentState: InterviewState
  ): Promise<InterviewState> {
    const updatedState: InterviewState = {
      ...currentState,
      founderResponse: response,
      nextAction: 'response_analysis',
    }

    return this.executeWorkflow(updatedState)
  }

  /**
   * Get current agent thinking for demo purposes
   */
  getCurrentAgentThinking(
    state: InterviewState
  ): Record<string, AgentThinking> {
    return state.agentThinking
  }

  /**
   * Get workflow state for monitoring
   */
  getWorkflowState(state: InterviewState): {
    currentStep: string
    progress: number
    agentStatuses: Record<string, string>
  } {
    const totalSteps = 6 // Number of nodes in workflow
    const completedSteps = Object.keys(state.agentThinking).length

    return {
      currentStep: state.nextAction,
      progress: (completedSteps / totalSteps) * 100,
      agentStatuses: {
        interviewer: this.interviewer.status,
        analyst: this.analyst.status,
        memory: this.memoryManager.status,
        rag: this.ragAgent.status,
      },
    }
  }

  /**
   * Pause the workflow
   */
  pauseWorkflow(state: InterviewState): InterviewState {
    return {
      ...state,
      sharedContext: {
        ...state.sharedContext,
        session: {
          ...state.sharedContext.session,
          status: 'paused',
        },
      },
    }
  }

  /**
   * Resume the workflow
   */
  resumeWorkflow(state: InterviewState): InterviewState {
    return {
      ...state,
      sharedContext: {
        ...state.sharedContext,
        session: {
          ...state.sharedContext.session,
          status: 'active',
        },
      },
    }
  }
}
