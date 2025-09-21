/**
 * Question Manager - Handles dynamic question management and modification
 * Manages question queue, dependencies, and adaptive questioning based on conversation flow
 */

import {
  InterviewQuestion,
  InterviewTopic,
  ConversationEntry,
  SharedContext,
  ResponseEvaluation
} from '@/types/interview'

interface QuestionMetadata {
  priority: 'high' | 'medium' | 'low'
  dependencies: string[] // Question IDs that should be asked first
  skipConditions: SkipCondition[]
  modificationRules: ModificationRule[]
  timeEstimate: number // in seconds
}

interface SkipCondition {
  type: 'topic_covered' | 'information_provided' | 'time_constraint' | 'low_relevance'
  condition: string // Description of when to skip
  keywords: string[] // Keywords to look for in previous responses
  confidence: number // 0-1, how confident we are in this skip condition
}

interface ModificationRule {
  trigger: 'previous_answer' | 'time_remaining' | 'caliber_score' | 'topic_transition'
  condition: string
  modification: 'add_context' | 'simplify' | 'add_followup' | 'change_focus'
  template: string
}

interface QuestionQueueItem {
  question: InterviewQuestion
  metadata: QuestionMetadata
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'modified'
  originalQuestion?: InterviewQuestion
  skipReason?: string
  modificationHistory: string[]
}

export class QuestionManager {
  private questionQueue: QuestionQueueItem[] = []
  private completedQuestions: QuestionQueueItem[] = []
  private currentQuestionIndex: number = 0
  private timeLimit: number // in seconds
  private startTime: Date

  constructor(timeLimit: number = 600) { // Default 10 minutes
    this.timeLimit = timeLimit
    this.startTime = new Date()
  }

  /**
   * Initialize question queue with initial questions from backend
   */
  async initializeQuestions(context: SharedContext): Promise<void> {
    // Fetch initial questions (mock implementation)
    const initialQuestions = await this.fetchInitialQuestions(context)
    
    // Convert to queue items with metadata
    this.questionQueue = initialQuestions.map(question => ({
      question,
      metadata: this.generateQuestionMetadata(question, context),
      status: 'pending',
      modificationHistory: []
    }))

    // Sort by priority and dependencies
    this.sortQuestionQueue()
  }

  /**
   * Get next question based on conversation flow and time constraints
   */
  async getNextQuestion(context: SharedContext): Promise<InterviewQuestion | null> {
    // Check if we have time for more questions
    const remainingTime = this.getRemainingTime()
    if (remainingTime <= 30) { // Less than 30 seconds remaining
      return null
    }

    // Find next appropriate question
    const nextItem = await this.findNextQuestion(context, remainingTime)
    if (!nextItem) {
      return null
    }

    // Check if question should be skipped
    if (await this.shouldSkipQuestion(nextItem, context)) {
      nextItem.status = 'skipped'
      nextItem.skipReason = 'Topic already covered or not relevant'
      this.completedQuestions.push(nextItem)
      
      // Remove from queue and try next
      this.questionQueue = this.questionQueue.filter(item => item !== nextItem)
      return this.getNextQuestion(context)
    }

    // Modify question based on context
    const modifiedQuestion = await this.modifyQuestionIfNeeded(nextItem, context)
    
    // Mark as active
    nextItem.status = 'active'
    nextItem.question = modifiedQuestion
    
    return modifiedQuestion
  }

  /**
   * Process answer and update question management
   */
  async processAnswer(
    questionId: string, 
    answer: string, 
    evaluation: ResponseEvaluation,
    context: SharedContext
  ): Promise<void> {
    // Find the question in queue
    const questionItem = this.questionQueue.find(item => item.question.id === questionId)
    if (!questionItem) return

    // Mark as completed
    questionItem.status = 'completed'
    this.completedQuestions.push(questionItem)
    
    // Remove from active queue
    this.questionQueue = this.questionQueue.filter(item => item !== questionItem)

    // Analyze answer for follow-up opportunities
    await this.analyzeAnswerForFollowUps(questionItem, answer, evaluation, context)

    // Update remaining questions based on new information
    await this.updateQueueBasedOnAnswer(answer, evaluation, context)

    // Re-prioritize remaining questions
    this.sortQuestionQueue()
  }

