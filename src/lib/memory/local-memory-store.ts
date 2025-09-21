// /**
//  * Local Memory Store for Long Conversations using LangGraph.js
//  * 
//  * Simple and efficient conversation memory management leveraging LangGraph's
//  * state management and memory patterns for long interview sessions.
//  * 
//  * Features:
//  * - LangGraph-compatible state management
//  * - Keyword-based semantic search
//  * - Automatic conversation summarization
//  * - Memory optimization for long sessions
//  * - Simple and maintainable codebase
//  */

// import { StateGraph, MemorySaver, Checkpoint } from "@langchain/langgraph"
// import { ConversationEntry, ConversationContext } from '@/types/interview'

// // ============================================================================
// // Core Interfaces
// // ============================================================================

// export interface MemoryStoreConfig {
//   maxEntries: number // Maximum entries before cleanup (default: 100)
//   searchLimit: number // Max results for semantic search (default: 10)
//   summaryThreshold: number // Number of entries before summarization (default: 50)
// }

// export interface MemorySearchResult {
//   entries: ConversationEntry[]
//   summary?: string
//   relevanceScores: number[]
//   totalMatches: number
// }

// export interface MemoryStats {
//   totalEntries: number
//   recentEntries: number
//   summaryLength: number
//   lastOptimization: Date
// }

// // ============================================================================
// // Simple Token Estimation
// // ============================================================================

// export function estimateTokens(text: string): number {
//   return Math.ceil(text.length / 4)
// }

// export function estimateEntryTokens(entry: ConversationEntry): number {
//   const questionTokens = estimateTokens(entry.question)
//   const responseTokens = estimateTokens(entry.response)
//   const insightsTokens = entry.insights ? 
//     entry.insights.reduce((sum, insight) => sum + estimateTokens(insight), 0) : 0
  
//   return questionTokens + responseTokens + insightsTokens + 10
// }

// // ============================================================================
// // LangGraph-based Local Memory Store
// // ============================================================================

// export class LocalMemoryStore {
//   private conversationEntries: Map<string, ConversationEntry[]> = new Map()
//   private summaries: Map<string, string> = new Map()
//   private config: MemoryStoreConfig
//   private memorySaver: MemorySaver

//   constructor(config: Partial<MemoryStoreConfig> = {}) {
//     this.config = {
//       maxEntries: 100,
//       searchLimit: 10,
//       summaryThreshold: 50,
//       ...config
//     }
    
//     // Initialize LangGraph memory saver for state persistence
//     this.memorySaver = new MemorySaver()
//   }

//   /**
//    * Store a conversation entry for a session using LangGraph state management
//    */
//   async storeConversation(sessionId: string, entry: ConversationEntry): Promise<void> {
//     // Get or create entries array for session
//     if (!this.conversationEntries.has(sessionId)) {
//       this.conversationEntries.set(sessionId, [])
//     }
    
//     const entries = this.conversationEntries.get(sessionId)!
//     entries.push(entry)
    
//     // Save state using LangGraph's MemorySaver
//     const conversationState = {
//       entries: entries,
//       summary: this.summaries.get(sessionId) || '',
//       lastUpdated: new Date().toISOString()
//     }
    
//     await this.memorySaver.put(
//       { configurable: { thread_id: sessionId } },
//       'conversation_memory',
//       conversationState
//     )
    
//     // Check if we need to optimize memory
//     if (entries.length > this.config.maxEntries) {
//       await this.optimizeMemory(sessionId)
//     }
//   }

//   /**
//    * Retrieve relevant conversation context for a query
//    */
//   async retrieveContext(sessionId: string, query: string): Promise<ConversationContext> {
//     const entries = this.conversationEntries.get(sessionId) || []
    
//     if (entries.length === 0) {
//       return {
//         entries: [],
//         summary: '',
//         keyInsights: [],
//         totalEntries: 0,
//         recentExchanges: ''
//       }
//     }

//     // If query is empty, return recent entries
//     if (!query || query.trim().length < 2) {
//       const recentEntries = entries.slice(-5)
//       return {
//         entries: recentEntries,
//         summary: this.summaries.get(sessionId) || '',
//         keyInsights: this.extractKeyInsights(recentEntries),
//         totalEntries: entries.length,
//         recentExchanges: recentEntries
//           .map(entry => `Q: ${entry.question}\nA: ${entry.response}`)
//           .join('\n\n')
//       }
//     }

//     // Perform simple keyword-based semantic search
//     return this.performKeywordSearch(sessionId, query)
//   }

//   /**
//    * Optimize memory for long sessions with LangGraph state persistence
//    */
//   async optimizeMemory(sessionId: string): Promise<void> {
//     const entries = this.conversationEntries.get(sessionId)
//     if (!entries || entries.length <= this.config.summaryThreshold) return

//     // Keep recent entries, summarize older ones
//     const recentEntries = entries.slice(-this.config.summaryThreshold)
//     const olderEntries = entries.slice(0, -this.config.summaryThreshold)
    
//     if (olderEntries.length > 0) {
//       // Generate summary of older entries
//       const summary = this.generateSummary(olderEntries)
//       this.summaries.set(sessionId, summary)
      
//       // Update entries to keep only recent ones
//       this.conversationEntries.set(sessionId, recentEntries)
      
//       // Update LangGraph state with optimized memory
//       const optimizedState = {
//         entries: recentEntries,
//         summary: summary,
//         lastOptimized: new Date().toISOString()
//       }
      
