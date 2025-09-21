/**
 * Memory Manager Agent - Handles conversation context and long-term memory
 * Manages conversation storage, retrieval, continuity, and memory optimization
 */

import { BaseAgentImpl } from './base-agent'
import {
  MemoryManagerAgent,
  ConversationEntry,
  ConversationContext,
  ContinuityBridge,
  ConversationMemory
} from '@/types/interview'

export class MemoryManagerAgentImpl extends BaseAgentImpl implements MemoryManagerAgent {
  public readonly type = 'memory' as const
  private conversationMemory: Map<string, ConversationMemory> = new Map()
  private maxMemorySize: number = 10000 // tokens
  private compressionThreshold: number = 8000 // tokens

  constructor(id: string = 'memory-001') {
    super(id, 'memory')
  }

  /**
   * Store conversation entry in memory
   */
  async storeConversation(entry: ConversationEntry): Promise<void> {
    this.updateStatus('processing', 'Storing conversation entry')
    this.logActivity('Storing conversation', {
      entryId: entry.id,
      responseLength: entry.response.length
    })

    try {
      await this.simulateProcessing(200, 400)

      const sessionId = 'current-session' // In real implementation, get from context
      const memory = this.getOrCreateMemory(sessionId)
      
      memory.entries.push(entry)
      memory.totalTokens += this.estimateTokens(entry)

      // Extract key insights from the entry
      const insights = this.extractInsights(entry)
      memory.keyInsights.push(...insights)

      // Compress memory if it exceeds threshold
      if (memory.totalTokens > this.compressionThreshold) {
        await this.compressMemory(sessionId)
      }

      this.conversationMemory.set(sessionId, memory)
      this.updateStatus('idle')

    } catch (error) {
      this.handleError(error as Error, 'storeConversation')
      throw error
    }
  }

  /**
   * Retrieve relevant conversation context based on query
   */
  async retrieveContext(query: string): Promise<ConversationContext> {
    this.updateStatus('thinking', 'Retrieving conversation context')
    this.logActivity('Retrieving context', { query })

    try {
      await this.simulateProcessing(300, 600)

      const sessionId = 'current-session'
      const memory = this.conversationMemory.get(sessionId)
      
      if (!memory) {
        return {
          entries: [],
          summary: '',
          keyInsights: [],
          totalEntries: 0,
          recentExchanges: ''
        }
      }

      // Use semantic search to find relevant conversation parts
      const relevantEntries = await this.semanticSearch(memory.entries, query)
      
      // Generate recent exchanges summary
      const recentExchanges = this.generateRecentExchangesSummary(memory.entries.slice(-5))

      const context: ConversationContext = {
        entries: relevantEntries,
        summary: memory.compressedSummary,
        keyInsights: memory.keyInsights,
        totalEntries: memory.entries.length,
        recentExchanges
      }

      this.updateStatus('idle')
      return context

    } catch (error) {
      this.handleError(error as Error, 'retrieveContext')
      throw error
    }
  }

  /**
   * Maintain conversational continuity when transitioning topics
   */
  async maintainContinuity(newTopic: string): Promise<ContinuityBridge> {
    this.updateStatus('thinking', 'Creating continuity bridge')
    this.logActivity('Maintaining continuity', { newTopic })

    try {
      await this.simulateProcessing(400, 700)

      const sessionId = 'current-session'
      const memory = this.conversationMemory.get(sessionId)
      
      if (!memory || memory.entries.length === 0) {
        return {
          previousTopic: 'introduction',
          newTopic,
          connectionPoints: [],
          transitionPhrase: `Now let's talk about ${newTopic}.`
        }
      }

      // Analyze recent conversation to find connection points
      const recentEntries = memory.entries.slice(-3)
      const connectionPoints = this.findConnectionPoints(recentEntries, newTopic)
      const previousTopic = this.inferPreviousTopic(recentEntries)
      const transitionPhrase = this.generateTransitionPhrase(previousTopic, newTopic, connectionPoints)

      const bridge: ContinuityBridge = {
        previousTopic,
        newTopic,
        connectionPoints,
        transitionPhrase
      }

      this.updateStatus('idle')
      return bridge

    } catch (error) {
      this.handleError(error as Error, 'maintainContinuity')
      throw error
    }
  }

