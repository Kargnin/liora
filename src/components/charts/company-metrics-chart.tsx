"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SSRChartContainer } from "./ssr-chart-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CompanyMetricsChartData } from "@/types/charts"

interface CompanyMetricsChartProps {
  data: CompanyMetricsChartData
  title?: string
  description?: string
  className?: string
}

const revenueChartConfig = {
  current: {
    label: "Current Revenue",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const customerChartConfig = {
  current: {
    label: "Current Customers",
    color: "hsl(var(--chart-3))",
  },
  previous: {
    label: "Previous Customers",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

const fundingChartConfig = {
  amount: {
    label: "Funding Amount",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function CompanyMetricsChart({
  data,
  title = "Company Metrics Overview",
  description = "Key performance indicators and growth metrics",
  className,
}: CompanyMetricsChartProps) {
  // Prepare revenue comparison data
  const revenueData = [
    {
      period: "Previous",
      value: data.revenue.previous,
      growth: 0,
    },
    {
      period: "Current",
      value: data.revenue.current,
      growth: data.revenue.growth,
    },
  ]

  // Prepare customer comparison data
  const customerData = [
    {
      period: "Previous",
      value: data.customers.previous,
      growth: 0,
    },
    {
      period: "Current",
      value: data.customers.current,
      growth: data.customers.growth,
    },
  ]

  // Prepare funding rounds data
  const fundingData = data.funding.rounds.map((round) => ({
    stage: round.stage,
    amount: round.amount,
    date: new Date(round.date).getFullYear(),
  }))

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toLocaleString()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Revenue Growth</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">
                    {formatCurrency(data.revenue.current)}
                  </span>
                  <Badge
                    variant={data.revenue.growth >= 0 ? "default" : "destructive"}
                  >
                    {data.revenue.growth >= 0 ? "+" : ""}
                    {data.revenue.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
            <SSRChartContainer config={revenueChartConfig} id="revenue-chart">
              <BarChart
                accessibilityLayer
                data={revenueData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatCurrency}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-current)"
                  radius={8}
                />
              </BarChart>
            </SSRChartContainer>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Customer Growth</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">
                    {formatNumber(data.customers.current)}
                  </span>
                  <Badge
                    variant={data.customers.growth >= 0 ? "default" : "destructive"}
                  >
                    {data.customers.growth >= 0 ? "+" : ""}
                    {data.customers.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
            <SSRChartContainer config={customerChartConfig} id="customer-chart">
              <BarChart
                accessibilityLayer
                data={customerData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatNumber}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [formatNumber(Number(value)), "Customers"]}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-current)"
                  radius={8}
                />
              </BarChart>
            </SSRChartContainer>
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Funding Raised</p>
                <span className="text-2xl font-bold">
                  {formatCurrency(data.funding.total)}
                </span>
              </div>
            </div>
            <SSRChartContainer config={fundingChartConfig} id="funding-chart">
              <BarChart
                accessibilityLayer
                data={fundingData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatCurrency}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, props) => [
                        formatCurrency(Number(value)),
                        `${props.payload.stage} (${props.payload.date})`,
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="var(--color-amount)"
                  radius={8}
                />
              </BarChart>
            </SSRChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}