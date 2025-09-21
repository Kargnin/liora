'use client'

import React from 'react'
import { CompanyDetailsForm } from '@/components/forms/CompanyDetailsForm'
import { type CompanyDetailsFormData } from '@/types'

export default function CompanyFormDemoPage() {
  const handleAutoSave = React.useCallback((data: Partial<CompanyDetailsFormData>) => {
    console.log('Auto-saving data:', data)
  }, [])

  const handleComplete = React.useCallback((data: CompanyDetailsFormData) => {
    console.log('Form completed with data:', data)
    alert('Company setup completed! Check the console for the data.')
  }, [])

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Company Details Form Demo</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Test the multi-step company information form with validation and auto-save
          </p>
        </div>

        <CompanyDetailsForm
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}