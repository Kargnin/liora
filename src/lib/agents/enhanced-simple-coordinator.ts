/**
 * Enhanced Simple LangGraph Multi-Agent Coordinator
 * Follows LangGraph best practices with minimal complexity
 * Includes integrated memory and simplified workflow
 */

import { StateGraph, END, START, Annotation } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
// Simple in-memory storage for demo purposes
interface ConversationMemory {
  id: string
  question: string
  answer: string
  timestamp: Date
  metadata: Record<string, unknown>
}

// Simple state annotation following LangGraph best practices
const InterviewStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => []
  }),
  currentQuestion: Annotation<string>({
    reducer: (current, update) => update || current,
    default: () => ""
  }),
  founderResponse: Annotation<string>({
    reducer: (current, update) => update || current,
    default: () => ""
  }),
  conversationHistory: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => []
  }),
  isComplete: Annotation<boolean>({
    reducer: (current, update) => update !== undefined ? update : current,
    default: () => false
  }),
  questionCount: Annotation<number>({
    reducer: (current, update) => update !== undefined ? update : current,
    default: () => 0
  })
})

type InterviewState = typeof InterviewStateAnnotation.State

export class EnhancedSimpleCoordinator {
  private workflow: StateGraph<typeof InterviewStateAnnotation>
  private memoryStore: ConversationMemory[] = []
  private maxQuestions = 5 // Keep it simple for demo

  constructor() {
    // Build workflow
    this.workflow = this.buildWorkflow()
  }

  /**
   * Build simplified workflow following LangGraph best practices
   */
  private buildWorkflow(): StateGraph<typeof InterviewStateAnnotation> {
    const workflow = new StateGraph(InterviewStateAnnotation)

    // Add nodes
    workflow.addNode('generate_question', this.generateQuestionNode.bind(this))
    workflow.addNode('process_response', this.processResponseNode.bind(this))
    workflow.addNode('store_memory', this.storeMemoryNode.bind(this))
    workflow.addNode('check_completion', this.checkCompletionNode.bind(this))

    // Define edges
    workflow.addEdge(START, 'generate_question')
    workflow.addEdge('generate_question', 'process_response')
    workflow.addEdge('process_response', 'store_memory')
    workflow.addEdge('store_memory', 'check_completion')

    // Conditional edge for completion
    workflow.addConditionalEdges(
      'check_completion',
      (state: InterviewState) => state.isComplete ? 'end' : 'continue',
      {
        continue: 'generate_question',
        end: END
      }
    )

    return workflow
  }

  /**
   * Generate Question Node - Creates contextual questions using memory
   */
  private async generateQuestionNode(state: InterviewState): Promise<Partial<InterviewState>> {
    console.log('🤖 Generating question...')
    
    try {
      // Get memory context for better questions
      let memoryContext = ""
      if (this.memoryStore.length > 0) {
        const recentMemories = this.memoryStore.slice(-2)
        memoryContext = recentMemories.map(m => `${m.question} ${m.answer}`).join(' ')
      }

      // Generate contextual question based on conversation stage
      const questionCount = state.questionCount
      let question = ""

      if (questionCount === 0) {
        question = "Hi! I'm excited to learn about your startup. Can you start by telling me what problem you're solving and who your target customers are?"
      } else if (questionCount === 1) {
        question = memoryContext 
          ? `Based on what you've shared, I'd like to understand your business model better. How do you plan to monetize this solution?`
          : "That's interesting! How do you plan to make money from this solution?"
      } else if (questionCount === 2) {
        question = "What's your competitive landscape like? Who are your main competitors and what makes you different?"
      } else if (questionCount === 3) {
        question = "Tell me about your team. What's your background and what key roles do you still need to fill?"
      } else {
        question = "What are your biggest challenges right now, and how can investors help you overcome them?"
      }

      console.log(`📝 Generated question: ${question}`)

      const questionMessage = new AIMessage(question)

      return {
        currentQuestion: question,
        messages: [questionMessage],
        questionCount: questionCount + 1
      }

    } catch (error) {
      console.error('❌ Question generation error:', error)
      
      const fallbackQuestion = "Can you tell me more about your startup?"
      const questionMessage = new AIMessage(fallbackQuestion)

      return {
        currentQuestion: fallbackQuestion,
        messages: [questionMessage],
        questionCount: state.questionCount + 1
      }
    }
  }