  /**
   * Fetch initial questions from backend database (mock implementation)
   */
  private async fetchInitialQuestions(context: SharedContext): Promise<InterviewQuestion[]> {
    // Mock questions based on company sector and stage
    const baseQuestions: InterviewQuestion[] = [
      {
        id: 'company-overview',
        text: `Tell me about ${context.companyData.name} and the problem you're solving.`,
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['problem', 'solution', 'market', 'customers']
      },
      {
        id: 'market-size',
        text: 'What\'s your total addressable market and how did you calculate it?',
        type: 'specific-metric',
        expectedResponseType: 'number',
        importance: 'high',
        followUpTriggers: ['tam', 'market size', 'calculation', 'methodology']
      },
      {
        id: 'competitive-landscape',
        text: 'Who are your main competitors and what\'s your competitive advantage?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['competitors', 'advantage', 'differentiation', 'moat']
      },
      {
        id: 'revenue-metrics',
        text: 'What are your current revenue numbers and growth trajectory?',
        type: 'specific-metric',
        expectedResponseType: 'number',
        importance: 'high',
        followUpTriggers: ['revenue', 'growth', 'mrr', 'arr']
      },
      {
        id: 'team-composition',
        text: 'Tell me about your team and key hires you need to make.',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: ['team', 'hiring', 'roles', 'experience']
      },
      {
        id: 'funding-history',
        text: 'What\'s your funding history and how much are you raising?',
        type: 'specific-metric',
        expectedResponseType: 'number',
        importance: 'high',
        followUpTriggers: ['funding', 'raise', 'investors', 'valuation']
      },
      {
        id: 'customer-traction',
        text: 'Tell me about your customer traction and key metrics.',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['customers', 'traction', 'metrics', 'growth']
      },
      {
        id: 'product-roadmap',
        text: 'What\'s your product roadmap for the next 12-18 months?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: ['roadmap', 'features', 'development', 'timeline']
      },
      {
        id: 'go-to-market',
        text: 'Walk me through your go-to-market strategy.',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['gtm', 'sales', 'marketing', 'channels']
      },
      {
        id: 'challenges-risks',
        text: 'What are the biggest challenges and risks facing your business?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: ['challenges', 'risks', 'obstacles', 'concerns']
      }
    ]

    return baseQuestions
  }

  /**
   * Generate metadata for a question
   */
  private generateQuestionMetadata(question: InterviewQuestion, context: SharedContext): QuestionMetadata {
    return {
      priority: question.importance === 'high' ? 'high' : question.importance === 'medium' ? 'medium' : 'low',
      dependencies: this.determineDependencies(question),
      skipConditions: this.generateSkipConditions(question),
      modificationRules: this.generateModificationRules(question),
      timeEstimate: this.estimateQuestionTime(question)
    }
  }

  /**
   * Determine question dependencies
   */
  private determineDependencies(question: InterviewQuestion): string[] {
    const dependencies: string[] = []
    
    // Revenue questions depend on company overview
    if (question.id === 'revenue-metrics') {
      dependencies.push('company-overview')
    }
    
    // Market questions should come before competitive questions
    if (question.id === 'competitive-landscape') {
      dependencies.push('market-size')
    }
    
    // Team questions can come after traction is established
    if (question.id === 'team-composition') {
      dependencies.push('customer-traction')
    }

    return dependencies
  }

