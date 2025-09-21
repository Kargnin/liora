/**
 * LangSmith Integration for Agent State Monitoring
 * Demo purposes - tracks agent thinking and RAG retrieval
 */

import { Client } from 'langsmith'
import { 
  AgentThinking, 
  AgentStateDemo, 
  CaliberMetrics,
  ConversationEntry 
} from '@/types/interview'
import { INTERVIEW_ENV } from '@/lib/interview/config'

export class LangSmithMonitor {
  private client: Client | null = null
  private currentTrace: any = null
  private isEnabled: boolean = false

  constructor() {
    // Only initialize if LangSmith is configured
    if (INTERVIEW_ENV.LANGSMITH_API_KEY && INTERVIEW_ENV.ENABLE_DEMO_MODE) {
      try {
        this.client = new Client({
          apiKey: INTERVIEW_ENV.LANGSMITH_API_KEY,
          apiUrl: INTERVIEW_ENV.LANGSMITH_ENDPOINT,
        })
        this.isEnabled = true
        console.log('LangSmith monitoring enabled for demo')
      } catch (error) {
        console.warn('LangSmith initialization failed:', error)
        this.isEnabled = false
      }
    } else {
      console.log('LangSmith monitoring disabled (missing config or demo mode off)')
    }
  }

  /**
   * Start a new trace session for the interview
   */
  async startTrace(sessionId: string, founderId: string): Promise<void> {
    if (!this.isEnabled || !this.client) return

    try {
      this.currentTrace = await this.client.createRun({
        name: `AI Interview Session`,
        runType: 'chain',
        inputs: {
          sessionId,
          founderId,
          timestamp: new Date().toISOString(),
          type: 'ai-interview'
        },
        projectName: INTERVIEW_ENV.LANGSMITH_PROJECT,
        tags: ['ai-interview', 'demo', 'multi-agent']
      })

      console.log('LangSmith trace started:', this.currentTrace?.id)
    } catch (error) {
      console.error('Failed to start LangSmith trace:', error)
    }
  }

