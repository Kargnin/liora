/**
 * Analyst Agent - Evaluates founder caliber and investment potential in real-time
 * Handles caliber assessment, red flag detection, and investment scoring
 */

import { BaseAgentImpl } from './base-agent'
import {
  AnalystAgent,
  SharedContext,
  CaliberMetrics,
  CaliberCategory,
  RedFlag,
  FounderInsight,
  InvestmentScore,
  ConversationEntry,
  InterviewSession
} from '@/types/interview'

export class AnalystAgentImpl extends BaseAgentImpl implements AnalystAgent {
  public readonly type = 'analyst' as const

  constructor(id: string = 'analyst-001') {
    super(id, 'analyst')
  }

  /**
   * Assess founder caliber metrics based on response and context
   */
  async assessCaliberMetrics(response: string, context: SharedContext): Promise<CaliberMetrics> {
    this.updateStatus('processing', 'Assessing founder caliber')
    this.logActivity('Assessing caliber metrics', {
      responseLength: response.length,
      currentTopic: context.session.currentTopic.name
    })

    try {
      await this.simulateProcessing(1000, 1500)

      // Assess each caliber category
      const communication = await this.assessCommunication(response, context)
      const leadership = await this.assessLeadership(response, context)
      const marketKnowledge = await this.assessMarketKnowledge(response, context)
      const strategicThinking = await this.assessStrategicThinking(response, context)
      const resilience = await this.assessResilience(response, context)
      const businessAcumen = await this.assessBusinessAcumen(response, context)

      // Calculate overall score
      const categories = {
        communication,
        leadership,
        marketKnowledge,
        strategicThinking,
        resilience,
        businessAcumen
      }

      const overall = this.calculateOverallScore(categories)

      // Detect red flags, strengths, and concerns
      const redFlags = await this.detectRedFlags(response, context)
      const strengths = this.identifyStrengths(categories, response)
      const concerns = this.identifyConcerns(categories, response)

      const metrics: CaliberMetrics = {
        overall,
        categories,
        redFlags,
        strengths,
        concerns
      }

      this.updateStatus('idle')
      return metrics

    } catch (error) {
      this.handleError(error as Error, 'assessCaliberMetrics')
      throw error
    }
  }

  /**
   * Identify red flags in conversation history
   */
  async identifyRedFlags(conversationHistory: ConversationEntry[]): Promise<RedFlag[]> {
    this.updateStatus('processing', 'Identifying red flags')
    this.logActivity('Identifying red flags', { historyLength: conversationHistory.length })

    try {
      await this.simulateProcessing(600, 1000)

      const redFlags: RedFlag[] = []
      const conversationText = conversationHistory
        .map(entry => entry.response)
        .join(' ')
        .toLowerCase()

      // Financial red flags
      const financialFlags = this.detectFinancialRedFlags(conversationText)
      redFlags.push(...financialFlags)

      // Market red flags
      const marketFlags = this.detectMarketRedFlags(conversationText)
      redFlags.push(...marketFlags)

      // Team red flags
      const teamFlags = this.detectTeamRedFlags(conversationText)
      redFlags.push(...teamFlags)

      // Product red flags
      const productFlags = this.detectProductRedFlags(conversationText)
      redFlags.push(...productFlags)

      this.updateStatus('idle')
      return redFlags

    } catch (error) {
      this.handleError(error as Error, 'identifyRedFlags')
      throw error
    }
  }