  /**
   * Generate skip conditions for a question
   */
  private generateSkipConditions(question: InterviewQuestion): SkipCondition[] {
    const conditions: SkipCondition[] = []

    // Skip revenue questions if already discussed
    if (question.id === 'revenue-metrics') {
      conditions.push({
        type: 'information_provided',
        condition: 'Revenue numbers already mentioned',
        keywords: ['revenue', '$', 'mrr', 'arr', 'sales'],
        confidence: 0.8
      })
    }

    // Skip team questions if time is running low
    if (question.id === 'team-composition') {
      conditions.push({
        type: 'time_constraint',
        condition: 'Less than 2 minutes remaining',
        keywords: [],
        confidence: 0.9
      })
    }

    return conditions
  }

  /**
   * Generate modification rules for a question
   */
  private generateModificationRules(question: InterviewQuestion): ModificationRule[] {
    const rules: ModificationRule[] = []

    // Add context based on previous answers
    rules.push({
      trigger: 'previous_answer',
      condition: 'Relevant context available',
      modification: 'add_context',
      template: 'Building on what you mentioned about {previous_topic}, {original_question}'
    })

    // Simplify if time is running low
    rules.push({
      trigger: 'time_remaining',
      condition: 'Less than 3 minutes remaining',
      modification: 'simplify',
      template: 'Quickly, {simplified_question}'
    })

    return rules
  }

  /**
   * Estimate time needed for a question
   */
  private estimateQuestionTime(question: InterviewQuestion): number {
    const baseTime = 60 // 1 minute base
    
    if (question.type === 'specific-metric') return baseTime
    if (question.importance === 'high') return baseTime * 1.5
    if (question.type === 'open-ended') return baseTime * 2
    
    return baseTime
  }