  /**
   * Optimize memory for long sessions
   */
  async optimizeMemory(sessionDuration: number): Promise<void> {
    this.updateStatus('processing', 'Optimizing memory')
    this.logActivity('Optimizing memory', { sessionDuration })

    try {
      await this.simulateProcessing(500, 1000)

      const sessionId = 'current-session'
      
      // Compress memory if session is long
      if (sessionDuration > 30 * 60 * 1000) { // 30 minutes
        await this.compressMemory(sessionId)
      }

      // Clean up old, less relevant entries
      await this.cleanupMemory(sessionId)

      this.updateStatus('idle')

    } catch (error) {
      this.handleError(error as Error, 'optimizeMemory')
      throw error
    }
  }

  /**
   * Get or create memory for a session
   */
  private getOrCreateMemory(sessionId: string): ConversationMemory {
    let memory = this.conversationMemory.get(sessionId)
    
    if (!memory) {
      memory = {
        entries: [],
        compressedSummary: '',
        keyInsights: [],
        totalTokens: 0
      }
      this.conversationMemory.set(sessionId, memory)
    }
    
    return memory
  }

  /**
   * Estimate token count for conversation entry
   */
  private estimateTokens(entry: ConversationEntry): number {
    // Rough estimation: 1 token ≈ 4 characters
    const text = `${entry.question} ${entry.response}`
    return Math.ceil(text.length / 4)
  }

  /**
   * Compress memory by summarizing older entries
   */
  private async compressMemory(sessionId: string): Promise<void> {
    const memory = this.conversationMemory.get(sessionId)
    if (!memory || !memory.entries) return
    
    // Keep recent entries, compress older ones
    const recentEntries = memory.entries.slice(-20) // Keep last 20 exchanges
    const olderEntries = memory.entries.slice(0, -20)
    
    if (olderEntries.length > 0) {
      // Generate compressed summary of older entries
      const compressedSummary = await this.generateSummary(olderEntries)
      const keyInsights = await this.extractKeyInsights(olderEntries)
      
      memory.entries = recentEntries
      memory.compressedSummary = compressedSummary
      memory.keyInsights = [...memory.keyInsights, ...keyInsights]
      memory.totalTokens = this.estimateTokens({ 
        id: 'summary', 
        question: '', 
        response: compressedSummary, 
        timestamp: new Date() 
      } as ConversationEntry) + recentEntries.reduce((total, entry) => total + this.estimateTokens(entry), 0)
    }
  }

  /**
   * Generate summary of conversation entries
   */
  private async generateSummary(entries: ConversationEntry[]): Promise<string> {
    if (entries.length === 0) return ''

    // Extract key topics and responses
    const topics = entries.map(entry => {
      const question = entry.question.substring(0, 100)
      const response = entry.response.substring(0, 200)
      return `Q: ${question}... A: ${response}...`
    })

    return `Previous conversation covered: ${topics.join(' | ')}`
  }

  /**
   * Extract key insights from conversation entries
   */
  private async extractKeyInsights(entries: ConversationEntry[]): Promise<string[]> {
    const insights: string[] = []
    
    entries.forEach(entry => {
      // Extract metrics mentioned
      const metrics = entry.response.match(/\$[\d,]+|\d+%|\d+\s*(customers?|users?|months?)/g)
      if (metrics) {
        insights.push(`Metrics: ${metrics.join(', ')}`)
      }

      // Extract challenges mentioned
      if (/challenge|difficult|problem/i.test(entry.response)) {
        insights.push('Discussed challenges')
      }

      // Extract achievements mentioned
      if (/achieved|successful|grew|increased/i.test(entry.response)) {
        insights.push('Mentioned achievements')
      }
    })

    return [...new Set(insights)] // Remove duplicates
  }

  /**
   * Extract insights from a single conversation entry
   */
  private extractInsights(entry: ConversationEntry): string[] {
    const insights: string[] = []
    
    // Look for specific patterns in the response
    if (/\$[\d,]+/.test(entry.response)) {
      insights.push('Financial metrics mentioned')
    }
    
    if (/\d+%/.test(entry.response)) {
      insights.push('Percentage metrics mentioned')
    }
    
    if (/customer|client|user/i.test(entry.response)) {
      insights.push('Customer-related discussion')
    }
    
    if (/competitor|competition/i.test(entry.response)) {
      insights.push('Competitive landscape discussed')
    }

    return insights
  }

  /**
   * Semantic search for relevant conversation entries
   */
  private async semanticSearch(entries: ConversationEntry[], query: string): Promise<ConversationEntry[]> {
    // Simple keyword-based search for demo - can be enhanced with embeddings
    const keywords = query.toLowerCase().split(' ')
    
    const relevantEntries = entries.filter(entry => {
      const text = `${entry.question} ${entry.response}`.toLowerCase()
      return keywords.some(keyword => text.includes(keyword))
    })

    // Return last 10 relevant entries, or last 5 if no matches
    return relevantEntries.length > 0 ? relevantEntries.slice(-10) : entries.slice(-5)
  }

