/**
 * Interviewer Agent - Main agent that conducts the interview with investor persona
 * Handles question generation, response evaluation, and topic transitions
 */

import { BaseAgentImpl } from './base-agent'
import {
  InterviewerAgent,
  InvestorPersona,
  SharedContext,
  InterviewQuestion,
  ResponseEvaluation,
  Insight
} from '@/types/interview'

export class InterviewerAgentImpl extends BaseAgentImpl implements InterviewerAgent {
  public readonly type = 'interviewer' as const
  public readonly persona: InvestorPersona

  constructor(id: string = 'interviewer-001') {
    super(id, 'interviewer')
    
    // Default investor persona - can be customized
    this.persona = {
      name: "Alex Chen",
      background: "Former founder turned VC partner with 15 years experience in B2B SaaS and AI/ML investments",
      investmentFocus: ["B2B SaaS", "Fintech", "AI/ML", "Enterprise Software"],
      questioningStyle: "conversational",
      experienceLevel: "partner",
      specialties: ["go-to-market strategy", "product-market fit", "scaling teams", "enterprise sales"]
    }
  }

  /**
   * Generate contextual interview question based on shared context
   */
  async generateQuestion(context: SharedContext): Promise<InterviewQuestion> {
    this.updateStatus('thinking', 'Generating contextual question')
    this.logActivity('Generating question', {
      currentTopic: context.session.currentTopic.name,
      questionIndex: context.session.progress.currentQuestionIndex,
      founderName: context.founderProfile.name,
      companyName: context.companyData.name
    })

    try {
      await this.simulateProcessing(800, 1200)

      // Get initial questions from mock database
      const initialQuestions = await this.fetchInitialQuestions(context)
      
      // Apply dynamic modification based on previous answers
      const modifiedQuestion = await this.modifyQuestionBasedOnContext(initialQuestions, context)
      
      this.updateStatus('idle')
      return modifiedQuestion

    } catch (error) {
      this.handleError(error as Error, 'generateQuestion')
      throw error
    }
  }

  /**
   * Evaluate founder's response quality and completeness
   */
  async evaluateResponse(response: string): Promise<ResponseEvaluation> {
    this.updateStatus('processing', 'Evaluating response quality')
    this.logActivity('Evaluating response', { responseLength: response.length })

    try {
      await this.simulateProcessing(600, 1000)

      // Analyze response quality
      const quality = this.assessResponseQuality(response)
      const completeness = this.assessResponseCompleteness(response)
      const credibility = this.assessResponseCredibility(response)
      
      // Extract insights from response
      const insights = this.extractResponseInsights(response)
      
      // Determine if follow-up is needed
      const followUpNeeded = completeness < 70 || quality < 60
      const suggestedFollowUps = followUpNeeded ? this.generateFollowUpQuestions(response) : []

      const evaluation: ResponseEvaluation = {
        quality,
        completeness,
        credibility,
        insights,
        followUpNeeded,
        suggestedFollowUps
      }

      this.updateStatus('idle')
      return evaluation

    } catch (error) {
      this.handleError(error as Error, 'evaluateResponse')
      throw error
    }
  }

  /**
   * Transition to new topic based on current insights
   */
  async transitionTopic(currentTopic: string, insights: Insight[]): Promise<string> {
    this.updateStatus('thinking', 'Planning topic transition')
    this.logActivity('Transitioning topic', { currentTopic, insightCount: insights.length })

    try {
      await this.simulateProcessing(400, 800)

      // Analyze insights to determine best next topic
      const nextTopic = this.selectNextTopic(currentTopic, insights)
      
      this.updateStatus('idle')
      return nextTopic

    } catch (error) {
      this.handleError(error as Error, 'transitionTopic')
      throw error
    }
  }

