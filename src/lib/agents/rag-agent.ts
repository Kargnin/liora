/**
 * RAG Agent - Handles backend API integration and contextual data retrieval
 * Manages founder data, public data, context injection, and knowledge base updates
 */

import { BaseAgentImpl } from './base-agent'
import {
  RAGAgent,
  FounderData,
  PublicData,
  RetrievedData,
  ContextualQuestion,
  Insight,
  FounderProfile,
  CompanyData,
  DocumentData,
  InterviewSummary,
  MarketData,
  CompetitorData,
  BenchmarkData
} from '@/types/interview'

export class RAGAgentImpl extends BaseAgentImpl implements RAGAgent {
  public readonly type = 'rag' as const
  private knowledgeBase: Map<string, any> = new Map()
  private apiBaseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

  constructor(id: string = 'rag-001') {
    super(id, 'rag')
  }

  /**
   * Retrieve founder data from backend database
   */
  async retrieveFounderData(founderId: string): Promise<FounderData> {
    this.updateStatus('processing', 'Retrieving founder data')
    this.logActivity('Retrieving founder data', { founderId })

    try {
      await this.simulateProcessing(800, 1200)

      // Mock implementation - replace with actual backend calls
      const founderData = await this.mockRetrieveFounderData(founderId)
      
      // Store in knowledge base for future reference
      this.knowledgeBase.set(`founder-${founderId}`, founderData)
      
      this.updateStatus('idle')
      return founderData

    } catch (error) {
      this.handleError(error as Error, 'retrieveFounderData')
      throw error
    }
  }

  /**
   * Retrieve public data about company and market
   */
  async retrievePublicData(companyName: string, sector: string): Promise<PublicData> {
    this.updateStatus('processing', 'Retrieving public market data')
    this.logActivity('Retrieving public data', { companyName, sector })

    try {
      await this.simulateProcessing(1000, 1500)

      // Mock implementation with realistic data
      const publicData = await this.mockRetrievePublicData(companyName, sector)
      
      // Store in knowledge base
      this.knowledgeBase.set(`public-${companyName}-${sector}`, publicData)
      
      this.updateStatus('idle')
      return publicData

    } catch (error) {
      this.handleError(error as Error, 'retrievePublicData')
      throw error
    }
  }

  /**
   * Inject context into questions to make them more specific and relevant
   */
  async injectContext(question: string, context: RetrievedData): Promise<ContextualQuestion> {
    this.updateStatus('thinking', 'Injecting context into question')
    this.logActivity('Injecting context', { 
      questionLength: question.length,
      hasFounderData: !!context.founderData,
      hasPublicData: !!context.publicData
    })

    try {
      await this.simulateProcessing(600, 900)

      let enhancedQuestion = question
      let relevanceScore = 0.5 // Base relevance

      // Inject founder-specific context
      if (context.founderData) {
        enhancedQuestion = this.injectFounderContext(enhancedQuestion, context.founderData)
        relevanceScore += 0.2
      }

      // Inject public market context
      if (context.publicData) {
        enhancedQuestion = this.injectPublicContext(enhancedQuestion, context.publicData)
        relevanceScore += 0.2
      }

      // Ensure relevance score doesn't exceed 1.0
      relevanceScore = Math.min(1.0, relevanceScore)

      const contextualQuestion: ContextualQuestion = {
        originalQuestion: question,
        enhancedQuestion,
        contextUsed: context,
        relevanceScore
      }

      this.updateStatus('idle')
      return contextualQuestion

    } catch (error) {
      this.handleError(error as Error, 'injectContext')
      throw error
    }
  }

  /**
   * Update knowledge base with new insights from conversation
   */
  async updateKnowledgeBase(newInsights: Insight[]): Promise<void> {
    this.updateStatus('processing', 'Updating knowledge base')
    this.logActivity('Updating knowledge base', { insightCount: newInsights.length })

    try {
      await this.simulateProcessing(400, 600)

      // Process and store new insights
      newInsights.forEach(insight => {
        const key = `insight-${insight.type}-${insight.category}-${Date.now()}`
        this.knowledgeBase.set(key, {
          ...insight,
          timestamp: new Date(),
          source: 'interview'
        })
      })

      // Update related data based on insights
      await this.updateRelatedData(newInsights)

      this.updateStatus('idle')

    } catch (error) {
      this.handleError(error as Error, 'updateKnowledgeBase')
      throw error
    }
  }

