'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PreferencesWizard } from '@/components/forms/PreferencesWizard'
import { PreferencesSetup } from '@/components/forms/PreferencesSetup'
import { PreferencesQuickEdit } from '@/components/forms/PreferencesQuickEdit'
import { useInvestorStore } from '@/stores/investor-store'
import type { InvestorPreferences } from '@/types'

export default function PreferencesTestPage() {
  const [showWizard, setShowWizard] = useState(false)
  const { preferences, setPreferences, resetPreferences } = useInvestorStore()

  const handlePreferencesComplete = (newPreferences: InvestorPreferences) => {
    setPreferences(newPreferences)
    setShowWizard(false)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Preferences Test Page
        </h1>
        <p className="text-muted-foreground">
          Test all the preferences components and functionality.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Use these buttons to test different scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowWizard(true)} className="w-full">
              Open Preferences Wizard
            </Button>
            <Button
              onClick={resetPreferences}
              variant="outline"
              className="w-full"
            >
              Reset Preferences
            </Button>
            <div className="text-sm">
              <strong>Current Status:</strong>{' '}
              {preferences ? 'Preferences Set' : 'No Preferences'}
            </div>
          </CardContent>
        </Card>

        {/* Quick Edit Component */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Edit Component</CardTitle>
            <CardDescription>
              Test the preferences quick edit dialog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesQuickEdit />
          </CardContent>
        </Card>
      </div>

      {/* Setup Component */}
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Preferences Setup Component
        </h2>
        <PreferencesSetup />
      </div>

      {/* Current Preferences Display */}
      {preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Current Preferences (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(preferences, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <PreferencesWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handlePreferencesComplete}
        initialPreferences={preferences}
      />
    </div>
  )
}