  /**
   * Generate summary of recent exchanges
   */
  private generateRecentExchangesSummary(recentEntries: ConversationEntry[]): string {
    if (recentEntries.length === 0) return ''

    const summaries = recentEntries.map(entry => {
      const questionSummary = entry.question.substring(0, 50)
      const responseSummary = entry.response.substring(0, 100)
      return `${questionSummary}... → ${responseSummary}...`
    })

    return summaries.join(' | ')
  }

  /**
   * Find connection points between recent conversation and new topic
   */
  private findConnectionPoints(recentEntries: ConversationEntry[], newTopic: string): string[] {
    const connectionPoints: string[] = []
    const newTopicLower = newTopic.toLowerCase()
    
    recentEntries.forEach(entry => {
      const response = entry.response.toLowerCase()
      
      // Look for topic-related keywords in recent responses
      if (newTopicLower.includes('team') && /hire|people|employee/i.test(response)) {
        connectionPoints.push('hiring and team building mentioned')
      }
      
      if (newTopicLower.includes('market') && /customer|user|segment/i.test(response)) {
        connectionPoints.push('customer insights from previous discussion')
      }
      
      if (newTopicLower.includes('financial') && /revenue|money|cost/i.test(response)) {
        connectionPoints.push('financial aspects touched upon')
      }
      
      if (newTopicLower.includes('product') && /feature|build|develop/i.test(response)) {
        connectionPoints.push('product development themes')
      }
    })

    return connectionPoints
  }

  /**
   * Infer the previous topic from recent entries
   */
  private inferPreviousTopic(recentEntries: ConversationEntry[]): string {
    if (recentEntries.length === 0) return 'introduction'

    const lastEntry = recentEntries[recentEntries.length - 1]
    const question = lastEntry.question.toLowerCase()
    
    if (/market|customer|segment/i.test(question)) return 'market analysis'
    if (/team|hire|people/i.test(question)) return 'team dynamics'
    if (/revenue|financial|money/i.test(question)) return 'financial metrics'
    if (/product|feature|technology/i.test(question)) return 'product development'
    if (/competitor|competition/i.test(question)) return 'competitive landscape'
    
    return 'general discussion'
  }

  /**
   * Generate smooth transition phrase
   */
  private generateTransitionPhrase(previousTopic: string, newTopic: string, connectionPoints: string[]): string {
    if (connectionPoints.length > 0) {
      return `That's great insight about ${previousTopic}. Building on what you mentioned about ${connectionPoints[0]}, let's dive into ${newTopic}.`
    }

    const transitions = [
      `Thanks for that perspective on ${previousTopic}. Now I'd like to explore ${newTopic}.`,
      `That gives me good context on ${previousTopic}. Let's shift our focus to ${newTopic}.`,
      `Excellent. Moving from ${previousTopic}, I'm curious about ${newTopic}.`,
      `I appreciate those insights on ${previousTopic}. Let's talk about ${newTopic}.`
    ]

    return transitions[Math.floor(Math.random() * transitions.length)]
  }

  /**
   * Clean up less relevant memory entries
   */
  private async cleanupMemory(sessionId: string): Promise<void> {
    const memory = this.conversationMemory.get(sessionId)
    if (!memory) return

    // Remove entries with very low relevance scores
    // For now, just ensure we don't exceed maximum entries
    const maxEntries = 50
    if (memory.entries && memory.entries.length > maxEntries) {
      const keepEntries = memory.entries.slice(-maxEntries)
      memory.entries = keepEntries
      memory.totalTokens = keepEntries.reduce((total, entry) => total + this.estimateTokens(entry), 0)
    }
  }

  /**
   * Get memory statistics for monitoring
   */
  getMemoryStats(sessionId: string = 'current-session'): {
    totalEntries: number
    totalTokens: number
    keyInsights: number
    compressionRatio: number
  } {
    const memory = this.conversationMemory.get(sessionId)
    
    if (!memory) {
      return { totalEntries: 0, totalTokens: 0, keyInsights: 0, compressionRatio: 0 }
    }

    return {
      totalEntries: memory.entries.length,
      totalTokens: memory.totalTokens,
      keyInsights: memory.keyInsights.length,
      compressionRatio: memory.compressedSummary.length > 0 ? 
        memory.compressedSummary.length / memory.totalTokens : 0
    }
  }

  /**
   * Clear memory for a session
   */
  clearMemory(sessionId: string = 'current-session'): void {
    this.conversationMemory.delete(sessionId)
    this.logActivity('Memory cleared', { sessionId })
  }
}