  /**
   * Fetch initial questions from backend database (mock implementation)
   */
  private async fetchInitialQuestions(context: SharedContext): Promise<InterviewQuestion[]> {
    // Mock database call - replace with actual backend integration
    const mockQuestions: InterviewQuestion[] = [
      {
        id: 'q1',
        text: `Tell me about ${context.companyData.name} and what problem you're solving.`,
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['market size', 'customer pain', 'solution approach']
      },
      {
        id: 'q2',
        text: 'What\'s your total addressable market and how did you calculate it?',
        type: 'specific-metric',
        expectedResponseType: 'number',
        importance: 'high',
        followUpTriggers: ['methodology', 'assumptions', 'market segments']
      },
      {
        id: 'q3',
        text: 'Who are your main competitors and what\'s your competitive advantage?',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'high',
        followUpTriggers: ['differentiation', 'moat', 'competitive response']
      },
      {
        id: 'q4',
        text: 'What are your current revenue numbers and growth trajectory?',
        type: 'specific-metric',
        expectedResponseType: 'number',
        importance: 'high',
        followUpTriggers: ['revenue model', 'growth drivers', 'unit economics']
      },
      {
        id: 'q5',
        text: 'Tell me about your team and key hires you need to make.',
        type: 'open-ended',
        expectedResponseType: 'text',
        importance: 'medium',
        followUpTriggers: ['team gaps', 'hiring plan', 'culture']
      }
    ]

    return mockQuestions
  }

  /**
   * Modify questions based on conversation context and previous answers
   */
  private async modifyQuestionBasedOnContext(
    questions: InterviewQuestion[], 
    context: SharedContext
  ): Promise<InterviewQuestion> {
    const currentIndex = context.session.progress.currentQuestionIndex
    const baseQuestion = questions[currentIndex % questions.length]
    
    // Check if topic was already covered in previous answers
    const alreadyCovered = this.checkIfTopicCovered(baseQuestion, context.conversationHistory)
    
    if (alreadyCovered) {
      // Skip to follow-up or modify question
      return this.generateFollowUpQuestion(baseQuestion, context)
    }

    // Inject context from RAG data
    if (context.ragData) {
      return this.injectContextIntoQuestion(baseQuestion, context)
    }

    return baseQuestion
  }

  /**
   * Check if question topic was already covered in conversation
   */
  private checkIfTopicCovered(question: InterviewQuestion, conversationHistory: any[]): boolean {
    // Simple keyword matching - can be enhanced with semantic analysis
    const questionKeywords = question.followUpTriggers
    const conversationText = conversationHistory
      .map(entry => entry.response || '')
      .join(' ')
      .toLowerCase()

    return questionKeywords.some(keyword => 
      conversationText.includes(keyword.toLowerCase())
    )
  }

  /**
   * Generate follow-up question when main topic is covered
   */
  private generateFollowUpQuestion(baseQuestion: InterviewQuestion, context: SharedContext): InterviewQuestion {
    const followUpTexts = [
      `You mentioned ${context.companyData.name} earlier. Can you dive deeper into the specific metrics around that?`,
      `That's interesting about your approach. What challenges have you faced implementing this?`,
      `How do you see this evolving over the next 12-18 months?`,
      `What would you do differently if you were starting over?`
    ]

    return {
      ...baseQuestion,
      id: `${baseQuestion.id}-followup`,
      text: followUpTexts[Math.floor(Math.random() * followUpTexts.length)],
      type: 'follow-up'
    }
  }

  /**
   * Inject RAG context into question to make it more specific
   */
  private injectContextIntoQuestion(question: InterviewQuestion, context: SharedContext): InterviewQuestion {
    let enhancedText = question.text

    // Inject company-specific context
    if (context.ragData.publicData?.market) {
      const marketData = context.ragData.publicData.market
      enhancedText = enhancedText.replace(
        'market',
        `${marketData.size} market that's growing at ${marketData.growth}`
      )
    }

    // Inject competitor context
    if (context.ragData.publicData?.competitors?.length) {
      const competitors = context.ragData.publicData.competitors.slice(0, 2)
      enhancedText += ` I see companies like ${competitors.map(c => c.name).join(' and ')} in this space.`
    }

    return {
      ...question,
      text: enhancedText,
      contextData: {
        ragDataUsed: true,
        marketData: context.ragData.publicData?.market,
        competitors: context.ragData.publicData?.competitors
      }
    }
  }