  /**
   * Sort question queue by priority and dependencies
   */
  private sortQuestionQueue(): void {
    this.questionQueue.sort((a, b) => {
      // First, sort by dependencies (questions with satisfied dependencies first)
      const aDepsCompleted = this.areDependenciesCompleted(a.metadata.dependencies)
      const bDepsCompleted = this.areDependenciesCompleted(b.metadata.dependencies)
      
      if (aDepsCompleted && !bDepsCompleted) return -1
      if (!aDepsCompleted && bDepsCompleted) return 1
      
      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.metadata.priority]
      const bPriority = priorityOrder[b.metadata.priority]
      
      return bPriority - aPriority
    })
  }

  /**
   * Check if dependencies are completed
   */
  private areDependenciesCompleted(dependencies: string[]): boolean {
    return dependencies.every(depId => 
      this.completedQuestions.some(item => item.question.id === depId)
    )
  }

  /**
   * Find next appropriate question
   */
  private async findNextQuestion(context: SharedContext, remainingTime: number): Promise<QuestionQueueItem | null> {
    for (const item of this.questionQueue) {
      // Check if dependencies are satisfied
      if (!this.areDependenciesCompleted(item.metadata.dependencies)) {
        continue
      }
      
      // Check if we have enough time
      if (item.metadata.timeEstimate > remainingTime) {
        continue
      }
      
      return item
    }
    
    return null
  }

  /**
   * Check if question should be skipped
   */
  private async shouldSkipQuestion(item: QuestionQueueItem, context: SharedContext): Promise<boolean> {
    for (const condition of item.metadata.skipConditions) {
      if (await this.evaluateSkipCondition(condition, context)) {
        return true
      }
    }
    return false
  }

  /**
   * Evaluate a skip condition
   */
  private async evaluateSkipCondition(condition: SkipCondition, context: SharedContext): Promise<boolean> {
    switch (condition.type) {
      case 'information_provided':
        return this.checkInformationAlreadyProvided(condition.keywords, context)
      
      case 'time_constraint':
        return this.getRemainingTime() < 120 // Less than 2 minutes
      
      case 'topic_covered':
        return this.checkTopicAlreadyCovered(condition.keywords, context)
      
      default:
        return false
    }
  }

  /**
   * Check if information was already provided in previous answers
   */
  private checkInformationAlreadyProvided(keywords: string[], context: SharedContext): boolean {
    const conversationText = context.conversationHistory
      .map(entry => entry.response)
      .join(' ')
      .toLowerCase()

    return keywords.some(keyword => conversationText.includes(keyword.toLowerCase()))
  }

  /**
   * Check if topic was already covered
   */
  private checkTopicAlreadyCovered(keywords: string[], context: SharedContext): boolean {
    // Similar to information provided, but with higher threshold
    const conversationText = context.conversationHistory
      .map(entry => `${entry.question} ${entry.response}`)
      .join(' ')
      .toLowerCase()

    const keywordMatches = keywords.filter(keyword => 
      conversationText.includes(keyword.toLowerCase())
    ).length

    return keywordMatches >= keywords.length * 0.7 // 70% of keywords must be present
  }

  /**
   * Modify question if needed based on context
   */
  private async modifyQuestionIfNeeded(item: QuestionQueueItem, context: SharedContext): Promise<InterviewQuestion> {
    let modifiedQuestion = { ...item.question }
    
    for (const rule of item.metadata.modificationRules) {
      if (await this.shouldApplyModification(rule, context)) {
        modifiedQuestion = this.applyModification(modifiedQuestion, rule, context)
        item.modificationHistory.push(`Applied ${rule.modification}: ${rule.condition}`)
      }
    }
    
    return modifiedQuestion
  }

  /**
   * Check if modification should be applied
   */
  private async shouldApplyModification(rule: ModificationRule, context: SharedContext): Promise<boolean> {
    switch (rule.trigger) {
      case 'time_remaining':
        return this.getRemainingTime() < 180 // Less than 3 minutes
      
      case 'previous_answer':
        return context.conversationHistory.length > 0
      
      case 'caliber_score':
        return context.caliberMetrics?.overall ? context.caliberMetrics.overall < 60 : false
      
      default:
        return false
    }
  }

  /**
   * Apply modification to question
   */
  private applyModification(question: InterviewQuestion, rule: ModificationRule, context: SharedContext): InterviewQuestion {
    let modifiedText = question.text
    
    switch (rule.modification) {
      case 'add_context':
        if (context.conversationHistory.length > 0) {
          const lastTopic = this.extractTopicFromLastQuestion(context.conversationHistory)
          modifiedText = rule.template
            .replace('{previous_topic}', lastTopic)
            .replace('{original_question}', question.text.toLowerCase())
        }
        break
      
      case 'simplify':
        modifiedText = rule.template.replace('{simplified_question}', this.simplifyQuestion(question.text))
        break
      
      case 'add_followup':
        modifiedText += ' Can you give me a specific example?'
        break
    }
    
    return {
      ...question,
      text: modifiedText,
      contextData: {
        ...question.contextData,
        modified: true,
        modificationApplied: rule.modification
      }
    }
  }

  /**
   * Extract topic from last question
   */
  private extractTopicFromLastQuestion(history: ConversationEntry[]): string {
    if (history.length === 0) return 'your background'
    
    const lastQuestion = history[history.length - 1].question.toLowerCase()
    
    if (lastQuestion.includes('market')) return 'market opportunity'
    if (lastQuestion.includes('team')) return 'team dynamics'
    if (lastQuestion.includes('revenue')) return 'financial metrics'
    if (lastQuestion.includes('product')) return 'product development'
    
    return 'what you shared'
  }

  /**
   * Simplify question text
   */
  private simplifyQuestion(questionText: string): string {
    // Remove complex phrases and make more direct
    return questionText
      .replace(/tell me about/gi, 'what is')
      .replace(/walk me through/gi, 'explain')
      .replace(/can you elaborate on/gi, 'what about')
      .replace(/i\'d like to understand/gi, 'explain')
  }

  /**
   * Analyze answer for follow-up opportunities
   */
  private async analyzeAnswerForFollowUps(
    questionItem: QuestionQueueItem,
    answer: string,
    evaluation: ResponseEvaluation,
    context: SharedContext
  ): Promise<void> {
    // If answer was incomplete or raised new questions
    if (evaluation.followUpNeeded && evaluation.suggestedFollowUps.length > 0) {
      // Add follow-up questions to queue
      evaluation.suggestedFollowUps.forEach((followUpText, index) => {
        const followUpQuestion: InterviewQuestion = {
          id: `${questionItem.question.id}-followup-${index}`,
          text: followUpText,
          type: 'follow-up',
          expectedResponseType: 'text',
          importance: 'medium',
          followUpTriggers: []
        }
        
        const followUpItem: QuestionQueueItem = {
          question: followUpQuestion,
          metadata: {
            priority: 'medium',
            dependencies: [questionItem.question.id],
            skipConditions: [],
            modificationRules: [],
            timeEstimate: 45
          },
          status: 'pending',
          modificationHistory: []
        }
        
        // Insert at beginning of queue for immediate consideration
        this.questionQueue.unshift(followUpItem)
      })
    }
  }

  /**
   * Update question queue based on new answer
   */
  private async updateQueueBasedOnAnswer(
    answer: string,
    evaluation: ResponseEvaluation,
    context: SharedContext
  ): Promise<void> {
    const answerLower = answer.toLowerCase()
    
    // If founder mentioned specific topics, adjust priorities
    if (answerLower.includes('funding') || answerLower.includes('raise')) {
      this.boostQuestionPriority('funding-history')
    }
    
    if (answerLower.includes('team') || answerLower.includes('hire')) {
      this.boostQuestionPriority('team-composition')
    }
    
    if (answerLower.includes('customer') || answerLower.includes('traction')) {
      this.boostQuestionPriority('customer-traction')
    }
  }

  /**
   * Boost priority of a specific question
   */
  private boostQuestionPriority(questionId: string): void {
    const item = this.questionQueue.find(item => item.question.id === questionId)
    if (item && item.metadata.priority !== 'high') {
      item.metadata.priority = 'high'
      this.sortQuestionQueue()
    }
  }

  /**
   * Get remaining time in seconds
   */
  private getRemainingTime(): number {
    const elapsed = (Date.now() - this.startTime.getTime()) / 1000
    return Math.max(0, this.timeLimit - elapsed)
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus(): {
    totalQuestions: number
    completedQuestions: number
    remainingQuestions: number
    skippedQuestions: number
    estimatedTimeRemaining: number
    currentPriorities: string[]
  } {
    const completed = this.completedQuestions.filter(item => item.status === 'completed').length
    const skipped = this.completedQuestions.filter(item => item.status === 'skipped').length
    const remaining = this.questionQueue.length
    
    const estimatedTime = this.questionQueue
      .slice(0, 5) // Next 5 questions
      .reduce((total, item) => total + item.metadata.timeEstimate, 0)
    
    const priorities = this.questionQueue
      .slice(0, 3) // Next 3 questions
      .map(item => `${item.question.id} (${item.metadata.priority})`)

    return {
      totalQuestions: completed + skipped + remaining,
      completedQuestions: completed,
      remainingQuestions: remaining,
      skippedQuestions: skipped,
      estimatedTimeRemaining: estimatedTime,
      currentPriorities: priorities
    }
  }

  /**
   * Force skip a question
   */
  skipQuestion(questionId: string, reason: string): boolean {
    const item = this.questionQueue.find(item => item.question.id === questionId)
    if (item) {
      item.status = 'skipped'
      item.skipReason = reason
      this.completedQuestions.push(item)
      this.questionQueue = this.questionQueue.filter(item => item.question.id !== questionId)
      return true
    }
    return false
  }

  /**
   * Add custom question to queue
   */
  addCustomQuestion(question: InterviewQuestion, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const item: QuestionQueueItem = {
      question,
      metadata: {
        priority,
        dependencies: [],
        skipConditions: [],
        modificationRules: [],
        timeEstimate: 60
      },
      status: 'pending',
      modificationHistory: []
    }
    
    if (priority === 'high') {
      this.questionQueue.unshift(item)
    } else {
      this.questionQueue.push(item)
    }
    
    this.sortQuestionQueue()
  }
}