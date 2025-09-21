/**
 * Base agent implementation for the multi-agent interview system
 * Provides common functionality for all specialized agents
 */

import { BaseAgent } from '@/types/interview'

export abstract class BaseAgentImpl implements BaseAgent {
  public readonly id: string
  public readonly type: string
  public status: BaseAgent['status'] = 'idle'
  public lastActivity: Date = new Date()
  public currentTask?: string

  constructor(id: string, type: string) {
    this.id = id
    this.type = type
  }

  /**
   * Update agent status and activity timestamp
   */
  protected updateStatus(status: BaseAgent['status'], task?: string): void {
    this.status = status
    this.lastActivity = new Date()
    this.currentTask = task
  }

  /**
   * Log agent activity for monitoring
   */
  protected logActivity(activity: string, data?: Record<string, unknown>): void {
    console.log(`[${this.type.toUpperCase()}] ${activity}`, {
      agentId: this.id,
      timestamp: new Date().toISOString(),
      task: this.currentTask,
      ...data
    })
  }

  /**
   * Handle errors consistently across agents
   */
  protected handleError(error: Error, context?: string): void {
    this.updateStatus('error')
    console.error(`[${this.type.toUpperCase()}] Error${context ? ` in ${context}` : ''}:`, error)
  }

  /**
   * Simulate processing delay for demo purposes
   */
  protected async simulateProcessing(minMs: number = 500, maxMs: number = 1500): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}