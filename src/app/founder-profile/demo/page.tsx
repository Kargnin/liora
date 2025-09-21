'use client'

import { FounderProfileDisplay, RiskAssessmentDisplay, FoundersDisplay } from '@/components/investment-memo'
import { mockInvestmentMemo } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export default function FounderProfileDemo() {
  const { founders, riskAssessment } = mockInvestmentMemo

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Founder Profile & Risk Assessment Demo</CardTitle>
          <CardDescription>
            Comprehensive founder profile and risk assessment display system using shadcn/ui components.
            Demonstrates Avatar, Card, Badge, Alert, Progress, Accordion, and Tooltip components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features Demonstrated:</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Founder Profile Components:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Avatar component with fallback initials</li>
                  <li>Card layout with border accent</li>
                  <li>Badge components for risk indicators</li>
                  <li>Social links with external link icons</li>
                  <li>Accordion for detailed information</li>
                  <li>Tooltip components for additional context</li>
                  <li>Alert components for red flags</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Risk Assessment Components:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Progress bars for risk level visualization</li>
                  <li>Alert components with destructive variants</li>
                  <li>Color-coded risk categories</li>
                  <li>Accordion for detailed risk analysis</li>
                  <li>Badge components with risk level styling</li>
                  <li>Tooltip components for risk explanations</li>
                  <li>Mitigation strategies display</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="founders-display" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="founders-display">All Founders</TabsTrigger>
          <TabsTrigger value="individual-founder">Individual Founder</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="compact-view">Compact Views</TabsTrigger>
        </TabsList>

        <TabsContent value="founders-display" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">Complete Founders Display</h2>
              <Badge variant="outline">{founders.length} Founders</Badge>
            </div>
            <p className="text-muted-foreground">
              Displays all founders with comprehensive profiles, risk indicators, and team summary statistics.
            </p>
          </div>
          <FoundersDisplay 
            founders={founders} 
            showRedFlags={true}
            title="Founding Team"
          />
        </TabsContent>

        <TabsContent value="individual-founder" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Individual Founder Profiles</h2>
            <p className="text-muted-foreground">
              Detailed view of individual founder profiles with expandable sections for experience, education, and achievements.
            </p>
          </div>
          
          <div className="space-y-8">
            {founders.map((founder, index) => (
              <div key={founder.id}>
                {index > 0 && <Separator className="my-8" />}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold">{founder.name}</h3>
                    <Badge variant="secondary">{founder.role}</Badge>
                    {founder.redFlags.length > 0 && (
                      <Badge variant="destructive">
                        {founder.redFlags.length} Risk{founder.redFlags.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <FounderProfileDisplay 
                    founder={founder} 
                    showRedFlags={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Risk Assessment Display</h2>
            <p className="text-muted-foreground">
              Comprehensive risk assessment with category breakdown, progress indicators, and mitigation strategies.
            </p>
          </div>
          <RiskAssessmentDisplay 
            riskAssessment={riskAssessment}
            showMitigationStrategies={true}
          />
        </TabsContent>

        <TabsContent value="compact-view" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Compact Views</h2>
            <p className="text-muted-foreground">
              Condensed versions suitable for dashboard cards and summary displays.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Compact Founder Profiles</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {founders.map((founder) => (
                  <FounderProfileDisplay 
                    key={founder.id}
                    founder={founder} 
                    showRedFlags={true}
                    compact={true}
                  />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Compact Risk Assessment</h3>
              <div className="max-w-md">
                <RiskAssessmentDisplay 
                  riskAssessment={riskAssessment}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}