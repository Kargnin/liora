'use client'

import React from 'react'
import {
  MarketGrowthChart,
  CompanyMetricsChart,
  RiskAssessmentRadar,
} from '@/components/charts'
import type {
  MarketGrowthChartData,
  CompanyMetricsChartData,
  RiskRadarData,
} from '@/types/charts'

// Sample data for testing the charts
const sampleMarketData: MarketGrowthChartData = {
  years: [2020, 2021, 2022, 2023, 2024, 2025],
  marketSize: [50000000, 65000000, 85000000, 110000000, 140000000, 180000000],
  companyRevenue: [500000, 850000, 1200000, 2100000, 3500000, 5200000],
  projectedGrowth: [null, null, null, null, 4200000, 6800000],
}

const sampleMetricsData: CompanyMetricsChartData = {
  revenue: {
    current: 3500000,
    previous: 2100000,
    growth: 66.7,
  },
  customers: {
    current: 12500,
    previous: 8200,
    growth: 52.4,
  },
  funding: {
    total: 15000000,
    rounds: [
      {
        stage: 'Pre-Seed',
        amount: 500000,
        date: '2021-03-15',
      },
      {
        stage: 'Seed',
        amount: 2500000,
        date: '2022-08-20',
      },
      {
        stage: 'Series A',
        amount: 12000000,
        date: '2024-01-10',
      },
    ],
  },
}

const sampleRiskData: RiskRadarData = {
  categories: {
    market: 3,
    financial: 2,
    operational: 4,
    team: 1,
    competitive: 3,
  },
  maxValue: 5,
}

export default function ChartsDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Data Visualization Components Demo
        </h1>
        <p className="text-muted-foreground">
          Interactive charts for investment memo analysis and company metrics
          visualization.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Market Growth Chart */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Market Growth Analysis</h2>
            <p className="text-muted-foreground">
              Interactive line chart showing market size trends and company
              performance over time.
            </p>
          </div>
          <MarketGrowthChart
            data={sampleMarketData}
            title="SaaS Market Growth vs Company Revenue"
            description="Market expansion and company performance from 2020-2025"
          />
        </section>

        {/* Company Metrics Chart */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Company Metrics Overview</h2>
            <p className="text-muted-foreground">
              Tabbed interface showing revenue, customer, and funding metrics
              with growth indicators.
            </p>
          </div>
          <CompanyMetricsChart
            data={sampleMetricsData}
            title="TechCorp Performance Metrics"
            description="Key performance indicators and growth trends"
          />
        </section>

        {/* Risk Assessment Radar */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Risk Assessment Analysis</h2>
            <p className="text-muted-foreground">
              Multi-dimensional radar chart showing risk levels across different
              business categories.
            </p>
          </div>
          <RiskAssessmentRadar
            data={sampleRiskData}
            title="Investment Risk Profile"
            description="Comprehensive risk analysis across key business dimensions"
          />
        </section>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Chart Features</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Interactive tooltips with formatted values</li>
          <li>• Responsive design that adapts to container size</li>
          <li>• Consistent theming using shadcn/ui design system</li>
          <li>
            • Performance-optimized animations using transform-based transitions
          </li>
          <li>• Accessibility support with proper ARIA labels</li>
          <li>• Dark mode compatibility</li>
        </ul>
      </div>
    </div>
  )
}
