// Investment memo and company-related type definitions

export interface CompanyOverview {
  id: string
  name: string
  description: string
  sector: string
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+'
  foundedYear: number
  location: string
  website?: string
  logo?: string
  tagline: string
  employeeCount: number
  fundingRaised: number
  valuation?: number
}

export interface MarketAnalysis {
  marketSize: {
    current: number
    projected: number
    year: number
    currency: string
  }
  growthRate: number
  marketTrends: string[]
  chartData: {
    year: number
    marketSize: number
    companyRevenue?: number
  }[]
  competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche'
}

export interface FounderProfile {
  id: string
  name: string
  role: string
  bio: string
  profileImage?: string
  socialLinks: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  experience: {
    company: string
    role: string
    duration: string
    description: string
  }[]
  education: {
    institution: string
    degree: string
    year: number
  }[]
  achievements: string[]
  redFlags: string[]
}

export interface CompetitorAnalysis {
  competitors: {
    name: string
    description: string
    fundingRaised: number
    marketShare?: number
    strengths: string[]
    weaknesses: string[]
  }[]
  competitiveAdvantages: string[]
  marketPosition: string
}

export interface KPIMetrics {
  revenue: {
    current: number
    growth: number
    recurring?: number
  }
  customers: {
    total: number
    growth: number
    churn?: number
  }
  sectorSpecific: Record<string, string | number | boolean> // Flexible for different sectors
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high'
  categories: {
    market: {
      level: 'low' | 'medium' | 'high'
      factors: string[]
    }
    financial: {
      level: 'low' | 'medium' | 'high'
      factors: string[]
    }
    operational: {
      level: 'low' | 'medium' | 'high'
      factors: string[]
    }
    team: {
      level: 'low' | 'medium' | 'high'
      factors: string[]
    }
  }
  redFlags: string[]
  mitigationStrategies: string[]
}

export interface InvestmentMemo {
  id: string
  companyId: string
  version: string
  createdAt: string
  updatedAt: string
  overview: CompanyOverview
  marketAnalysis: MarketAnalysis
  founders: FounderProfile[]
  competition: CompetitorAnalysis
  kpis: KPIMetrics
  riskAssessment: RiskAssessment
  recommendation: {
    score: number
    reasoning: string
    investmentThesis: string
  }
}

export interface InvestorPreferences {
  sectors: { name: string; weight: number }[]
  stages: { stage: string; weight: number }[]
  geographies: string[]
  investmentRange: {
    min: number
    max: number
  }
  riskTolerance: 'low' | 'medium' | 'high'
  criteria: {
    revenueWeight: number
    teamWeight: number
    marketWeight: number
    productWeight: number
    tractionWeight: number
  }
}

export interface CompanyFilters {
  sectors: string[]
  stages: string[]
  fundingRange: {
    min: number
    max: number
  }
  location?: string
  searchQuery?: string
}

// Utility types
export type CompanyStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+'
export type RiskLevel = 'low' | 'medium' | 'high'