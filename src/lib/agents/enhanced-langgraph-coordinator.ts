/**
 * Enhanced LangGraph Multi-Agent Coordinator with Integrated Memory
 * Simplified memory integration using MemoryVectorStore from LangChain
 */

import { StateGraph, END, START } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Document } from "@langchain/core/documents"
import { 
  SharedContext, 
  InterviewQuestion, 
  CaliberMetrics, 
  ConversationEntry,
  AgentThinking 
} from '@/types/interview'
import { InterviewerAgentImpl } from './interviewer-agent'
import { AnalystAgentImpl } from './analyst-agent'
import { RAGAgentImpl } from './rag-agent'

// Enhanced State with Integrated Memory
interface EnhancedInterviewState {
  messages: BaseMessage[]
  sharedContext: SharedContext
  currentQuestion?: InterviewQuestion
  founderResponse?: string
  caliberMetrics?: CaliberMetrics
  agentThinking: Record<string, AgentThinking>
  nextAction: string
  isComplete: boolean
  // Memory integration
  memoryStore: MemoryVectorStore
  conversationHistory: ConversationEntry[]
}

export class EnhancedLangGraphCoordinator {
  private interviewer: InterviewerAgentImpl
  private analyst: AnalystAgentImpl
  private ragAgent: RAGAgentImpl
  private workflow: StateGraph<EnhancedInterviewState>
  private memoryStore: MemoryVectorStore

