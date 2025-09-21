'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Settings, Edit, CheckCircle, AlertCircle } from 'lucide-react'
import { PreferencesWizard } from '@/components/forms/PreferencesWizard'
import { useInvestorStore } from '@/stores/investor-store'
import type { InvestorPreferences } from '@/types'

export default function PreferencesPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const { preferences, setPreferences } = useInvestorStore()

  const handlePreferencesComplete = (newPreferences: InvestorPreferences) => {
    setPreferences(newPreferences)
  }

  const getPreferencesCompleteness = () => {
    if (!preferences) return 0
    
    let completed = 0
    const total = 5

    if (preferences.sectors?.length > 0) completed++
    if (preferences.stages?.length > 0) completed++
    if (preferences.geographies?.length > 0) completed++
    if (preferences.investmentRange?.min >= 0 && preferences.investmentRange?.max > preferences.investmentRange?.min) completed++
    if (preferences.riskTolerance) completed++

    return (completed / total) * 100
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskToleranceColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Preferences</h1>
          <p className="text-muted-foreground">
            Manage your investment criteria and preferences to get better startup recommendations.
          </p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
          {preferences ? <Edit className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          {preferences ? 'Edit Preferences' : 'Setup Preferences'}
        </Button>
      </div>

      {!preferences && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You haven&apos;t set up your investment preferences yet. Click &quot;Setup Preferences&quot; to get started and receive personalized startup recommendations.
          </AlertDescription>
        </Alert>
      )}

      {preferences && (
        <>
          {/* Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Preferences Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Setup Completion</span>
                  <span>{Math.round(getPreferencesCompleteness())}%</span>
                </div>
                <Progress value={getPreferencesCompleteness()} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {getPreferencesCompleteness() === 100 
                    ? "Your preferences are fully configured!" 
                    : "Complete your preferences to get better recommendations."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sector Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Sector Preferences</CardTitle>
              <CardDescription>
                Industries and sectors you&apos;re interested in investing in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferences.sectors?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {preferences.sectors.map((sector) => (
                      <Badge key={sector.name} variant="secondary" className="text-sm">
                        {sector.name} ({sector.weight}%)
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total sectors: {preferences.sectors.length}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No sector preferences set.</p>
              )}
            </CardContent>
          </Card>

          {/* Stage Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Stages</CardTitle>
              <CardDescription>
                Company stages you prefer to invest in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferences.stages?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {preferences.stages.map((stage) => (
                      <Badge key={stage.stage} variant="outline" className="text-sm capitalize">
                        {stage.stage} ({stage.weight}%)
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total stages: {preferences.stages.length}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No stage preferences set.</p>
              )}
            </CardContent>
          </Card>

          {/* Investment Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Criteria Weights</CardTitle>
              <CardDescription>
                How you prioritize different evaluation criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue & Financial Performance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={preferences.criteria.revenueWeight} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{preferences.criteria.revenueWeight}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Team & Leadership</span>
                    <div className="flex items-center gap-2">
                      <Progress value={preferences.criteria.teamWeight} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{preferences.criteria.teamWeight}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Market Opportunity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={preferences.criteria.marketWeight} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{preferences.criteria.marketWeight}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Product & Technology</span>
                    <div className="flex items-center gap-2">
                      <Progress value={preferences.criteria.productWeight} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{preferences.criteria.productWeight}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Traction & Growth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={preferences.criteria.tractionWeight} className="w-20" />
                      <span className="text-sm text-muted-foreground w-8">{preferences.criteria.tractionWeight}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Range</CardTitle>
                <CardDescription>
                  Your preferred investment amount range.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Minimum:</span>
                    <span className="text-sm">{formatCurrency(preferences.investmentRange.min)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Maximum:</span>
                    <span className="text-sm">{formatCurrency(preferences.investmentRange.max)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Range:</span>
                    <span className="text-sm">
                      {formatCurrency(preferences.investmentRange.max - preferences.investmentRange.min)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk & Geography</CardTitle>
                <CardDescription>
                  Your risk tolerance and geographic preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Risk Tolerance:</span>
                    <Badge className={getRiskToleranceColor(preferences.riskTolerance)}>
                      {preferences.riskTolerance.charAt(0).toUpperCase() + preferences.riskTolerance.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">Geographic Regions:</div>
                  <div className="flex flex-wrap gap-1">
                    {preferences.geographies.map((geo) => (
                      <Badge key={geo} variant="outline" className="text-xs">
                        {geo}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <PreferencesWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handlePreferencesComplete}
        initialPreferences={preferences}
      />
    </div>
  )
}