  /**
   * Log agent thinking process for demo transparency
   */
  async logAgentThinking(agentType: string, thinking: AgentThinking): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.createRun({
        name: `${agentType}_thinking`,
        runType: 'llm',
        inputs: {
          agent: agentType,
          currentTask: thinking.currentTask,
          reasoning: thinking.reasoning,
          confidence: thinking.confidence
        },
        outputs: {
          nextAction: thinking.nextAction,
          dataFetched: thinking.dataFetched
        },
        parentRunId: this.currentTrace.id,
        tags: ['agent-thinking', agentType, 'demo'],
        extra: {
          metadata: {
            agentType,
            timestamp: new Date().toISOString(),
            thinkingProcess: thinking
          }
        }
      })
    } catch (error) {
      console.error('Failed to log agent thinking:', error)
    }
  }

  /**
   * Log RAG data retrieval for demo visualization
   */
  async logRAGRetrieval(
    query: string, 
    results: any[], 
    agentType: string = 'rag'
  ): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.createRun({
        name: 'rag_retrieval',
        runType: 'retriever',
        inputs: {
          query,
          agentType,
          timestamp: new Date().toISOString()
        },
        outputs: {
          resultsCount: results.length,
          results: results.slice(0, 5), // Log first 5 results for demo
          relevanceScores: results.map(r => r.relevanceScore || 0.8)
        },
        parentRunId: this.currentTrace.id,
        tags: ['rag-retrieval', 'data-fetching', 'demo'],
        extra: {
          metadata: {
            queryType: this.classifyQuery(query),
            dataSource: 'backend-api',
            retrievalMethod: 'semantic-search'
          }
        }
      })
    } catch (error) {
      console.error('Failed to log RAG retrieval:', error)
    }
  }

  /**
   * Log caliber assessment for demo insights
   */
  async logCaliberAssessment(
    assessment: CaliberMetrics, 
    response: string,
    questionContext: string
  ): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.createRun({
        name: 'caliber_assessment',
        runType: 'llm',
        inputs: {
          founderResponse: response,
          questionContext,
          timestamp: new Date().toISOString()
        },
        outputs: {
          overallScore: assessment.overall,
          categoryScores: assessment.categories,
          redFlagsCount: assessment.redFlags.length,
          strengthsCount: assessment.strengths.length
        },
        parentRunId: this.currentTrace.id,
        tags: ['caliber-assessment', 'analysis', 'demo'],
        extra: {
          metadata: {
            assessmentType: 'real-time',
            redFlags: assessment.redFlags.map(rf => ({
              type: rf.type,
              severity: rf.severity,
              description: rf.description
            })),
            strengths: assessment.strengths.map(s => ({
              category: s.category,
              impact: s.impact,
              description: s.description
            }))
          }
        }
      })
    } catch (error) {
      console.error('Failed to log caliber assessment:', error)
    }
  }

  /**
   * Log question generation process
   */
  async logQuestionGeneration(
    context: any,
    generatedQuestion: string,
    questionType: string
  ): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.createRun({
        name: 'question_generation',
        runType: 'llm',
        inputs: {
          contextData: {
            currentTopic: context.currentTopic,
            conversationHistory: context.conversationHistory?.length || 0,
            caliberMetrics: context.caliberMetrics?.overall || 0
          },
          questionType,
          timestamp: new Date().toISOString()
        },
        outputs: {
          generatedQuestion,
          questionCategory: questionType,
          contextUsed: Object.keys(context)
        },
        parentRunId: this.currentTrace.id,
        tags: ['question-generation', 'interviewer-agent', 'demo'],
        extra: {
          metadata: {
            questionLength: generatedQuestion.length,
            contextSources: this.identifyContextSources(context),
            investorPersona: 'Alex Chen - VC Partner'
          }
        }
      })
    } catch (error) {
      console.error('Failed to log question generation:', error)
    }
  }

  /**
   * Log conversation flow and topic transitions
   */
  async logTopicTransition(
    fromTopic: string,
    toTopic: string,
    reason: string,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.createRun({
        name: 'topic_transition',
        runType: 'chain',
        inputs: {
          fromTopic,
          toTopic,
          transitionReason: reason,
          lastResponse: conversationEntry.response,
          timestamp: new Date().toISOString()
        },
        outputs: {
          transitionExecuted: true,
          newTopicContext: toTopic,
          continuityMaintained: true
        },
        parentRunId: this.currentTrace.id,
        tags: ['topic-transition', 'conversation-flow', 'demo'],
        extra: {
          metadata: {
            conversationLength: conversationEntry.response.length,
            transitionTrigger: reason,
            memoryContextUsed: true
          }
        }
      })
    } catch (error) {
      console.error('Failed to log topic transition:', error)
    }
  }

  /**
   * End the current trace session
   */
  async endTrace(sessionData: any): Promise<void> {
    if (!this.isEnabled || !this.client || !this.currentTrace) return

    try {
      await this.client.updateRun(this.currentTrace.id, {
        outputs: {
          sessionCompleted: true,
          totalQuestions: sessionData.totalQuestions || 0,
          finalCaliberScore: sessionData.finalCaliberScore || 0,
          interviewDuration: sessionData.duration || 0,
          topicsCovered: sessionData.topicsCovered || []
        },
        endTime: new Date().toISOString(),
        extra: {
          metadata: {
            completionReason: sessionData.completionReason || 'time-limit',
            dataExported: true,
            demoMode: true
          }
        }
      })

      console.log('LangSmith trace completed:', this.currentTrace.id)
      this.currentTrace = null
    } catch (error) {
      console.error('Failed to end LangSmith trace:', error)
    }
  }

  /**
   * Get current agent state for demo display
   */
  getCurrentAgentState(): AgentStateDemo | null {
    if (!this.isEnabled) return null

    return {
      currentAgent: 'interviewer', // This would be dynamic in real implementation
      thinking: {
        currentTask: 'Generating contextual question based on founder response',
        reasoning: 'Founder mentioned strong traction metrics. Need to probe deeper into customer acquisition strategy and unit economics.',
        dataFetched: {
          founderProfile: 'Retrieved',
          companyData: 'Retrieved', 
          marketData: 'Retrieved',
          previousResponses: 'Analyzed'
        },
        nextAction: 'Ask follow-up question about customer acquisition cost and payback period',
        confidence: 0.85
      },
      dataBeingFetched: [
        'Market benchmarks for CAC in SaaS',
        'Competitor analysis data',
        'Industry growth metrics'
      ],
      traceUrl: this.currentTrace ? `${INTERVIEW_ENV.LANGSMITH_ENDPOINT}/projects/${INTERVIEW_ENV.LANGSMITH_PROJECT}/runs/${this.currentTrace.id}` : undefined
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * Get trace URL for external viewing
   */
  getTraceUrl(): string | null {
    if (!this.currentTrace) return null
    
    return `${INTERVIEW_ENV.LANGSMITH_ENDPOINT}/projects/${INTERVIEW_ENV.LANGSMITH_PROJECT}/runs/${this.currentTrace.id}`
  }

  /**
   * Classify query type for better logging
   */
  private classifyQuery(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('founder') || lowerQuery.includes('profile')) {
      return 'founder-data'
    } else if (lowerQuery.includes('company') || lowerQuery.includes('business')) {
      return 'company-data'
    } else if (lowerQuery.includes('market') || lowerQuery.includes('industry')) {
      return 'market-data'
    } else if (lowerQuery.includes('competitor') || lowerQuery.includes('competition')) {
      return 'competitive-data'
    } else {
      return 'general-context'
    }
  }

  /**
   * Identify context sources used in question generation
   */
  private identifyContextSources(context: any): string[] {
    const sources: string[] = []
    
    if (context.founderProfile) sources.push('founder-profile')
    if (context.companyData) sources.push('company-data')
    if (context.ragData) sources.push('rag-data')
    if (context.memoryContext) sources.push('conversation-memory')
    if (context.caliberMetrics) sources.push('caliber-assessment')
    
    return sources
  }
}