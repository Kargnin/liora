/**
 * Memory Integration Example
 * Shows how to use the enhanced LangGraph coordinator with integrated memory
 */

import { EnhancedLangGraphCoordinator } from './enhanced-langgraph-coordinator'
import { 
  SharedContext, 
  InterviewSession, 
  InterviewTopic,
  FounderProfile,
  CompanyData 
} from '@/types/interview'

/**
 * Example: Initialize interview with memory-enhanced multi-agent system
 */
export async function initializeMemoryEnhancedInterview(founderId: string, companyName: string) {
  // Create mock shared context (in real app, this comes from your stores)
  const mockSession: InterviewSession = {
    id: `session-${Date.now()}`,
    founderId,
    status: 'active',
    startTime: new Date(),
    currentTopic: {
      id: 'business-model',
      name: 'Business Model',
      description: 'Understanding the company business model and revenue streams',
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
      remainingTime: 1800 // 30 minutes
    },
    transcript: [],
    audioQuality: {
      audio: {
        inputLevel: 75,
        outputLevel: 80,
        noiseLevel: 10,
        echoDetected: false,
        qualityScore: 85
      },
      video: {
        resolution: '1280x720',
        frameRate: 30,
        brightness: 70,
        qualityScore: 90
      },
      recommendations: []
    },
    sessionData: {} as any,
    timeLimit: 30
  }

  const mockFounderProfile: FounderProfile = {
    id: founderId,
    name: 'John Doe',
    email: 'john@example.com',
    background: ['Software Engineering', 'Product Management'],
    experience: ['5 years at Google', '2 years startup experience'],
    education: ['Stanford CS'],
    previousCompanies: ['Google', 'Startup Inc']
  }

  const mockCompanyData: CompanyData = {
    id: 'company-1',
    name: companyName,
    sector: 'SaaS',
    stage: 'Series A',
    description: 'AI-powered productivity platform',
    website: 'https://example.com',
    foundedDate: new Date('2022-01-01'),
    location: 'San Francisco, CA'
  }

  const sharedContext: SharedContext = {
    session: mockSession,
    founderProfile: mockFounderProfile,
    companyData: mockCompanyData,
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

  // Initialize enhanced coordinator
  const coordinator = new EnhancedLangGraphCoordinator(sharedContext)
  
  return coordinator
}

/**
 * Example: Run a complete interview cycle with memory
 */
export async function runMemoryEnhancedInterviewCycle() {
  console.log('🚀 Starting memory-enhanced interview...')
  
  // Initialize
  const coordinator = await initializeMemoryEnhancedInterview('founder-123', 'TechCorp AI')
  
  // Start the workflow
  let currentState = await coordinator.executeWorkflow()
  
  console.log('📝 First question generated:', currentState.currentQuestion?.text)
  
  // Simulate founder responses
  const founderResponses = [
    "We're building an AI-powered productivity platform that helps teams collaborate more effectively. Our main revenue stream is SaaS subscriptions starting at $10 per user per month.",
    
    "Our target market is mid-size companies with 50-500 employees. We've identified that these companies struggle with fragmented communication tools and want a unified solution.",
    
    "We currently have 150 paying customers and are growing at 15% month-over-month. Our annual recurring revenue is around $180K and we're projecting to hit $500K ARR by end of year."
  ]
  
  // Process each response
  for (let i = 0; i < founderResponses.length; i++) {
    console.log(`\n💬 Processing founder response ${i + 1}...`)
    console.log(`Response: "${founderResponses[i]}"`)
    
    // Process the response
    currentState = await coordinator.processFounderResponse(founderResponses[i], currentState)
    
    // Show what the system learned
    console.log('🧠 Agent thinking:')
    Object.entries(currentState.agentThinking).forEach(([agent, thinking]) => {
      console.log(`  ${agent}: ${thinking.currentTask} (confidence: ${thinking.confidence})`)
    })
    
    // Show caliber metrics if available
    if (currentState.caliberMetrics) {
      console.log('📊 Caliber Assessment:')
      console.log(`  Overall: ${currentState.caliberMetrics.overall}/100`)
      console.log(`  Communication: ${currentState.caliberMetrics.categories.communication.score}/100`)
      console.log(`  Business Acumen: ${currentState.caliberMetrics.categories.businessAcumen.score}/100`)
    }
    
    // Show next question if interview continues
    if (!currentState.isComplete && currentState.currentQuestion) {
      console.log(`\n❓ Next question: "${currentState.currentQuestion.text}"`)
    }
    
    // Break if interview is complete
    if (currentState.isComplete) {
      console.log('\n✅ Interview completed!')
      break
    }
  }
  
  // Show memory statistics
  const memoryStats = await coordinator.getMemoryStats()
  console.log('\n🧠 Memory Statistics:')
  console.log(`  Total documents stored: ${memoryStats.totalDocuments}`)
  console.log(`  Memory health: ${memoryStats.memoryHealth}`)
  
  return currentState
}

/**
 * Example: Demonstrate memory retrieval across sessions
 */
export async function demonstrateMemoryPersistence() {
  console.log('\n🔄 Demonstrating memory persistence...')
  
  // First session
  console.log('Session 1: Initial conversation')
  const coordinator1 = await initializeMemoryEnhancedInterview('founder-123', 'TechCorp AI')
  
  let state1 = await coordinator1.executeWorkflow()
  state1 = await coordinator1.processFounderResponse(
    "We're a B2B SaaS company focused on AI-powered analytics. We have strong product-market fit with enterprise clients.",
    state1
  )
  
  console.log('✅ Session 1 complete - memory stored')
  
  // Second session (simulating continuation)
  console.log('\nSession 2: Continuing conversation with memory')
  const coordinator2 = await initializeMemoryEnhancedInterview('founder-123', 'TechCorp AI')
  
  // The memory should now contain context from session 1
  let state2 = await coordinator2.executeWorkflow()
  
  console.log('🧠 Memory context retrieved for session 2')
  console.log('📝 Question with memory context:', state2.currentQuestion?.text)
  
  // Process response that builds on previous conversation
  state2 = await coordinator2.processFounderResponse(
    "Building on what we discussed about our enterprise focus, we've now expanded to serve Fortune 500 companies and our average deal size has grown to $50K annually.",
    state2
  )
  
  console.log('✅ Session 2 complete - memory enhanced the conversation flow')
  
  return { state1, state2 }
}

/**
 * Simple test runner
 */
export async function runMemoryIntegrationDemo() {
  try {
    console.log('🎯 Memory Integration Demo Starting...\n')
    
    // Run basic interview cycle
    await runMemoryEnhancedInterviewCycle()
    
    // Demonstrate memory persistence
    await demonstrateMemoryPersistence()
    
    console.log('\n🎉 Demo completed successfully!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

// Export for use in other parts of the application
export { EnhancedLangGraphCoordinator }