  constructor(initialContext: SharedContext) {
    // Initialize agents
    this.interviewer = new InterviewerAgentImpl()
    this.analyst = new AnalystAgentImpl()
    this.ragAgent = new RAGAgentImpl()

    // Initialize memory store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || "dummy-key"
    })
    this.memoryStore = new MemoryVectorStore(embeddings)

    // Build enhanced workflow
    this.workflow = this.buildEnhancedWorkflow(initialContext)
  }

  /**
   * Build enhanced workflow with integrated memory
   */
  private buildEnhancedWorkflow(initialContext: SharedContext): StateGraph<EnhancedInterviewState> {
    const workflow = new StateGraph<EnhancedInterviewState>({
      channels: {
        messages: {
          reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
          default: () => []
        },
        sharedContext: {
          reducer: (x: SharedContext, y: SharedContext) => ({ ...x, ...y }),
          default: () => initialContext
        },
        currentQuestion: {
          reducer: (x: InterviewQuestion | undefined, y: InterviewQuestion | undefined) => y || x,
          default: () => undefined
        },
        founderResponse: {
          reducer: (x: string | undefined, y: string | undefined) => y || x,
          default: () => undefined
        },
        caliberMetrics: {
          reducer: (x: CaliberMetrics | undefined, y: CaliberMetrics | undefined) => y || x,
          default: () => undefined
        },
        agentThinking: {
          reducer: (x: Record<string, AgentThinking>, y: Record<string, AgentThinking>) => ({ ...x, ...y }),
          default: () => ({})
        },
        nextAction: {
          reducer: (x: string, y: string) => y || x,
          default: () => 'memory_retrieval'
        },
        isComplete: {
          reducer: (x: boolean, y: boolean) => y !== undefined ? y : x,
          default: () => false
        },
        memoryStore: {
          reducer: (x: MemoryVectorStore, y: MemoryVectorStore) => y || x,
          default: () => this.memoryStore
        },
        conversationHistory: {
          reducer: (x: ConversationEntry[], y: ConversationEntry[]) => y || x,
          default: () => []
        }
      }
    })

    // Add nodes with memory integration
    workflow.addNode('memory_retrieval', this.memoryRetrievalNode.bind(this))
    workflow.addNode('context_enrichment', this.contextEnrichmentNode.bind(this))
    workflow.addNode('question_generation', this.questionGenerationNode.bind(this))
    workflow.addNode('response_processing', this.responseProcessingNode.bind(this))
    workflow.addNode('memory_storage', this.memoryStorageNode.bind(this))
    workflow.addNode('completion_check', this.completionCheckNode.bind(this))

    // Define workflow edges
    workflow.addEdge(START, 'memory_retrieval')
    workflow.addEdge('memory_retrieval', 'context_enrichment')
    workflow.addEdge('context_enrichment', 'question_generation')
    workflow.addEdge('question_generation', 'response_processing')
    workflow.addEdge('response_processing', 'memory_storage')
    workflow.addEdge('memory_storage', 'completion_check')

    // Conditional edges
    workflow.addConditionalEdges(
      'completion_check',
      this.shouldContinue.bind(this),
      {
        continue: 'memory_retrieval',
        end: END
      }
    )

    return workflow
  }

  /**
   * Memory Retrieval Node - Get relevant context from memory
   */
  private async memoryRetrievalNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Retrieving relevant conversation context from memory',
      reasoning: 'Using semantic search to find relevant past conversations',
      dataFetched: {},
      nextAction: 'search_memory',
      confidence: 0.9
    }

    try {
      const currentTopic = state.sharedContext.session.currentTopic.name
      let relevantContext: Document[] = []

      // Search memory if we have previous conversations
      if (state.conversationHistory.length > 0) {
        relevantContext = await state.memoryStore.similaritySearch(currentTopic, 5)
      }

      thinking.dataFetched = { 
        relevantContext: relevantContext.map(doc => doc.pageContent),
        searchQuery: currentTopic
      }
      thinking.nextAction = 'context_enrichment'

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'context_enrichment'
      }

    } catch (error) {
      console.error('Memory retrieval error:', error)
      thinking.reasoning = 'Memory search failed, proceeding without context'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'context_enrichment'
      }
    }
  }

  /**
   * Context Enrichment Node - Combine memory with RAG data
   */
  private async contextEnrichmentNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Enriching context with RAG data and memory',
      reasoning: 'Combining retrieved memory with fresh RAG data for comprehensive context',
      dataFetched: {},
      nextAction: 'fetch_rag_data',
      confidence: 0.85
    }

    try {
      // Get RAG data
      const founderData = await this.ragAgent.retrieveFounderData(
        state.sharedContext.session.founderId
      )

      const publicData = await this.ragAgent.retrievePublicData(
        state.sharedContext.companyData.name,
        state.sharedContext.companyData.sector
      )

      // Get memory context
      const memoryContext = await this.getMemoryContext(state.memoryStore, state.sharedContext.session.currentTopic.name)

      const enrichedContext: Partial<SharedContext> = {
        ragData: {
          founderData,
          publicData,
          relevanceScore: 0.8,
          timestamp: new Date()
        },
        memoryContext
      }

      thinking.dataFetched = { founderData, publicData, memoryContext }
      thinking.nextAction = 'question_generation'

      return {
        sharedContext: { ...state.sharedContext, ...enrichedContext },
        agentThinking: { ...state.agentThinking, contextEnricher: thinking },
        nextAction: 'question_generation'
      }

    } catch (error) {
      console.error('Context enrichment error:', error)
      thinking.reasoning = 'Context enrichment failed, using available data'
      thinking.confidence = 0.4

      return {
        agentThinking: { ...state.agentThinking, contextEnricher: thinking },
        nextAction: 'question_generation'
      }
    }
  }

  /**
   * Question Generation Node - Generate contextual questions
   */
  private async questionGenerationNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Generating contextual interview question',
      reasoning: 'Using enriched context (memory + RAG) to create relevant question',
      dataFetched: {},
      nextAction: 'generate_question',
      confidence: 0.9
    }

    try {
      const question = await this.interviewer.generateQuestion(state.sharedContext)

      // Enhance with context if available
      let contextualQuestion = question
      if (state.sharedContext.ragData && state.sharedContext.memoryContext) {
        const enhanced = await this.ragAgent.injectContext(question.text, state.sharedContext.ragData)
        
        // Add memory context to the question
        const memoryInsights = state.sharedContext.memoryContext.keyInsights.slice(0, 3)
        const contextNote = memoryInsights.length > 0 
          ? `\n\nContext from our conversation: ${memoryInsights.join(', ')}`
          : ''

        contextualQuestion = {
          ...question,
          text: enhanced.enhancedQuestion + contextNote,
          contextData: {
            ragDataUsed: true,
            memoryContextUsed: true,
            relevanceScore: enhanced.relevanceScore
          }
        }
      }

      thinking.dataFetched = { question: contextualQuestion }
      thinking.nextAction = 'wait_for_response'

      const questionMessage = new AIMessage(contextualQuestion.text)

      return {
        currentQuestion: contextualQuestion,
        messages: [questionMessage],
        agentThinking: { ...state.agentThinking, interviewer: thinking },
        nextAction: 'response_processing'
      }

    } catch (error) {
      console.error('Question generation error:', error)
      thinking.reasoning = 'Question generation failed, using fallback'
      thinking.confidence = 0.2

      const fallbackQuestion: InterviewQuestion = {
        id: 'fallback',
        text: 'Can you tell me more about your company?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: []
      }

      return {
        currentQuestion: fallbackQuestion,
        messages: [new AIMessage(fallbackQuestion.text)],
        agentThinking: { ...state.agentThinking, interviewer: thinking },
        nextAction: 'response_processing'
      }
    }
  }

  /**
   * Response Processing Node - Analyze and evaluate response
   */
  private async responseProcessingNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Processing founder response',
      reasoning: 'Analyzing response quality and extracting insights',
      dataFetched: {},
      nextAction: 'analyze_response',
      confidence: 0.85
    }

    // Wait for founder response
    if (!state.founderResponse) {
      thinking.reasoning = 'Waiting for founder response'
      thinking.nextAction = 'wait_for_response'
      
      return {
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'response_processing'
      }
    }

    try {
      // Analyze response
      const caliberMetrics = await this.analyst.assessCaliberMetrics(
        state.founderResponse,
        state.sharedContext
      )

      const responseEvaluation = await this.interviewer.evaluateResponse(state.founderResponse)

      thinking.dataFetched = { caliberMetrics, responseEvaluation }
      thinking.nextAction = 'memory_storage'

      const responseMessage = new HumanMessage(state.founderResponse)

      return {
        caliberMetrics,
        messages: [responseMessage],
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'memory_storage'
      }

    } catch (error) {
      console.error('Response processing error:', error)
      thinking.reasoning = 'Response analysis failed, proceeding with basic data'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, analyst: thinking },
        nextAction: 'memory_storage'
      }
    }
  }

  /**
   * Memory Storage Node - Store conversation in memory
   */
  private async memoryStorageNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Storing conversation in memory',
      reasoning: 'Adding new conversation to vector memory for future retrieval',
      dataFetched: {},
      nextAction: 'store_conversation',
      confidence: 0.9
    }

    try {
      if (state.currentQuestion && state.founderResponse) {
        const conversationEntry: ConversationEntry = {
          id: `${Date.now()}-${Math.random()}`,
          question: state.currentQuestion.text,
          response: state.founderResponse,
          timestamp: new Date(),
          caliberMetrics: state.caliberMetrics,
          insights: state.caliberMetrics ? [
            `Communication: ${state.caliberMetrics.categories.communication.score}/100`,
            `Business Acumen: ${state.caliberMetrics.categories.businessAcumen.score}/100`
          ] : []
        }

        // Store in memory vector store
        const document = new Document({
          pageContent: `Question: ${conversationEntry.question}\nResponse: ${conversationEntry.response}`,
          metadata: {
            entryId: conversationEntry.id,
            timestamp: conversationEntry.timestamp.toISOString(),
            topic: state.sharedContext.session.currentTopic.name,
            caliberScore: state.caliberMetrics?.overall || 0,
            insights: conversationEntry.insights
          }
        })

        await state.memoryStore.addDocuments([document])

        // Update conversation history
        const updatedHistory = [...state.conversationHistory, conversationEntry]

        // Update shared context
        const updatedContext: Partial<SharedContext> = {
          conversationHistory: updatedHistory,
          caliberMetrics: state.caliberMetrics || state.sharedContext.caliberMetrics
        }

        thinking.dataFetched = { conversationEntry, documentStored: true }
        thinking.nextAction = 'completion_check'

        return {
          conversationHistory: updatedHistory,
          sharedContext: { ...state.sharedContext, ...updatedContext },
          agentThinking: { ...state.agentThinking, memory: thinking },
          nextAction: 'completion_check'
        }
      }

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'completion_check'
      }

    } catch (error) {
      console.error('Memory storage error:', error)
      thinking.reasoning = 'Memory storage failed, proceeding anyway'
      thinking.confidence = 0.4

      return {
        agentThinking: { ...state.agentThinking, memory: thinking },
        nextAction: 'completion_check'
      }
    }
  }

  /**
   * Completion Check Node - Determine if interview should continue
   */
  private async completionCheckNode(state: EnhancedInterviewState): Promise<Partial<EnhancedInterviewState>> {
    const thinking: AgentThinking = {
      currentTask: 'Checking interview completion status',
      reasoning: 'Evaluating if interview should continue based on time and progress',
      dataFetched: {},
      nextAction: 'check_completion',
      confidence: 0.95
    }

    try {
      const session = state.sharedContext.session
      const elapsed = Date.now() - session.startTime.getTime()
      const timeLimit = session.timeLimit * 60 * 1000
      
      const isTimeUp = elapsed >= timeLimit
      const maxQuestionsReached = session.progress.currentQuestionIndex >= session.progress.totalEstimatedQuestions
      const isManuallyCompleted = session.status === 'completed'

      const shouldComplete = isTimeUp || maxQuestionsReached || isManuallyCompleted

      thinking.dataFetched = { elapsed, timeLimit, isTimeUp, maxQuestionsReached, shouldComplete }

      if (shouldComplete) {
        thinking.nextAction = 'end_interview'
        thinking.reasoning = `Interview complete: ${isTimeUp ? 'time limit' : maxQuestionsReached ? 'max questions' : 'manual completion'}`
      } else {
        thinking.nextAction = 'continue_interview'
        thinking.reasoning = 'Interview continues with memory-enhanced context'
      }

      return {
        isComplete: shouldComplete,
        agentThinking: { ...state.agentThinking, coordinator: thinking },
        nextAction: shouldComplete ? 'end' : 'memory_retrieval'
      }

    } catch (error) {
      console.error('Completion check error:', error)
      thinking.reasoning = 'Error checking completion, defaulting to continue'
      thinking.confidence = 0.3

      return {
        agentThinking: { ...state.agentThinking, coordinator: thinking },
        nextAction: 'memory_retrieval'
      }
    }
  }

  /**
   * Helper: Get memory context from vector store
   */
  private async getMemoryContext(memoryStore: MemoryVectorStore, query: string) {
    try {
      const results = await memoryStore.similaritySearch(query, 3)
      const entries = results.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata
      }))

      const keyInsights = results.flatMap(doc => doc.metadata.insights || [])
      const summary = results.length > 0 
        ? `Previous discussions about ${query}: ${results.length} relevant exchanges found`
        : 'No previous context available'

      return {
        entries: [],
        summary,
        keyInsights: Array.from(new Set(keyInsights)).slice(0, 5),
        totalEntries: results.length,
        recentExchanges: entries.map(e => e.content).join('\n\n')
      }
    } catch (error) {
      console.error('Memory context retrieval error:', error)
      return {
        entries: [],
        summary: '',
        keyInsights: [],
        totalEntries: 0,
        recentExchanges: ''
      }
    }
  }

  /**
   * Conditional edge function
   */
  private shouldContinue(state: EnhancedInterviewState): string {
    return state.isComplete ? 'end' : 'continue'
  }

  /**
   * Execute the enhanced workflow
   */
  async executeWorkflow(initialState?: Partial<EnhancedInterviewState>): Promise<EnhancedInterviewState> {
    const compiledWorkflow = this.workflow.compile()
    
    const defaultState: EnhancedInterviewState = {
      messages: [],
      sharedContext: {} as SharedContext,
      agentThinking: {},
      nextAction: 'memory_retrieval',
      isComplete: false,
      memoryStore: this.memoryStore,
      conversationHistory: [],
      ...initialState
    }

    try {
      const result = await compiledWorkflow.invoke(defaultState)
      return result
    } catch (error) {
      console.error('Enhanced workflow execution error:', error)
      throw error
    }
  }

  /**
   * Process founder response with memory context
   */
  async processFounderResponse(response: string, currentState: EnhancedInterviewState): Promise<EnhancedInterviewState> {
    const updatedState: EnhancedInterviewState = {
      ...currentState,
      founderResponse: response,
      nextAction: 'response_processing'
    }

    return this.executeWorkflow(updatedState)
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(): Promise<{
    totalDocuments: number
    recentConversations: number
    memoryHealth: 'good' | 'fair' | 'poor'
  }> {
    try {
      // Simple memory health check
      const testSearch = await this.memoryStore.similaritySearch('test', 1)
      
      return {
        totalDocuments: testSearch.length, // This is a simplified metric
        recentConversations: testSearch.length,
        memoryHealth: 'good'
      }
    } catch (error) {
      return {
        totalDocuments: 0,
        recentConversations: 0,
        memoryHealth: 'poor'
      }
    }
  }

  /**
   * Clear memory (for testing or reset)
   */
  async clearMemory(): Promise<void> {
    // Create new memory store instance
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || "dummy-key"
    })
    this.memoryStore = new MemoryVectorStore(embeddings)
  }
}