  /**
   * Mock implementation of founder data retrieval
   */
  private async mockRetrieveFounderData(founderId: string): Promise<FounderData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockFounderProfile: FounderProfile = {
      id: founderId,
      name: "Sarah Chen",
      email: "sarah@techstartup.com",
      background: [
        "Former Product Manager at Google",
        "MBA from Stanford",
        "5 years in enterprise software"
      ],
      experience: [
        "Led product team of 15 engineers",
        "Launched 3 successful B2B products",
        "Experience with AI/ML product development"
      ],
      education: [
        "MBA, Stanford Graduate School of Business",
        "BS Computer Science, UC Berkeley"
      ],
      previousCompanies: [
        "Google (Product Manager, 2019-2022)",
        "Salesforce (Associate PM, 2017-2019)",
        "Microsoft (Software Engineer, 2015-2017)"
      ]
    }

    const mockCompanyData: CompanyData = {
      id: "company-001",
      name: "TechStartup AI",
      sector: "B2B SaaS",
      stage: "Series A",
      description: "AI-powered customer service automation platform for enterprise clients",
      website: "https://techstartup.ai",
      foundedDate: new Date("2022-03-15"),
      location: "San Francisco, CA"
    }

    const mockDocuments: DocumentData[] = [
      {
        id: "doc-001",
        name: "Business Plan 2024",
        type: "pdf",
        content: "Comprehensive business plan outlining go-to-market strategy, financial projections, and competitive analysis...",
        uploadDate: new Date("2024-01-15")
      },
      {
        id: "doc-002",
        name: "Financial Projections",
        type: "xlsx",
        content: "5-year financial model with revenue projections, cost structure, and funding requirements...",
        uploadDate: new Date("2024-02-01")
      }
    ]

    const mockPreviousInterviews: InterviewSummary[] = [
      {
        id: "interview-001",
        date: new Date("2024-01-20"),
        duration: 45 * 60, // 45 minutes in seconds
        topics: ["market opportunity", "competitive landscape", "team building"],
        keyInsights: [
          "Strong technical background",
          "Clear market vision",
          "Needs help with sales strategy"
        ],
        caliberScore: 78
      }
    ]