  /**
   * Process Response Node - Handles founder responses
   */
  private async processResponseNode(state: InterviewState): Promise<Partial<InterviewState>> {
    console.log('🔄 Processing response...')

    // In a real implementation, this would wait for user input
    // For demo purposes, we'll simulate waiting
    if (!state.founderResponse) {
      console.log('⏳ Waiting for founder response...')
      return {} // No state update, waiting for response
    }

    console.log(`💬 Processing response: ${state.founderResponse}`)

    // Simple response analysis
    const responseLength = state.founderResponse.length
    const hasNumbers = /\d/.test(state.founderResponse)
    const hasKeywords = /startup|company|business|customer|revenue|team|product/i.test(state.founderResponse)

    console.log(`📊 Response analysis: length=${responseLength}, hasNumbers=${hasNumbers}, hasKeywords=${hasKeywords}`)

    const responseMessage = new HumanMessage(state.founderResponse)

    return {
      messages: [responseMessage],
      conversationHistory: [`Q: ${state.currentQuestion}`, `A: ${state.founderResponse}`]
    }
  }

  /**
   * Store Memory Node - Saves conversation to vector memory
   */
  private async storeMemoryNode(state: InterviewState): Promise<Partial<InterviewState>> {
    console.log('💾 Storing conversation in memory...')

    try {
      if (state.currentQuestion && state.founderResponse) {
        const memory: ConversationMemory = {
          id: `conv-${Date.now()}`,
          question: state.currentQuestion,
          answer: state.founderResponse,
          timestamp: new Date(),
          metadata: {
            questionNumber: state.questionCount,
            responseLength: state.founderResponse.length
          }
        }

        this.memoryStore.push(memory)
        console.log('✅ Conversation stored in memory')
      }

      return {}

    } catch (error) {
      console.error('❌ Memory storage error:', error)
      return {}
    }
  }

  /**
   * Check Completion Node - Determines if interview should continue
   */
  private async checkCompletionNode(state: InterviewState): Promise<Partial<InterviewState>> {
    console.log('🏁 Checking completion status...')

    const shouldComplete = state.questionCount >= this.maxQuestions
    
    console.log(`📈 Progress: ${state.questionCount}/${this.maxQuestions} questions`)
    console.log(`🎯 Should complete: ${shouldComplete}`)

    if (shouldComplete) {
      const completionMessage = new AIMessage("Thank you for sharing! That gives me a great overview of your startup. I'll compile this information for our investment committee.")
      
      return {
        isComplete: true,
        messages: [completionMessage]
      }
    }

    return {
      isComplete: false
    }
  }

  /**
   * Execute the interview workflow
   */
  async executeWorkflow(initialState?: Partial<InterviewState>): Promise<InterviewState> {
    console.log('🚀 Starting interview workflow...')
    
    const compiledWorkflow = this.workflow.compile()
    
    const defaultState: InterviewState = {
      messages: [],
      currentQuestion: "",
      founderResponse: "",
      conversationHistory: [],
      isComplete: false,
      questionCount: 0,
      ...initialState
    }

    try {
      console.log('📊 Initial state:', JSON.stringify(defaultState, null, 2))
      const result = await compiledWorkflow.invoke(defaultState)
      console.log('📊 Final result:', JSON.stringify(result, null, 2))
      console.log('✅ Workflow completed successfully')
      return result
    } catch (error) {
      console.error('❌ Workflow execution error:', error)
      throw error
    }
  }

  /**
   * Process founder response and continue workflow
   */
  async processFounderResponse(response: string, currentState: InterviewState): Promise<InterviewState> {
    console.log(`📨 Processing founder response: "${response}"`)
    
    const updatedState: InterviewState = {
      ...currentState,
      founderResponse: response
    }

    // Clear the response after processing to prepare for next question
    const result = await this.executeWorkflow(updatedState)
    
    return {
      ...result,
      founderResponse: "" // Clear for next iteration
    }
  }

  /**
   * Get memory statistics for monitoring
   */
  async getMemoryStats(): Promise<{
    totalConversations: number
    memoryHealth: 'good' | 'fair' | 'poor'
  }> {
    return {
      totalConversations: this.memoryStore.length,
      memoryHealth: 'good'
    }
  }

  /**
   * Clear memory for testing
   */
  async clearMemory(): Promise<void> {
    this.memoryStore = []
    console.log('🧹 Memory cleared')
  }

  /**
   * Get current workflow status
   */
  getWorkflowStatus(state: InterviewState): {
    currentStep: string
    progress: number
    questionsRemaining: number
  } {
    return {
      currentStep: state.isComplete ? 'completed' : 'active',
      progress: (state.questionCount / this.maxQuestions) * 100,
      questionsRemaining: Math.max(0, this.maxQuestions - state.questionCount)
    }
  }
}