//       await this.memorySaver.put(
//         { configurable: { thread_id: sessionId } },
//         'conversation_memory',
//         optimizedState
//       )
//     }
//   }

//   /**
//    * Get memory statistics for a session
//    */
//   getMemoryStats(sessionId: string): MemoryStats | null {
//     const entries = this.conversationEntries.get(sessionId)
//     if (!entries) return null

//     const summary = this.summaries.get(sessionId) || ''
    
//     return {
//       totalEntries: entries.length,
//       recentEntries: Math.min(entries.length, this.config.summaryThreshold),
//       summaryLength: summary.length,
//       lastOptimization: new Date()
//     }
//   }

//   /**
//    * Clear memory for a session and remove from LangGraph state
//    */
//   async clearMemory(sessionId: string): Promise<void> {
//     this.conversationEntries.delete(sessionId)
//     this.summaries.delete(sessionId)
    
//     // Clear from LangGraph memory saver
//     try {
//       await this.memorySaver.put(
//         { configurable: { thread_id: sessionId } },
//         'conversation_memory',
//         null
//       )
//     } catch () {
//       // Ignore errors when clearing non-existent state
//     }
//   }

//   /**
//    * Restore conversation state from LangGraph memory
//    */
//   async restoreFromMemory(sessionId: string): Promise<boolean> {
//     try {
//       const checkpoint = await this.memorySaver.get({ configurable: { thread_id: sessionId } })
      
//       if (checkpoint && checkpoint.channel_values?.conversation_memory) {
//         const state = checkpoint.channel_values.conversation_memory
        
//         if (state.entries) {
//           this.conversationEntries.set(sessionId, state.entries)
//         }
        
//         if (state.summary) {
//           this.summaries.set(sessionId, state.summary)
//         }
        
//         return true
//       }
//     } catch (error) {
//       console.warn(`Failed to restore memory for session ${sessionId}:`, error)
//     }
    
//     return false
//   }

//   /**
//    * Extract key insights from conversation entries
//    */
//   private extractKeyInsights(entries: ConversationEntry[]): string[] {
//     const insights: string[] = []
    
//     for (const entry of entries) {
//       if (entry.insights) {
//         insights.push(...entry.insights)
//       }
      
//       // Extract simple patterns
//       if (entry.response.includes('$')) {
//         insights.push('Financial metrics discussed')
//       }
//       if (entry.response.toLowerCase().includes('team')) {
//         insights.push('Team composition mentioned')
//       }
//       if (entry.response.toLowerCase().includes('growth')) {
//         insights.push('Growth discussed')
//       }
//     }
    
//     // Remove duplicates and limit
//     return Array.from(new Set(insights)).slice(0, 10)
//   }

//   /**
//    * Generate summary of conversation entries
//    */
//   private generateSummary(entries: ConversationEntry[]): string {
//     if (entries.length === 0) return ''

//     const topics = new Set<string>()
//     const metrics: string[] = []
    
//     for (const entry of entries) {
//       // Extract topics
//       const response = entry.response.toLowerCase()
//       if (response.includes('revenue') || response.includes('money')) topics.add('Revenue')
//       if (response.includes('team') || response.includes('hire')) topics.add('Team')
//       if (response.includes('market') || response.includes('customer')) topics.add('Market')
//       if (response.includes('product') || response.includes('feature')) topics.add('Product')
      
//       // Extract metrics
//       const numberMatches = entry.response.match(/\$?[\d,]+\.?\d*[%MBK]?/g)
//       if (numberMatches) {
//         metrics.push(...numberMatches.slice(0, 2)) // Limit metrics per entry
//       }
//     }
    
//     let summary = `Previous conversation covered: ${Array.from(topics).join(', ')}`
//     if (metrics.length > 0) {
//       summary += `\nKey metrics mentioned: ${metrics.slice(0, 5).join(', ')}`
//     }
    
//     return summary
//   }

//   /**
//    * Perform keyword-based search with simple relevance scoring
//    */
//   private performKeywordSearch(sessionId: string, query: string): ConversationContext {
//     const entries = this.conversationEntries.get(sessionId) || []
//     const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2)
    
//     // Score entries based on keyword matches
//     const scoredEntries = entries.map(entry => {
//       // const text = `${entry.question} ${entry.response}`.toLowerCase()
//       let score = 0
      
//       for (const term of queryTerms) {
//         if (entry.question.toLowerCase().includes(term)) score += 3
//         if (entry.response.toLowerCase().includes(term)) score += 2
//         if (entry.insights?.some(insight => insight.toLowerCase().includes(term))) score += 1
//       }
      
//       return { entry, score }
//     })
    
//     // Get top relevant entries
//     const relevantEntries = scoredEntries
//       .filter(item => item.score > 0)
//       .sort((a, b) => b.score - a.score)
//       .slice(0, this.config.searchLimit)
//       .map(item => item.entry)
    
//     const recentEntries = entries.slice(-3)
//     const recentExchanges = recentEntries
//       .map(entry => `Q: ${entry.question}\nA: ${entry.response}`)
//       .join('\n\n')

//     return {
//       entries: relevantEntries,
//       summary: this.summaries.get(sessionId) || '',
//       keyInsights: this.extractKeyInsights(relevantEntries),
//       totalEntries: entries.length,
//       recentExchanges
//     }
//   }
// }

// // ============================================================================
// // Factory Function
// // ============================================================================

// export function createLocalMemoryStore(config?: Partial<MemoryStoreConfig>): LocalMemoryStore {
//   return new LocalMemoryStore(config)
// }

// export default LocalMemoryStore