  /**
   * Assess response quality based on various factors
   */
  private assessResponseQuality(response: string): number {
    let score = 50 // Base score

    // Length assessment
    if (response.length > 200) score += 20
    else if (response.length > 100) score += 10

    // Specificity indicators
    const specificityIndicators = [
      /\$[\d,]+/, // Dollar amounts
      /\d+%/, // Percentages
      /\d+\s*(months?|years?|weeks?)/, // Time periods
      /\d+\s*(customers?|users?|clients?)/, // Numbers
    ]
    
    specificityIndicators.forEach(pattern => {
      if (pattern.test(response)) score += 5
    })

    // Confidence indicators
    const confidenceIndicators = ['we have', 'we\'ve achieved', 'our data shows', 'we\'ve proven']
    confidenceIndicators.forEach(indicator => {
      if (response.toLowerCase().includes(indicator)) score += 3
    })

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Assess response completeness
   */
  private assessResponseCompleteness(response: string): number {
    let score = 60 // Base score

    // Check for key components
    const components = [
      { pattern: /because|since|due to/, points: 15 }, // Reasoning
      { pattern: /for example|such as|like/, points: 10 }, // Examples
      { pattern: /\d+/, points: 10 }, // Numbers/metrics
      { pattern: /we plan|we will|next/, points: 10 }, // Future plans
      { pattern: /challenge|difficult|problem/, points: 5 } // Acknowledges challenges
    ]

    components.forEach(({ pattern, points }) => {
      if (pattern.test(response.toLowerCase())) score += points
    })

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Assess response credibility
   */
  private assessResponseCredibility(response: string): number {
    let score = 60 // Base score

    // Positive indicators
    const positiveIndicators = [
      { pattern: /data shows|metrics indicate/, points: 15 },
      { pattern: /customer feedback|user research/, points: 10 },
      { pattern: /we tested|we validated/, points: 10 },
      { pattern: /according to|based on/, points: 5 }
    ]

    // Negative indicators
    const negativeIndicators = [
      { pattern: /i think|i believe|probably/, points: -10 },
      { pattern: /everyone|nobody|always|never/, points: -15 },
      { pattern: /huge|massive|incredible/, points: -5 }
    ]

    positiveIndicators.forEach(({ pattern, points }) => {
      if (pattern.test(response.toLowerCase())) score += points
    })

    negativeIndicators.forEach(({ pattern, points }) => {
      if (pattern.test(response.toLowerCase())) score += points
    })

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Extract insights from response
   */
  private extractResponseInsights(response: string): string[] {
    const insights: string[] = []

    // Extract metrics mentioned
    const metrics = response.match(/\$[\d,]+|\d+%|\d+\s*(customers?|users?|months?)/g)
    if (metrics) {
      insights.push(`Mentioned specific metrics: ${metrics.join(', ')}`)
    }

    // Extract challenges mentioned
    const challengeKeywords = ['challenge', 'difficult', 'struggle', 'problem', 'issue']
    challengeKeywords.forEach(keyword => {
      if (response.toLowerCase().includes(keyword)) {
        insights.push(`Acknowledged challenges related to ${keyword}`)
      }
    })

    // Extract confidence indicators
    const confidenceKeywords = ['confident', 'proven', 'validated', 'successful']
    confidenceKeywords.forEach(keyword => {
      if (response.toLowerCase().includes(keyword)) {
        insights.push(`Shows confidence in ${keyword} approach`)
      }
    })

    return insights
  }

  /**
   * Generate follow-up questions based on response
   */
  private generateFollowUpQuestions(response: string): string[] {
    const followUps: string[] = []

    // If metrics mentioned, ask for more detail
    if (/\d+/.test(response)) {
      followUps.push("Can you break down those numbers and how you calculated them?")
    }

    // If challenges mentioned, probe deeper
    if (/challenge|difficult|problem/.test(response.toLowerCase())) {
      followUps.push("What specific steps are you taking to address those challenges?")
    }

    // If vague, ask for specifics
    if (response.length < 100) {
      followUps.push("Can you give me a specific example of that?")
    }

    return followUps
  }

  /**
   * Select next topic based on current insights
   */
  private selectNextTopic(currentTopic: string, insights: Insight[]): string {
    const topicFlow = {
      'company-overview': 'market-analysis',
      'market-analysis': 'competitive-landscape',
      'competitive-landscape': 'business-model',
      'business-model': 'team-dynamics',
      'team-dynamics': 'financial-metrics',
      'financial-metrics': 'growth-strategy',
      'growth-strategy': 'risk-assessment'
    }

    // Check if we have concerning insights that need immediate attention
    const concerns = insights.filter(i => i.type === 'concern')
    if (concerns.length > 0) {
      return 'risk-assessment'
    }

    // Follow normal flow
    return topicFlow[currentTopic as keyof typeof topicFlow] || 'wrap-up'
  }
}