  /**
   * Generate insights about the founder
   */
  async generateInsights(responses: string[]): Promise<FounderInsight[]> {
    this.updateStatus('thinking', 'Generating founder insights')
    this.logActivity('Generating insights', { responseCount: responses.length })

    try {
      await this.simulateProcessing(800, 1200)

      const insights: FounderInsight[] = []
      const combinedText = responses.join(' ').toLowerCase()

      // Leadership insights
      if (this.detectLeadershipIndicators(combinedText)) {
        insights.push({
          founderId: 'current-founder',
          category: 'leadership',
          insight: 'Demonstrates strong leadership qualities through clear communication and decision-making examples',
          evidence: this.extractLeadershipEvidence(responses),
          timestamp: new Date(),
          confidence: 0.8
        })
      }

      // Market knowledge insights
      if (this.detectMarketExpertise(combinedText)) {
        insights.push({
          founderId: 'current-founder',
          category: 'market-knowledge',
          insight: 'Shows deep understanding of market dynamics and competitive landscape',
          evidence: this.extractMarketEvidence(responses),
          timestamp: new Date(),
          confidence: 0.75
        })
      }

      // Resilience insights
      if (this.detectResilienceIndicators(combinedText)) {
        insights.push({
          founderId: 'current-founder',
          category: 'resilience',
          insight: 'Demonstrates ability to handle challenges and adapt to changing circumstances',
          evidence: this.extractResilienceEvidence(responses),
          timestamp: new Date(),
          confidence: 0.7
        })
      }

      this.updateStatus('idle')
      return insights

    } catch (error) {
      this.handleError(error as Error, 'generateInsights')
      throw error
    }
  }

  /**
   * Calculate investment potential score
   */
  async calculateInvestmentPotential(session: InterviewSession): Promise<InvestmentScore> {
    this.updateStatus('processing', 'Calculating investment potential')
    this.logActivity('Calculating investment score', { sessionId: session.id })

    try {
      await this.simulateProcessing(1000, 1500)

      const caliberMetrics = session.sessionData.founderInsights
      const companyInsights = session.sessionData.companyInsights

      // Score different categories
      const market = this.scoreMarketPotential(companyInsights.marketAnalysis)
      const product = this.scoreProductPotential(companyInsights.businessModel)
      const team = this.scoreTeamPotential(caliberMetrics.leadership, caliberMetrics.experience)
      const traction = this.scoreTraction(companyInsights.financialMetrics)
      const financials = this.scoreFinancials(companyInsights.financialMetrics)

      const categories = { market, product, team, traction, financials }
      const overall = this.calculateOverallInvestmentScore(categories)
      
      const recommendation = this.determineRecommendation(overall, session.sessionData.redFlags)
      const reasoning = this.generateRecommendationReasoning(categories, recommendation)

      const score: InvestmentScore = {
        overall,
        categories,
        recommendation,
        reasoning
      }

      this.updateStatus('idle')
      return score

    } catch (error) {
      this.handleError(error as Error, 'calculateInvestmentPotential')
      throw error
    }
  }

  /**
   * Assess communication skills
   */
  private async assessCommunication(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      clarity: this.assessClarity(response),
      articulation: this.assessArticulation(response),
      confidence: this.assessConfidence(response),
      persuasiveness: this.assessPersuasiveness(response)
    }

    const score = (indicators.clarity + indicators.articulation + indicators.confidence + indicators.persuasiveness) / 4
    
