"use client"

import React from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SSRChartContainer } from "./ssr-chart-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import type { RiskRadarData } from "@/types/charts"

interface RiskAssessmentRadarProps {
  data: RiskRadarData
  title?: string
  description?: string
  className?: string
}

const chartConfig = {
  riskLevel: {
    label: "Risk Level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RiskAssessmentRadar({
  data,
  title = "Risk Assessment Overview",
  description = "Multi-dimensional risk analysis across key categories",
  className,
}: RiskAssessmentRadarProps) {
  // Transform data for radar chart
  const radarData = [
    {
      category: "Market",
      riskLevel: data.categories.market,
      fullMark: data.maxValue,
    },
    {
      category: "Financial",
      riskLevel: data.categories.financial,
      fullMark: data.maxValue,
    },
    {
      category: "Operational",
      riskLevel: data.categories.operational,
      fullMark: data.maxValue,
    },
    {
      category: "Team",
      riskLevel: data.categories.team,
      fullMark: data.maxValue,
    },
    {
      category: "Competitive",
      riskLevel: data.categories.competitive,
      fullMark: data.maxValue,
    },
  ]

  // Calculate overall risk level
  const totalRisk = Object.values(data.categories).reduce((sum, risk) => sum + risk, 0)
  const averageRisk = totalRisk / Object.keys(data.categories).length
  const riskPercentage = (averageRisk / data.maxValue) * 100

  const getRiskLevel = (percentage: number) => {
    if (percentage <= 30) return { level: "Low", variant: "default" as const, icon: TrendingUp }
    if (percentage <= 60) return { level: "Medium", variant: "secondary" as const, icon: AlertTriangle }
    return { level: "High", variant: "destructive" as const, icon: TrendingDown }
  }

  const riskAssessment = getRiskLevel(riskPercentage)
  const RiskIcon = riskAssessment.icon

  // Find highest risk category
  const highestRiskCategory = Object.entries(data.categories).reduce((max, [category, risk]) =>
    risk > max.risk ? { category, risk } : max,
    { category: "", risk: 0 }
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant={riskAssessment.variant} className="flex items-center gap-1">
            <RiskIcon className="h-3 w-3" />
            {riskAssessment.level} Risk
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Overall Risk Score</p>
            <p className="text-2xl font-bold">{riskPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium">Highest Risk Area</p>
            <p className="text-lg font-semibold capitalize">{highestRiskCategory.category}</p>
          </div>
        </div>

        <SSRChartContainer config={chartConfig} id="risk-radar-chart">
          <RadarChart
            data={radarData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, data.maxValue]}
              tick={{ fontSize: 10 }}
              tickCount={6}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name) => [
                    `${((Number(value) / data.maxValue) * 100).toFixed(1)}%`,
                    "Risk Level",
                  ]}
                />
              }
            />
            <Radar
              name="Risk Level"
              dataKey="riskLevel"
              stroke="var(--color-riskLevel)"
              fill="var(--color-riskLevel)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </SSRChartContainer>

        {riskPercentage > 60 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High risk detected in {highestRiskCategory.category.toLowerCase()} category. 
              Consider reviewing mitigation strategies for this area.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-2 text-xs">
          <p className="font-medium">Risk Categories Breakdown:</p>
          {radarData.map((item) => {
            const percentage = (item.riskLevel / data.maxValue) * 100
            const categoryRisk = getRiskLevel(percentage)
            return (
              <div key={item.category} className="flex items-center justify-between">
                <span>{item.category}</span>
                <div className="flex items-center gap-2">
                  <span>{percentage.toFixed(1)}%</span>
                  <Badge variant={categoryRisk.variant} className="text-xs">
                    {categoryRisk.level}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}