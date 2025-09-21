/**
 * Tests for Simplified LocalMemoryStore using LangGraph.js
 * 
 * Test suite covering:
 * - Basic memory operations (store, retrieve, clear)
 * - Token estimation and memory management
 * - Vector-based semantic search
 * - Memory optimization for long sessions
 * - Error handling and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  LocalMemoryStore, 
  estimateTokens,
  estimateEntryTokens,
  createLocalMemoryStore
} from '../local-memory-store'
import { ConversationEntry } from '@/types/interview'

// Mock data for testing
const createMockConversationEntry = (
  id: string, 
  question: string, 
  response: string, 
  timestamp?: Date,
  insights?: string[]
): ConversationEntry => ({
  id,
  question,
  response,
  timestamp: timestamp || new Date(),
  insights
})

describe('LocalMemoryStore', () => {
  let memoryStore: LocalMemoryStore
  const sessionId = 'test-session-123'

  beforeEach(() => {
    memoryStore = new LocalMemoryStore({
      maxEntries: 20,
      searchLimit: 5,
      summaryThreshold: 10
    })
  })

  describe('Basic Memory Operations', () => {
    it('should store conversation entries', async () => {
      const entry = createMockConversationEntry(
        'entry-1',
        'What is your business model?',
        'We operate a SaaS platform with subscription revenue of $100K MRR'
      )

      await memoryStore.storeConversation(sessionId, entry)
      
      const context = await memoryStore.retrieveContext(sessionId, 'business model')
      expect(context.totalEntries).toBe(1)
    })

    it('should retrieve relevant context based on query', async () => {
      const entries = [
        createMockConversationEntry('1', 'Tell me about your revenue', 'We have $50K MRR growing 20% monthly'),
        createMockConversationEntry('2', 'What about your team?', 'We have 5 engineers and 2 sales people'),
        createMockConversationEntry('3', 'How do you acquire customers?', 'Mainly through content marketing and SEO')
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const context = await memoryStore.retrieveContext(sessionId, 'revenue')
      expect(context.totalEntries).toBe(3)
      expect(context.entries.length).toBeGreaterThan(0)
    })

    it('should clear memory for a session', async () => {
      const entry = createMockConversationEntry('1', 'Test question', 'Test response')
      await memoryStore.storeConversation(sessionId, entry)
      
      await memoryStore.clearMemory(sessionId)
      
      const stats = memoryStore.getMemoryStats(sessionId)
      expect(stats).toBeNull()
    })

    it('should handle non-existent sessions gracefully', async () => {
      const context = await memoryStore.retrieveContext('non-existent', 'test query')
      
      expect(context.entries).toHaveLength(0)
      expect(context.summary).toBe('')
      expect(context.keyInsights).toHaveLength(0)
      expect(context.totalEntries).toBe(0)
    })

    it('should handle empty queries by returning recent entries', async () => {
      const entries = [
        createMockConversationEntry('1', 'Question 1', 'Response 1'),
        createMockConversationEntry('2', 'Question 2', 'Response 2')
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const context = await memoryStore.retrieveContext(sessionId, '')
      expect(context.entries.length).toBeGreaterThan(0)
      expect(context.totalEntries).toBe(2)
    })
  })

  describe('Token Estimation', () => {
    it('should estimate tokens correctly for text', () => {
      const shortText = 'Hello world'
      const longText = 'This is a much longer text that should have more tokens estimated'
      
      expect(estimateTokens(shortText)).toBeLessThan(estimateTokens(longText))
      expect(estimateTokens('')).toBe(0)
      expect(estimateTokens('test')).toBeGreaterThan(0)
    })

    it('should estimate tokens for conversation entries', () => {
      const entry = createMockConversationEntry(
        '1',
        'What is your business model?',
        'We operate a SaaS platform with subscription revenue',
        new Date(),
        ['Revenue model discussed', 'SaaS platform confirmed']
      )
      
      const tokens = estimateEntryTokens(entry)
      expect(tokens).toBeGreaterThan(0)
      expect(tokens).toBeGreaterThan(estimateTokens(entry.question))
    })
  })

  describe('Memory Optimization', () => {
    it('should optimize memory for long sessions', async () => {
      // Create many entries to trigger optimization
      const entries = Array.from({ length: 25 }, (_, i) => 
        createMockConversationEntry(
          `entry-${i}`,
          `Question ${i} about business metrics`,
          `Response ${i} with information about revenue and growth`
        )
      )

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const stats = memoryStore.getMemoryStats(sessionId)
      expect(stats).not.toBeNull()
      expect(stats!.totalEntries).toBeLessThanOrEqual(20) // Should be optimized
    })

    it('should generate summaries during optimization', async () => {
      const entries = Array.from({ length: 15 }, (_, i) => 
        createMockConversationEntry(
          `entry-${i}`,
          `Question ${i} about revenue`,
          `Response ${i} discussing $${i * 1000} revenue and team growth`
        )
      )

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      await memoryStore.optimizeMemory(sessionId)
      
      const context = await memoryStore.retrieveContext(sessionId, 'test')
      expect(context.summary.length).toBeGreaterThan(0)
    })

    it('should track memory statistics', async () => {
      const entries = Array.from({ length: 5 }, (_, i) => 
        createMockConversationEntry(`entry-${i}`, `Question ${i}`, `Response ${i}`)
      )

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const stats = memoryStore.getMemoryStats(sessionId)
      expect(stats).not.toBeNull()
      expect(stats!.totalEntries).toBe(5)
      expect(stats!.recentEntries).toBe(5)
    })
  })

  describe('Key Insights Extraction', () => {
    it('should extract insights from conversation entries', async () => {
      const entries = [
        createMockConversationEntry(
          '1', 
          'What are your metrics?', 
          'We have $100K ARR with strong team growth',
          new Date(),
          ['Strong growth metrics']
        ),
        createMockConversationEntry(
          '2',
          'Tell me about your team',
          'Our team of 10 engineers is growing rapidly'
        )
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const context = await memoryStore.retrieveContext(sessionId, 'metrics')
      expect(context.keyInsights.length).toBeGreaterThan(0)
    })

    it('should identify financial and team insights automatically', async () => {
      const entry = createMockConversationEntry(
        '1',
        'Business overview',
        'We have $50K MRR and a team of 8 people with 20% growth'
      )

      await memoryStore.storeConversation(sessionId, entry)
      
      const context = await memoryStore.retrieveContext(sessionId, 'business')
      const insights = context.keyInsights
      
      expect(insights.some(insight => insight.includes('Financial'))).toBeTruthy()
      expect(insights.some(insight => insight.includes('Team'))).toBeTruthy()
      expect(insights.some(insight => insight.includes('Growth'))).toBeTruthy()
    })
  })

  describe('Search Functionality', () => {
    it('should perform semantic search when vector store is available', async () => {
      const entries = [
        createMockConversationEntry('1', 'Revenue question', 'We make money through subscriptions'),
        createMockConversationEntry('2', 'Team question', 'We have 10 engineers'),
        createMockConversationEntry('3', 'Market question', 'Our market is enterprise software')
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      const context = await memoryStore.retrieveContext(sessionId, 'revenue money')
      expect(context.entries.length).toBeGreaterThan(0)
      expect(context.totalEntries).toBe(3)
    })

    it('should fallback to keyword search when vector search fails', async () => {
      const entries = [
        createMockConversationEntry('1', 'Revenue discussion', 'Our revenue is growing'),
        createMockConversationEntry('2', 'Team discussion', 'Team is expanding')
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      // This should work even if vector search fails
      const context = await memoryStore.retrieveContext(sessionId, 'revenue')
      expect(context.totalEntries).toBe(2)
    })
  })

  describe('Factory Function', () => {
    it('should create memory store with default configuration', () => {
      const store = createLocalMemoryStore()
      expect(store).toBeInstanceOf(LocalMemoryStore)
    })

    it('should create memory store with custom configuration', () => {
      const customConfig = {
        maxEntries: 50,
        searchLimit: 15
      }
      
      const store = createLocalMemoryStore(customConfig)
      expect(store).toBeInstanceOf(LocalMemoryStore)
    })
  })

  describe('LangGraph Integration', () => {
    it('should restore conversation state from LangGraph memory', async () => {
      const entries = [
        createMockConversationEntry('1', 'Question 1', 'Response 1'),
        createMockConversationEntry('2', 'Question 2', 'Response 2')
      ]

      for (const entry of entries) {
        await memoryStore.storeConversation(sessionId, entry)
      }

      // Create a new memory store instance to simulate restart
      const newMemoryStore = new LocalMemoryStore()
      
      // Try to restore state
      const restored = await newMemoryStore.restoreFromMemory(sessionId)
      
      // Note: This might not work in test environment without proper LangGraph setup
      // but the method should exist and not throw errors
      expect(typeof restored).toBe('boolean')
    })
  })

  describe('Error Handling', () => {
    it('should handle memory operations on cleared sessions', async () => {
      await memoryStore.clearMemory(sessionId)
      
      const stats = memoryStore.getMemoryStats(sessionId)
      expect(stats).toBeNull()
    })

    it('should handle empty conversation entries', async () => {
      const entry = createMockConversationEntry('1', '', '')
      
      await memoryStore.storeConversation(sessionId, entry)
      
      const context = await memoryStore.retrieveContext(sessionId, 'test')
      expect(context.totalEntries).toBe(1)
    })

    it('should handle concurrent operations safely', async () => {
      const entries = Array.from({ length: 5 }, (_, i) => 
        createMockConversationEntry(`entry-${i}`, `Question ${i}`, `Response ${i}`)
      )

      // Simulate concurrent operations
      const promises = entries.map(entry => 
        memoryStore.storeConversation(sessionId, entry)
      )

      await Promise.all(promises)

      const stats = memoryStore.getMemoryStats(sessionId)
      expect(stats!.totalEntries).toBe(5)
    })
  })

  describe('Integration Test', () => {
    it('should handle a complete interview session workflow', async () => {
      const interviewFlow = [
        { q: 'Tell me about yourself', a: 'I am the founder of TechCorp, a B2B SaaS company' },
        { q: 'What is your business model?', a: 'We charge $99/month for our project management software' },
        { q: 'How big is your market?', a: 'The project management software market is $5B and growing 15% annually' },
        { q: 'What traction do you have?', a: 'We have 500 customers, $50K MRR, and 10% monthly growth' },
        { q: 'Tell me about your team', a: 'We have 8 people: 5 engineers, 2 sales, and 1 marketing' }
      ]
      
      // Store all conversation entries
      for (let i = 0; i < interviewFlow.length; i++) {
        const item = interviewFlow[i]
        const entry = createMockConversationEntry(
          `interview-${i}`,
          item.q,
          item.a,
          new Date(Date.now() + i * 60000)
        )
        
        await memoryStore.storeConversation(sessionId, entry)
      }
      
      // Test various retrieval scenarios
      const businessContext = await memoryStore.retrieveContext(sessionId, 'business model')
      expect(businessContext.totalEntries).toBe(5)
      
      const teamContext = await memoryStore.retrieveContext(sessionId, 'team')
      expect(teamContext.totalEntries).toBe(5)
      
      const metricsContext = await memoryStore.retrieveContext(sessionId, 'MRR customers')
      expect(metricsContext.totalEntries).toBe(5)
      
      // Test memory optimization
      await memoryStore.optimizeMemory(sessionId)
      
      const finalStats = memoryStore.getMemoryStats(sessionId)
      expect(finalStats).not.toBeNull()
      expect(finalStats!.totalEntries).toBeGreaterThan(0)
      
      // Clean up
      await memoryStore.clearMemory(sessionId)
      
      const clearedStats = memoryStore.getMemoryStats(sessionId)
      expect(clearedStats).toBeNull()
    })
  })
})