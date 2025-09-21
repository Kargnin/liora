/**
 * Test for Enhanced Simple Coordinator
 * Verifies LangGraph integration and basic functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EnhancedSimpleCoordinator } from '../enhanced-simple-coordinator'

describe('EnhancedSimpleCoordinator', () => {
  let coordinator: EnhancedSimpleCoordinator

  beforeEach(() => {
    coordinator = new EnhancedSimpleCoordinator()
  })

  it('should initialize successfully', () => {
    expect(coordinator).toBeDefined()
  })

  it('should execute initial workflow and generate first question', async () => {
    const result = await coordinator.executeWorkflow()
    
    expect(result).toBeDefined()
    expect(result.messages).toHaveLength(1)
    expect(result.currentQuestion).toBeTruthy()
    expect(result.questionCount).toBe(1)
    expect(result.isComplete).toBe(false)
  })

  it('should process founder response and generate next question', async () => {
    // Start interview
    const initialState = await coordinator.executeWorkflow()
    
    // Process a response
    const response = "We're building an AI-powered customer service platform that helps e-commerce companies reduce support costs by 50%."
    const updatedState = await coordinator.processFounderResponse(response, initialState)
    
    expect(updatedState.messages.length).toBeGreaterThan(initialState.messages.length)
    expect(updatedState.conversationHistory.length).toBeGreaterThan(0)
    expect(updatedState.questionCount).toBe(2)
  })

  it('should complete interview after max questions', async () => {
    let currentState = await coordinator.executeWorkflow()
    
    // Process responses until completion
    const responses = [
      "We solve customer service inefficiency for e-commerce companies.",
      "We charge a monthly SaaS fee plus per-interaction pricing.",
      "Our main competitors are Zendesk and Intercom, but we focus specifically on AI automation.",
      "I'm a former engineering manager at Google, and we need to hire a head of sales.",
      "Our biggest challenge is customer acquisition, and we need help with go-to-market strategy."
    ]
    
    for (const response of responses) {
      currentState = await coordinator.processFounderResponse(response, currentState)
      
      if (currentState.isComplete) {
        break
      }
    }
    
    expect(currentState.isComplete).toBe(true)
    expect(currentState.questionCount).toBe(5)
  })

  it('should track memory stats correctly', async () => {
    const initialStats = await coordinator.getMemoryStats()
    expect(initialStats.totalConversations).toBe(0)
    
    // Process one conversation
    const initialState = await coordinator.executeWorkflow()
    const response = "We're building an AI platform."
    await coordinator.processFounderResponse(response, initialState)
    
    const updatedStats = await coordinator.getMemoryStats()
    expect(updatedStats.totalConversations).toBe(1)
    expect(updatedStats.memoryHealth).toBe('good')
  })

  it('should clear memory successfully', async () => {
    // Add some conversation
    const initialState = await coordinator.executeWorkflow()
    await coordinator.processFounderResponse("Test response", initialState)
    
    let stats = await coordinator.getMemoryStats()
    expect(stats.totalConversations).toBe(1)
    
    // Clear memory
    await coordinator.clearMemory()
    
    stats = await coordinator.getMemoryStats()
    expect(stats.totalConversations).toBe(0)
  })

  it('should provide workflow status correctly', async () => {
    const initialState = await coordinator.executeWorkflow()
    const status = coordinator.getWorkflowStatus(initialState)
    
    expect(status.currentStep).toBe('active')
    expect(status.progress).toBe(20) // 1/5 questions = 20%
    expect(status.questionsRemaining).toBe(4)
  })
})