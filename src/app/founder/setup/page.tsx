'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CompanyDetailsForm } from '@/components/forms/CompanyDetailsForm'
import { useFounderStore } from '@/stores/founder-store'
import { useAuthStore } from '@/stores/auth-store'
import { type CompanyDetailsFormData } from '@/types'

export default function FounderSetupPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    companyData,
    updateCompanyData,
    setFormComplete,
    setAnalysisStatus,
    saveCompanyData
  } = useFounderStore()

  // Redirect if not a founder
  React.useEffect(() => {
    if (user && user.type !== 'founder') {
      router.push('/investor/dashboard')
    }
  }, [user, router])

  const handleAutoSave = async (data: Partial<CompanyDetailsFormData>) => {
    try {
      updateCompanyData(data)
      await saveCompanyData()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleComplete = async (data: CompanyDetailsFormData) => {
    try {
      // Update the store with final data
      updateCompanyData(data)
      setFormComplete(true)
      
      // Save to backend
      await saveCompanyData()
      
      // Start AI analysis
      setAnalysisStatus('in-progress')
      
      // Redirect to main founder dashboard
      router.push('/founder')
    } catch (error) {
      console.error('Failed to complete setup:', error)
      // Handle error (show toast, etc.)
    }
  }

  if (!user || user.type !== 'founder') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to founders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Liora</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Let&apos;s set up your company profile to get started
          </p>
        </div>

        <CompanyDetailsForm
          initialData={companyData}
          onSave={handleAutoSave}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}