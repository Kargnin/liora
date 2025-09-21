'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Edit } from 'lucide-react'
import { PreferencesWizard } from './PreferencesWizard'
import { useInvestorStore } from '@/stores/investor-store'
import type { InvestorPreferences } from '@/types'

interface PreferencesQuickEditProps {
  trigger?: React.ReactNode
}

export function PreferencesQuickEdit({ trigger }: PreferencesQuickEditProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const { preferences, setPreferences } = useInvestorStore()

  const handlePreferencesComplete = (newPreferences: InvestorPreferences) => {
    setPreferences(newPreferences)
    setIsWizardOpen(false)
    setIsOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Preferences
    </Button>
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investment Preferences</DialogTitle>
            <DialogDescription>
              View and edit your investment preferences.
            </DialogDescription>
          </DialogHeader>

          {!preferences ? (
            <Card>
              <CardHeader>
                <CardTitle>No Preferences Set</CardTitle>
                <CardDescription>
                  You haven&apos;t configured your investment preferences yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsWizardOpen(true)} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Preferences
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Quick Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Investment Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {formatCurrency(preferences.investmentRange.min)} - {formatCurrency(preferences.investmentRange.max)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Risk Tolerance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="capitalize">
                      {preferences.riskTolerance}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Sectors */}
              <div>
                <h4 className="text-sm font-medium mb-2">Preferred Sectors ({preferences.sectors?.length || 0})</h4>
                <div className="flex flex-wrap gap-1">
                  {preferences.sectors?.slice(0, 6).map((sector) => (
                    <Badge key={sector.name} variant="secondary" className="text-xs">
                      {sector.name}
                    </Badge>
                  ))}
                  {(preferences.sectors?.length || 0) > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{(preferences.sectors?.length || 0) - 6} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stages */}
              <div>
                <h4 className="text-sm font-medium mb-2">Investment Stages ({preferences.stages?.length || 0})</h4>
                <div className="flex flex-wrap gap-1">
                  {preferences.stages?.map((stage) => (
                    <Badge key={stage.stage} variant="outline" className="text-xs capitalize">
                      {stage.stage}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Geographies */}
              <div>
                <h4 className="text-sm font-medium mb-2">Geographic Regions ({preferences.geographies?.length || 0})</h4>
                <div className="flex flex-wrap gap-1">
                  {preferences.geographies?.slice(0, 4).map((geo) => (
                    <Badge key={geo} variant="outline" className="text-xs">
                      {geo}
                    </Badge>
                  ))}
                  {(preferences.geographies?.length || 0) > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{(preferences.geographies?.length || 0) - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <Button onClick={() => setIsWizardOpen(true)} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Preferences
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PreferencesWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handlePreferencesComplete}
        initialPreferences={preferences}
      />
    </>
  )
}