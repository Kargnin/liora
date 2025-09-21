'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Settings, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { PreferencesWizard } from './PreferencesWizard'
import { useInvestorStore } from '@/stores/investor-store'
import type { InvestorPreferences } from '@/types'

interface PreferencesSetupProps {
  onComplete?: () => void
  showProgress?: boolean
}

export function PreferencesSetup({ onComplete, showProgress = true }: PreferencesSetupProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const { preferences, setPreferences, isPreferencesSetupComplete } = useInvestorStore()

  const handlePreferencesComplete = (newPreferences: InvestorPreferences) => {
    setPreferences(newPreferences)
    setIsWizardOpen(false)
    onComplete?.()
  }

  const getSetupProgress = () => {
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

  const isSetupComplete = isPreferencesSetupComplete && getSetupProgress() === 100

  if (isSetupComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Preferences Configured
          </CardTitle>
          <CardDescription>
            Your investment preferences are set up and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Sectors:</span> {preferences?.sectors?.length || 0}
            </div>
            <div>
              <span className="font-medium">Stages:</span> {preferences?.stages?.length || 0}
            </div>
            <div>
              <span className="font-medium">Risk:</span> {preferences?.riskTolerance || 'Not set'}
            </div>
            <div>
              <span className="font-medium">Regions:</span> {preferences?.geographies?.length || 0}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsWizardOpen(true)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Preferences
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Investment Preferences Setup
          </CardTitle>
          <CardDescription>
            Configure your investment preferences to receive personalized startup recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!preferences ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Set up your investment preferences to start discovering startups that match your criteria.
              </AlertDescription>
            </Alert>
          ) : (
            showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Progress</span>
                  <span>{Math.round(getSetupProgress())}%</span>
                </div>
                <Progress value={getSetupProgress()} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {getSetupProgress() < 100 
                    ? "Complete all sections to get the best recommendations" 
                    : "Setup complete! You can edit anytime."
                  }
                </p>
              </div>
            )
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">What you&apos;ll configure:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Preferred investment sectors and their importance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Company stages you want to invest in
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Investment criteria weights (team, market, product, etc.)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Investment amount range and risk tolerance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Geographic preferences for investments
              </li>
            </ul>
          </div>

          <Button 
            onClick={() => setIsWizardOpen(true)} 
            className="w-full"
            size="lg"
          >
            {preferences ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Continue Setup
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <PreferencesWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handlePreferencesComplete}
        initialPreferences={preferences}
      />
    </>
  )
}