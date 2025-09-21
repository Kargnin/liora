// Chart and visualization type definitions

export interface ChartDataPoint {
  x: number | string
  y: number
  label?: string
  color?: string
  metadata?: Record<string, string | number | boolean>
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'radar' | 'area' | 'scatter'
  title?: string
  subtitle?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
  responsive?: boolean
  animated?: boolean
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
}

export interface LineChartData {
  datasets: {
    label: string
    data: ChartDataPoint[]
    color?: string
    strokeWidth?: number
    fill?: boolean
  }[]
}

export interface BarChartData {
  categories: string[]
  series: {
    name: string
    data: number[]
    color?: string
  }[]
}

export interface PieChartData {
  segments: {
    label: string
    value: number
    color?: string
  }[]
}

export interface RadarChartData {
  categories: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
    fillOpacity?: number
  }[]
}

export interface MarketGrowthChartData {
  years: number[]
  marketSize: number[]
  companyRevenue?: (number | null)[]
  projectedGrowth?: (number | null)[]
}

export interface CompanyMetricsChartData {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  funding: {
    total: number
    rounds: {
      stage: string
      amount: number
      date: string
    }[]
  }
}

export interface RiskRadarData {
  categories: {
    market: number
    financial: number
    operational: number
    team: number
    competitive: number
  }
  maxValue: number
}

export interface CompetitorComparisonData {
  companies: {
    name: string
    funding: number
    valuation?: number
    employees: number
    marketShare?: number
  }[]
  metrics: string[]
}

// Chart interaction types
export interface ChartTooltip {
  show: boolean
  x: number
  y: number
  content: string | React.ReactNode
}

export interface ChartLegend {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  items: {
    label: string
    color: string
    visible: boolean
  }[]
}

// Utility types
export type ChartType = 'line' | 'bar' | 'pie' | 'radar' | 'area' | 'scatter'
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right'