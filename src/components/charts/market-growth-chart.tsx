"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SSRChartContainer } from "./ssr-chart-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MarketGrowthChartData } from "@/types/charts"

interface MarketGrowthChartProps {
  data: MarketGrowthChartData
  title?: string
  description?: string
  className?: string
}

const chartConfig = {
  marketSize: {
    label: "Market Size",
    color: "hsl(var(--chart-1))",
  },
  companyRevenue: {
    label: "Company Revenue",
    color: "hsl(var(--chart-2))",
  },
  projectedGrowth: {
    label: "Projected Growth",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function MarketGrowthChart({
  data,
  title = "Market Growth Analysis",
  description = "Market size trends and company performance over time",
  className,
}: MarketGrowthChartProps) {
  // Transform data for Recharts
  const chartData = data.years.map((year, index) => ({
    year,
    marketSize: data.marketSize[index] || 0,
    companyRevenue: data.companyRevenue?.[index] || null,
    projectedGrowth: data.projectedGrowth?.[index] || null,
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SSRChartContainer config={chartConfig} id="market-growth-chart">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `$${(Number(value) / 1000000).toFixed(1)}M`,
                    name,
                  ]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="marketSize"
              type="monotone"
              stroke="var(--color-marketSize)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-marketSize)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            {data.companyRevenue && (
              <Line
                dataKey="companyRevenue"
                type="monotone"
                stroke="var(--color-companyRevenue)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-companyRevenue)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            )}
            {data.projectedGrowth && (
              <Line
                dataKey="projectedGrowth"
                type="monotone"
                stroke="var(--color-projectedGrowth)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: "var(--color-projectedGrowth)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            )}
          </LineChart>
        </SSRChartContainer>
      </CardContent>
    </Card>
  )
}