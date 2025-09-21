"use client"

import React from "react"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"

interface SSRChartContainerProps {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  className?: string
  id?: string
}

export function SSRChartContainer({ 
  config, 
  children, 
  className, 
  id 
}: SSRChartContainerProps) {
  // Use a stable ID that's consistent between server and client
  const stableId = React.useMemo(() => {
    if (id) return id
    // Create a stable ID based on config keys to ensure consistency
    const configKeys = Object.keys(config).sort().join('-')
    return `chart-${configKeys.replace(/[^a-zA-Z0-9]/g, '')}`
  }, [config, id])

  return (
    <div data-chart={stableId} className={className}>
      <ChartContainer 
        config={config} 
        id={stableId}
      >
        {children}
      </ChartContainer>
    </div>
  )
}