    return {
      score,
      confidence: 0.8,
      evidence: [
        `Clarity score: ${indicators.clarity}`,
        `Articulation score: ${indicators.articulation}`,
        `Confidence indicators present: ${indicators.confidence > 70}`
      ],
      keyIndicators: this.extractCommunicationIndicators(response)
    }
  }

  /**
   * Assess leadership qualities
   */
  private async assessLeadership(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      vision: this.assessVision(response),
      decisionMaking: this.assessDecisionMaking(response),
      teamBuilding: this.assessTeamBuilding(response),
      accountability: this.assessAccountability(response)
    }

    const score = (indicators.vision + indicators.decisionMaking + indicators.teamBuilding + indicators.accountability) / 4

    return {
      score,
      confidence: 0.75,
      evidence: [
        `Vision clarity: ${indicators.vision > 70 ? 'Strong' : 'Needs development'}`,
        `Decision-making examples: ${indicators.decisionMaking > 60 ? 'Present' : 'Limited'}`,
        `Team building focus: ${indicators.teamBuilding > 50 ? 'Evident' : 'Not clear'}`
      ],
      keyIndicators: this.extractLeadershipIndicators(response)
    }
  }

  /**
   * Assess market knowledge
   */
  private async assessMarketKnowledge(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      industryUnderstanding: this.assessIndustryKnowledge(response, context),
      competitiveAwareness: this.assessCompetitiveAwareness(response),
      marketSizing: this.assessMarketSizing(response),
      trends: this.assessTrendAwareness(response)
    }

    const score = (indicators.industryUnderstanding + indicators.competitiveAwareness + indicators.marketSizing + indicators.trends) / 4

    return {
      score,
      confidence: 0.7,
      evidence: [
        `Industry knowledge depth: ${indicators.industryUnderstanding}`,
        `Competitive awareness: ${indicators.competitiveAwareness}`,
        `Market sizing approach: ${indicators.marketSizing > 60 ? 'Data-driven' : 'Needs improvement'}`
      ],
      keyIndicators: this.extractMarketKnowledgeIndicators(response)
    }
  }

  /**
   * Assess strategic thinking
   */
  private async assessStrategicThinking(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      longTermPlanning: this.assessLongTermThinking(response),
      problemSolving: this.assessProblemSolving(response),
      prioritization: this.assessPrioritization(response),
      systemsThinking: this.assessSystemsThinking(response)
    }

    const score = (indicators.longTermPlanning + indicators.problemSolving + indicators.prioritization + indicators.systemsThinking) / 4

    return {
      score,
      confidence: 0.65,
      evidence: [
        `Long-term planning: ${indicators.longTermPlanning > 60 ? 'Present' : 'Limited'}`,
        `Problem-solving approach: ${indicators.problemSolving}`,
        `Prioritization skills: ${indicators.prioritization > 50 ? 'Evident' : 'Unclear'}`
      ],
      keyIndicators: this.extractStrategicThinkingIndicators(response)
    }
  }

  /**
   * Assess resilience and adaptability
   */
  private async assessResilience(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      challengeHandling: this.assessChallengeHandling(response),
      adaptability: this.assessAdaptability(response),
      persistence: this.assessPersistence(response),
      learningOrientation: this.assessLearningOrientation(response)
    }

    const score = (indicators.challengeHandling + indicators.adaptability + indicators.persistence + indicators.learningOrientation) / 4

    return {
      score,
      confidence: 0.6,
      evidence: [
        `Challenge handling: ${indicators.challengeHandling > 60 ? 'Strong' : 'Developing'}`,
        `Adaptability: ${indicators.adaptability}`,
        `Learning orientation: ${indicators.learningOrientation > 50 ? 'Present' : 'Limited'}`
      ],
      keyIndicators: this.extractResilienceIndicators(response)
    }
  }

  /**
   * Assess business acumen
   */
  private async assessBusinessAcumen(response: string, context: SharedContext): Promise<CaliberCategory> {
    const indicators = {
      financialLiteracy: this.assessFinancialLiteracy(response),
      operationalExcellence: this.assessOperationalThinking(response),
      customerFocus: this.assessCustomerFocus(response),
      scalabilityAwareness: this.assessScalabilityThinking(response)
    }

    const score = (indicators.financialLiteracy + indicators.operationalExcellence + indicators.customerFocus + indicators.scalabilityAwareness) / 4

    return {
      score,
      confidence: 0.75,
      evidence: [
        `Financial literacy: ${indicators.financialLiteracy}`,
        `Operational thinking: ${indicators.operationalExcellence}`,
        `Customer focus: ${indicators.customerFocus > 60 ? 'Strong' : 'Needs development'}`
      ],
      keyIndicators: this.extractBusinessAcumenIndicators(response)
    }
  }

  // Helper methods for assessment
  private assessClarity(response: string): number {
    let score = 50
    if (response.length > 100) score += 20
    if (/because|since|therefore|as a result/.test(response.toLowerCase())) score += 15
    if (response.split('.').length > 2) score += 10
    return Math.min(100, score)
  }

  private assessArticulation(response: string): number {
    let score = 60
    const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 0)
    if (sentences.length > 3) score += 15
    if (/specifically|particularly|for example/.test(response.toLowerCase())) score += 10
    if (response.includes(',')) score += 5
    return Math.min(100, score)
  }

  private assessConfidence(response: string): number {
    let score = 50
    const confidenceIndicators = ['we have', 'we\'ve achieved', 'i\'m confident', 'we know', 'proven']
    const uncertaintyIndicators = ['i think', 'maybe', 'probably', 'not sure', 'i believe']
    
    confidenceIndicators.forEach(indicator => {
      if (response.toLowerCase().includes(indicator)) score += 10
    })
    
    uncertaintyIndicators.forEach(indicator => {
      if (response.toLowerCase().includes(indicator)) score -= 8
    })
    
    return Math.max(0, Math.min(100, score))
  }

  private assessPersuasiveness(response: string): number {
    let score = 40
    if (/data shows|research indicates|studies prove/.test(response.toLowerCase())) score += 20
    if (/customer|client|user/.test(response.toLowerCase())) score += 10
    if (/\d+%|\$[\d,]+/.test(response)) score += 15
    return Math.min(100, score)
  }

  private assessVision(response: string): number {
    let score = 40
    if (/future|vision|long.term|years from now/.test(response.toLowerCase())) score += 20
    if (/transform|change|revolutionize|impact/.test(response.toLowerCase())) score += 15
    if (/we see|we envision|our goal/.test(response.toLowerCase())) score += 10
    return Math.min(100, score)
  }

  private assessDecisionMaking(response: string): number {
    let score = 50
    if (/decided|chose|selected|prioritized/.test(response.toLowerCase())) score += 15
    if (/because|rationale|reason/.test(response.toLowerCase())) score += 10
    if (/data.driven|analysis|evaluated/.test(response.toLowerCase())) score += 15
    return Math.min(100, score)
  }

  private assessTeamBuilding(response: string): number {
    let score = 40
    if (/team|hire|recruit|culture/.test(response.toLowerCase())) score += 20
    if (/we|our team|together/.test(response.toLowerCase())) score += 10
    if (/leadership|manage|lead/.test(response.toLowerCase())) score += 10
    return Math.min(100, score)
  }

  private assessAccountability(response: string): number {
    let score = 50
    if (/responsible|accountable|my fault|i made/.test(response.toLowerCase())) score += 15
    if (/learned|mistake|improve/.test(response.toLowerCase())) score += 10
    return Math.min(100, score)
  }

  // Additional assessment methods would continue here...
  // For brevity, I'll include key ones and indicate where others would go

  private calculateOverallScore(categories: CaliberMetrics['categories']): number {
    const weights = {
      communication: 0.2,
      leadership: 0.25,
      marketKnowledge: 0.15,
      strategicThinking: 0.2,
      resilience: 0.1,
      businessAcumen: 0.1
    }

    return Object.entries(categories).reduce((total, [key, category]) => {
      const weight = weights[key as keyof typeof weights]
      return total + (category.score * weight)
    }, 0)
  }

  private detectRedFlags(response: string, context: SharedContext): RedFlag[] {
    const flags: RedFlag[] = []
    const text = response.toLowerCase()

    // Financial red flags
    if (/no revenue|zero revenue|haven't made money/.test(text)) {
      flags.push({
        type: 'financial',
        severity: 'high',
        description: 'No revenue generation mentioned',
        evidence: [response.substring(0, 100)],
        timestamp: new Date()
      })
    }

    // Market red flags
    if (/no competition|no competitors/.test(text)) {
      flags.push({
        type: 'market',
        severity: 'medium',
        description: 'Claims no competition exists',
        evidence: [response.substring(0, 100)],
        timestamp: new Date()
      })
    }

    return flags
  }

  private identifyStrengths(categories: CaliberMetrics['categories'], response: string): any[] {
    const strengths: any[] = []
    
    Object.entries(categories).forEach(([key, category]) => {
      if (category.score > 80) {
        strengths.push({
          category: key,
          description: `Exceptional ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          evidence: category.evidence,
          impact: 'high'
        })
      }
    })

    return strengths
  }

  private identifyConcerns(categories: CaliberMetrics['categories'], response: string): any[] {
    const concerns: any[] = []
    
    Object.entries(categories).forEach(([key, category]) => {
      if (category.score < 40) {
        concerns.push({
          category: key,
          description: `Needs improvement in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          evidence: category.evidence,
          severity: 'medium'
        })
      }
    })

    return concerns
  }

  // Extract indicator methods
  private extractCommunicationIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/because|since|therefore/.test(response.toLowerCase())) indicators.push('Uses logical connectors')
    if (response.length > 200) indicators.push('Provides detailed responses')
    if (/for example|specifically/.test(response.toLowerCase())) indicators.push('Gives concrete examples')
    return indicators
  }

  private extractLeadershipIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/team|we|our/.test(response.toLowerCase())) indicators.push('Team-oriented language')
    if (/decided|chose|led/.test(response.toLowerCase())) indicators.push('Decision-making examples')
    if (/vision|future|goal/.test(response.toLowerCase())) indicators.push('Forward-thinking')
    return indicators
  }

  private extractMarketKnowledgeIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/competitor|competition/.test(response.toLowerCase())) indicators.push('Competitive awareness')
    if (/market size|tam|addressable/.test(response.toLowerCase())) indicators.push('Market sizing knowledge')
    if (/trend|industry|sector/.test(response.toLowerCase())) indicators.push('Industry awareness')
    return indicators
  }

  private extractStrategicThinkingIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/strategy|plan|roadmap/.test(response.toLowerCase())) indicators.push('Strategic planning')
    if (/prioritize|focus|important/.test(response.toLowerCase())) indicators.push('Prioritization skills')
    if (/long.term|future|years/.test(response.toLowerCase())) indicators.push('Long-term thinking')
    return indicators
  }

  private extractResilienceIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/challenge|difficult|problem/.test(response.toLowerCase())) indicators.push('Acknowledges challenges')
    if (/learned|adapted|changed/.test(response.toLowerCase())) indicators.push('Learning orientation')
    if (/persisted|continued|kept/.test(response.toLowerCase())) indicators.push('Persistence')
    return indicators
  }

  private extractBusinessAcumenIndicators(response: string): string[] {
    const indicators: string[] = []
    if (/revenue|profit|margin/.test(response.toLowerCase())) indicators.push('Financial awareness')
    if (/customer|user|client/.test(response.toLowerCase())) indicators.push('Customer focus')
    if (/scale|growth|expand/.test(response.toLowerCase())) indicators.push('Scalability thinking')
    return indicators
  }

  // Red flag detection methods
  private detectFinancialRedFlags(text: string): RedFlag[] {
    const flags: RedFlag[] = []
    
    if (/no revenue|zero revenue|haven't made money|burn rate.*high|running out.*money|no clear path.*monetization/.test(text)) {
      flags.push({
        type: 'financial',
        severity: 'high',
        description: 'Financial concerns detected',
        evidence: ['Financial issues mentioned in conversation'],
        timestamp: new Date()
      })
    }

    return flags
  }

  private detectMarketRedFlags(text: string): RedFlag[] {
    const flags: RedFlag[] = []
    
    if (/shrinking market|declining industry/.test(text)) {
      flags.push({
        type: 'market',
        severity: 'medium',
        description: 'Operating in declining market',
        evidence: ['Market decline mentioned'],
        timestamp: new Date()
      })
    }

    return flags
  }

  private detectTeamRedFlags(text: string): RedFlag[] {
    const flags: RedFlag[] = []
    
    if (/co.?founder.*left|team.*quit/.test(text)) {
      flags.push({
        type: 'team',
        severity: 'high',
        description: 'Key team member departures',
        evidence: ['Team departure mentioned'],
        timestamp: new Date()
      })
    }

    return flags
  }

  private detectProductRedFlags(text: string): RedFlag[] {
    const flags: RedFlag[] = []
    
    if (/no.*product.*market.*fit|customers.*don.*use/.test(text)) {
      flags.push({
        type: 'product',
        severity: 'high',
        description: 'Product-market fit concerns',
        evidence: ['PMF issues mentioned'],
        timestamp: new Date()
      })
    }

    return flags
  }

  // Investment scoring methods
  private scoreMarketPotential(marketAnalysis: any): number {
    // Mock scoring based on market analysis
    return 75 // Would analyze market size, growth, trends
  }

  private scoreProductPotential(businessModel: any): number {
    // Mock scoring based on business model
    return 70 // Would analyze revenue streams, scalability
  }

  private scoreTeamPotential(leadership: any, experience: any): number {
    // Mock scoring based on team assessment
    return 80 // Would analyze leadership and experience insights
  }

  private scoreTraction(financialMetrics: any): number {
    // Mock scoring based on traction
    return 65 // Would analyze revenue, growth, customers
  }

  private scoreFinancials(financialMetrics: any): number {
    // Mock scoring based on financials
    return 60 // Would analyze unit economics, runway, efficiency
  }

  private calculateOverallInvestmentScore(categories: InvestmentScore['categories']): number {
    const weights = { market: 0.25, product: 0.2, team: 0.25, traction: 0.2, financials: 0.1 }
    return Object.entries(categories).reduce((total, [key, score]) => {
      return total + (score * weights[key as keyof typeof weights])
    }, 0)
  }

  private determineRecommendation(score: number, redFlags: any): InvestmentScore['recommendation'] {
    if (score >= 85) return 'strong_yes'
    if (score >= 70) return 'yes'
    if (score >= 50) return 'maybe'
    if (score >= 30) return 'no'
    return 'strong_no'
  }

  private generateRecommendationReasoning(categories: InvestmentScore['categories'], recommendation: string): string[] {
    const reasoning: string[] = []
    
    Object.entries(categories).forEach(([key, score]) => {
      if (score > 80) reasoning.push(`Strong ${key} potential (${score})`)
      if (score < 40) reasoning.push(`Concerns about ${key} (${score})`)
    })

    reasoning.push(`Overall recommendation: ${recommendation}`)
    return reasoning
  }

  // Additional helper methods for insight generation
  private detectLeadershipIndicators(text: string): boolean {
    return /lead|manage|team|decision|vision/.test(text)
  }

  private detectMarketExpertise(text: string): boolean {
    return /market|competitor|industry|customer|segment/.test(text)
  }

  private detectResilienceIndicators(text: string): boolean {
    return /challenge|difficult|adapt|learn|overcome/.test(text)
  }

  private extractLeadershipEvidence(responses: string[]): string[] {
    return responses.filter(r => /lead|manage|team/.test(r.toLowerCase())).slice(0, 3)
  }

  private extractMarketEvidence(responses: string[]): string[] {
    return responses.filter(r => /market|competitor/.test(r.toLowerCase())).slice(0, 3)
  }

  private extractResilienceEvidence(responses: string[]): string[] {
    return responses.filter(r => /challenge|difficult/.test(r.toLowerCase())).slice(0, 3)
  }

  // Placeholder methods for additional assessments
  private assessIndustryKnowledge(response: string, context: SharedContext): number { return 60 }
  private assessCompetitiveAwareness(response: string): number { return 65 }
  private assessMarketSizing(response: string): number { return 55 }
  private assessTrendAwareness(response: string): number { return 70 }
  private assessLongTermThinking(response: string): number { return 60 }
  private assessProblemSolving(response: string): number { return 65 }
  private assessPrioritization(response: string): number { return 55 }
  private assessSystemsThinking(response: string): number { return 50 }
  private assessChallengeHandling(response: string): number { return 70 }
  private assessAdaptability(response: string): number { return 65 }
  private assessPersistence(response: string): number { return 60 }
  private assessLearningOrientation(response: string): number { return 75 }
  private assessFinancialLiteracy(response: string): number { return 55 }
  private assessOperationalThinking(response: string): number { return 60 }
  private assessCustomerFocus(response: string): number { return 70 }
  private assessScalabilityThinking(response: string): number { return 65 }
}