    return {
      profile: mockFounderProfile,
      company: mockCompanyData,
      documents: mockDocuments,
      previousInterviews: mockPreviousInterviews
    }
  }

  /**
   * Mock implementation of public data retrieval
   */
  private async mockRetrievePublicData(companyName: string, sector: string): Promise<PublicData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700))

    const mockMarketData: MarketData = {
      size: "$50B",
      growth: "15% YoY",
      trends: [
        "AI adoption accelerating in enterprise",
        "Remote work driving automation needs",
        "Focus on customer experience optimization",
        "Increased investment in conversational AI"
      ]
    }

    const mockCompetitors: CompetitorData[] = [
      {
        name: "Zendesk",
        funding: "$200M Series D",
        marketShare: "25%",
        strengths: ["Established brand", "Large customer base", "Comprehensive platform"]
      },
      {
        name: "Intercom",
        funding: "$125M Series C",
        marketShare: "18%",
        strengths: ["Modern UI/UX", "Strong messaging platform", "Good developer tools"]
      },
      {
        name: "Freshworks",
        funding: "$150M IPO",
        marketShare: "15%",
        strengths: ["Affordable pricing", "Easy setup", "Good for SMBs"]
      },
      {
        name: "Ada",
        funding: "$44M Series B",
        marketShare: "8%",
        strengths: ["AI-first approach", "No-code platform", "Strong automation"]
      }
    ]

    const mockBenchmarks: BenchmarkData = {
      revenueGrowth: "200% YoY for Series A companies",
      customerAcquisitionCost: "$500-2000 for enterprise B2B",
      churnRate: "5-8% monthly for SaaS",
      averageContractValue: "$25K-100K annually",
      salesCycleLength: "3-9 months for enterprise",
      grossMargins: "70-85% for SaaS companies"
    }

    return {
      market: mockMarketData,
      competitors: mockCompetitors,
      trends: [
        "Shift towards conversational commerce",
        "Integration with existing business tools",
        "Focus on measurable ROI and efficiency gains",
        "Emphasis on data privacy and security"
      ],
      benchmarks: mockBenchmarks
    }
  }

  /**
   * Inject founder-specific context into questions
   */
  private injectFounderContext(question: string, founderData: FounderData): string {
    let enhancedQuestion = question

    // Inject company-specific information
    if (founderData.company) {
      enhancedQuestion = enhancedQuestion.replace(
        /your company/gi,
        founderData.company.name
      )
      
      // Add sector-specific context
      if (question.toLowerCase().includes('market') && founderData.company.sector) {
        enhancedQuestion += ` Given that you're in the ${founderData.company.sector} space,`
      }
    }

    // Inject founder background context
    if (founderData.profile && question.toLowerCase().includes('experience')) {
      const relevantExperience = founderData.profile.experience[0] // Use first experience
      enhancedQuestion += ` I see from your background that you ${relevantExperience.toLowerCase()}.`
    }

    // Inject previous interview insights
    if (founderData.previousInterviews && founderData.previousInterviews.length > 0) {
      const lastInterview = founderData.previousInterviews[0]
      if (lastInterview.keyInsights.length > 0) {
        enhancedQuestion += ` Building on our previous discussion about ${lastInterview.topics[0]},`
      }
    }

    return enhancedQuestion
  }

  /**
   * Inject public market context into questions
   */
  private injectPublicContext(question: string, publicData: PublicData): string {
    let enhancedQuestion = question

    // Inject market size context
    if (question.toLowerCase().includes('market') && publicData.market) {
      enhancedQuestion = enhancedQuestion.replace(
        /market/gi,
        `${publicData.market.size} market that's growing at ${publicData.market.growth}`
      )
    }

    // Inject competitor context
    if (question.toLowerCase().includes('competitor') && publicData.competitors.length > 0) {
      const topCompetitors = publicData.competitors.slice(0, 2)
      enhancedQuestion += ` I see companies like ${topCompetitors.map(c => c.name).join(' and ')} in this space.`
    }

    // Inject trend context
    if (question.toLowerCase().includes('trend') && publicData.trends.length > 0) {
      const relevantTrend = publicData.trends[0]
      enhancedQuestion += ` With trends like ${relevantTrend.toLowerCase()},`
    }

    // Inject benchmark context
    if (question.toLowerCase().includes('revenue') && publicData.benchmarks) {
      enhancedQuestion += ` For context, ${publicData.benchmarks.revenueGrowth} is typical for companies at your stage.`
    }

    return enhancedQuestion
  }

  /**
   * Update related data based on new insights
   */
  private async updateRelatedData(insights: Insight[]): Promise<void> {
    // Group insights by category
    const insightsByCategory = insights.reduce((acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = []
      }
      acc[insight.category].push(insight)
      return acc
    }, {} as Record<string, Insight[]>)

    // Update knowledge base with categorized insights
    Object.entries(insightsByCategory).forEach(([category, categoryInsights]) => {
      const existingData = this.knowledgeBase.get(`category-${category}`) || []
      this.knowledgeBase.set(`category-${category}`, [...existingData, ...categoryInsights])
    })

    // Update trend analysis based on insights
    const trendInsights = insights.filter(i => i.type === 'opportunity' || i.type === 'risk')
    if (trendInsights.length > 0) {
      this.knowledgeBase.set('trend-analysis', {
        lastUpdated: new Date(),
        insights: trendInsights,
        patterns: this.identifyPatterns(trendInsights)
      })
    }
  }

  /**
   * Identify patterns in insights for trend analysis
   */
  private identifyPatterns(insights: Insight[]): string[] {
    const patterns: string[] = []
    
    // Look for recurring themes
    const themes = insights.map(i => i.category)
    const themeCount = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(themeCount).forEach(([theme, count]) => {
      if (count > 1) {
        patterns.push(`Recurring focus on ${theme}`)
      }
    })

    // Look for confidence patterns
    const highConfidenceInsights = insights.filter(i => i.confidence > 0.8)
    if (highConfidenceInsights.length > insights.length * 0.6) {
      patterns.push('High confidence in most assessments')
    }

    return patterns
  }

  /**
   * Search knowledge base for relevant information
   */
  searchKnowledgeBase(query: string): any[] {
    const results: any[] = []
    const queryLower = query.toLowerCase()

    this.knowledgeBase.forEach((value, key) => {
      if (key.toLowerCase().includes(queryLower)) {
        results.push({ key, data: value })
      } else if (typeof value === 'object' && value !== null) {
        // Search within object properties
        const stringified = JSON.stringify(value).toLowerCase()
        if (stringified.includes(queryLower)) {
          results.push({ key, data: value })
        }
      }
    })

    return results
  }

  /**
   * Get knowledge base statistics
   */
  getKnowledgeBaseStats(): {
    totalEntries: number
    categories: string[]
    lastUpdated: Date | null
  } {
    const categories = new Set<string>()
    let lastUpdated: Date | null = null

    this.knowledgeBase.forEach((value, key) => {
      // Extract category from key
      const category = key.split('-')[0]
      categories.add(category)

      // Find most recent update
      if (value && typeof value === 'object' && value.timestamp) {
        const timestamp = new Date(value.timestamp)
        if (!lastUpdated || timestamp > lastUpdated) {
          lastUpdated = timestamp
        }
      }
    })

    return {
      totalEntries: this.knowledgeBase.size,
      categories: Array.from(categories),
      lastUpdated
    }
  }

  /**
   * Clear knowledge base
   */
  clearKnowledgeBase(): void {
    this.knowledgeBase.clear()
    this.logActivity('Knowledge base cleared')
  }

  /**
   * Export knowledge base for analysis
   */
  exportKnowledgeBase(): Record<string, any> {
    const exported: Record<string, any> = {}
    this.knowledgeBase.forEach((value, key) => {
      exported[key] = value
    })
    return exported
  }
}