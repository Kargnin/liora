'use client'

import { InvestmentMemoDisplay } from '@/components/investment-memo'
import { mockInvestmentMemo } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvestmentMemoDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Investment Memo Display Demo</CardTitle>
          <CardDescription>
            Comprehensive investment memo display system with structured sections, 
            KPI visualization, and risk assessment using shadcn/ui components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features Demonstrated:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Tabbed interface using shadcn/ui Tabs component</li>
              <li>Structured sections with Accordion and Collapsible components</li>
              <li>KPI display using Badge, Progress, and Table components</li>
              <li>ScrollArea for long content sections</li>
              <li>Risk assessment with color-coded indicators</li>
              <li>Founder profiles with social links and experience</li>
              <li>Competitive analysis with expandable competitor details</li>
              <li>Market analysis with growth metrics and trends</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <InvestmentMemoDisplay memo={mockInvestmentMemo} />
    </div>
  )
}