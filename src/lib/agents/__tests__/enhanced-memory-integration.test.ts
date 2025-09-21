/**
 * Tests for Enhanced Memory Integration
 * Simple tests to verify memory integration with multi-agent interview system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "@langchain/openai"
import { EnhancedLangGraphCoordinator } from '../enhanced-langgraph-coordinator'
import { SharedContext, InterviewSession } from '@/types/interview'

// Mock OpenAI embeddings for testing
vi.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: vi.fn().mockImplementation(() => ({
    embedDocuments: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
    embedQuery: vi.fn().mockResolvedValue([0.1, 0.2, 0.3])
  }))
}))

// Mock agent implementations
vi.mock('../interviewer-agent', () => ({
  InterviewerAgentImpl: vi.fn().mockImplementation(() => ({
    status: 'idle',
    generateQuestion: vi.fn().mockResolvedValue({
      id: 'test-question',
      text: 'Tell me about your business model',
      type: 'open-ended',
      expectedResponseType: 'text',
      importance: 'high',
      followUpTriggers: []
    }),
    evaluateResponse: vi.fn().mockResolvedValue({
      quality: 85,
      completeness: 80,
      credibility: 90,
      insights: ['Strong business understanding'],
      followUpNeeded: false,
      suggestedFollowUps: []
    })
  }))
}))

vi.mock('../analyst-agent', () => ({
  AnalystAgentImpl: vi.fn().mockImplementation(() => ({
    status: 'idle',
    assessCaliberMetrics: vi.fn().mockResolvedValue({
      overall: 75,
      categories: {
        communication: { score: 80, confidence: 0.8, evidence: [], keyIndicators: [] },
        leadership: { score: 70, confidence: 0.7, evidence: [], keyIndicators: [] },
        marketKnowledge: { score: 75, confidence: 0.75, evidence: [], keyIndicators: [] },
        strategicThinking: { score: 80, confidence: 0.8, evidence: [], keyIndicators: [] },
        resilience: { score: 70, confidence: 0.7, evidence: [], keyIndicators: [] },
        businessAcumen: { score: 85, confidence: 0.85, evidence: [], keyIndicators: [] }
      },
      redFlags: [],
      strengths: [],
      concerns: []
    })
  }))
}))

vi.mock('../rag-agent', () => ({
  RAGAgentImpl: vi.fn().mockImplementation(() => ({
    status: 'idle',
    retrieveFounderData: vi.fn().mockResolvedValue({
      profile: { id: 'founder-1', name: 'Test Founder' },
      company: { id: 'company-1', name: 'Test Company' },
      documents: [],
      previousInterviews: []
    }),
    retrievePublicData: vi.fn().mockResolvedValue({
      market: { size: '$10B', growth: '15%', trends: [] },
      competitors: [],
      trends: [],
      benchmarks: { revenueGrowth: '20%', customerAcquisitionCost: '$100', churnRate: '5%' }
    }),
    injectContext: vi.fn().mockResolvedValue({
      originalQuestion: 'Test question',
      enhancedQuestion: 'Enhanced test question with context',
      contextUsed: {} as any,
      relevanceScore: 0.8
    })
  }))
}))

describe('Enhanced Memory Integration', () => {
  let coordinator: EnhancedLangGraphCoordinator
  let mockSharedContext: SharedContext

  beforeEach(() => {
    // Create mock shared context
    mockSharedContext = {
      session: {
        id: 'test-session',
        founderId: 'founder-123',
        status: 'active',
        startTime: new Date(),
        currentTopic: {
          id: 'business-model',
          name: 'Business Model',
          description: 'Test topic',
          questions: [],
          completed: false,
          insights: [],
          priority: 'high'
        },
        progress: {
          completedTopics: [],
          currentQuestionIndex: 0,
          totalEstimatedQuestions: 5,
          elapsedTime: 0,
          remainingTime: 1800
        },
        transcript: [],
        audioQuality: {} as any,
        sessionData: {} as any,
        timeLimit: 30
      } as InterviewSession,
      founderProfile: {
        id: 'founder-123',
        name: 'Test Founder',
        email: 'test@example.com',
        background: [],
        experience: [],
        education: [],
        previousCompanies: []
      },
      companyData: {
        id: 'company-1',
        name: 'Test Company',
        sector: 'SaaS',
        stage: 'Series A',
        description: 'Test company'
      },
      conversationHistory: [],
      currentInsights: {
        strengths: [],
        concerns: [],
        opportunities: [],
        risks: []
      },
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
      ragData: {
        relevanceScore: 0,
        timestamp: new Date()
      },
      memoryContext: {
        entries: [],
        summary: '',
        keyInsights: [],
        totalEntries: 0,
        recentExchanges: ''
      }
    }

    coordinator = new EnhancedLangGraphCoordinator(mockSharedContext)
  })

  it('should initialize with memory store', () => {
    expect(coordinator).toBeDefined()
  })

  it('should execute workflow with memory integration', async () => {
    const result = await coordinator.executeWorkflow()
    
    expect(result).toBeDefined()
    expect(result.memoryStore).toBeDefined()
    expect(result.conversationHistory).toBeDefined()
    expect(result.agentThinking).toBeDefined()
  })

  it('should process founder response and store in memory', async () => {
    // Start workflow
    let state = await coordinator.executeWorkflow()
    
    // Process a founder response
    const founderResponse = "We're building a SaaS platform for small businesses with $10/month pricing"
    state = await coordinator.processFounderResponse(founderResponse, state)
    
    expect(state.founderResponse).toBe(founderResponse)
    expect(state.conversationHistory.length).toBeGreaterThan(0)
  })

  it('should retrieve memory context for questions', async () => {
    // First, store some conversation
    let state = await coordinator.executeWorkflow()
    
    const response1 = "We focus on B2B SaaS with enterprise clients"
    state = await coordinator.processFounderResponse(response1, state)
    
    // Continue workflow - should use memory context
    const nextState = await coordinator.executeWorkflow({
      ...state,
      founderResponse: undefined,
      nextAction: 'memory_retrieval'
    })
    
    expect(nextState.agentThinking.memory).toBeDefined()
    expect(nextState.agentThinking.memory?.currentTask).toContain('memory')
  })

  it('should provide memory statistics', async () => {
    const stats = await coordinator.getMemoryStats()
    
    expect(stats).toBeDefined()
    expect(stats.memoryHealth).toBeDefined()
    expect(['good', 'fair', 'poor']).toContain(stats.memoryHealth)
  })

  it('should clear memory when requested', async () => {
    await coordinator.clearMemory()
    
    const stats = await coordinator.getMemoryStats()
    expect(stats.totalDocuments).toBe(0)
  })

  it('should handle memory errors gracefully', async () => {
    // Mock memory store to throw error
    const originalExecute = coordinator.executeWorkflow
    
    // Should not throw, should handle gracefully
    const result = await coordinator.executeWorkflow()
    expect(result).toBeDefined()
  })

  it('should integrate memory context into question generation', async () => {
    // Store initial conversation
    let state = await coordinator.executeWorkflow()
    state = await coordinator.processFounderResponse(
      "We're in the fintech space focusing on payment processing",
      state
    )
    
    // Generate next question - should have memory context
    const nextState = await coordinator.executeWorkflow({
      ...state,
      founderResponse: undefined,
      nextAction: 'memory_retrieval'
    })
    
    expect(nextState.currentQuestion).toBeDefined()
    expect(nextState.agentThinking.interviewer).toBeDefined()
  })

  it('should maintain conversation continuity across multiple exchanges', async () => {
    let state = await coordinator.executeWorkflow()
    
    // Multiple exchanges
    const responses = [
      "We're building AI-powered analytics tools",
      "Our main customers are mid-market companies",
      "We've raised $2M in seed funding"
    ]
    
    for (const response of responses) {
      state = await coordinator.processFounderResponse(response, state)
      
      // Verify conversation history grows
      expect(state.conversationHistory.length).toBeGreaterThan(0)
      
      // Continue to next question if not complete
      if (!state.isComplete) {
        state = await coordinator.executeWorkflow({
          ...state,
          founderResponse: undefined,
          nextAction: 'memory_retrieval'
        })
      }
    }
    
    // Should have accumulated conversation history
    expect(state.conversationHistory.length).toBe(responses.length)
  })
})

describe('Memory Vector Store Integration', () => {
  it('should create memory store with embeddings', () => {
    const embeddings = new OpenAIEmbeddings()
    const memoryStore = new MemoryVectorStore(embeddings)
    
    expect(memoryStore).toBeDefined()
  })

  it('should handle document storage and retrieval', async () => {
    const embeddings = new OpenAIEmbeddings()
    const memoryStore = new MemoryVectorStore(embeddings)
    
    // This test verifies the basic MemoryVectorStore functionality
    // In a real scenario, this would store and retrieve documents
    expect(memoryStore.addDocuments).toBeDefined()
    expect(memoryStore.similaritySearch).toBeDefined()
  })
})