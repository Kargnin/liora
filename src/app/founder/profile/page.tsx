'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CompanyDetailsForm } from '@/components/forms/CompanyDetailsForm'
import { ArrowLeft, Building2, Calendar, MapPin, Users, DollarSign, Globe } from 'lucide-react'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useFounderStore } from '@/stores/founder-store'
import { type CompanyDetailsFormData } from '@/types'
import { formatFileSize } from '@/types/upload'

export default function FounderProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthGuard({ requiredUserType: 'founder' })
  const [isEditing, setIsEditing] = React.useState(false)
  
  const {
    companyData,
    uploadedFiles,
    updateCompanyData,
    saveCompanyData
  } = useFounderStore()

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const handleAutoSave = async (data: Partial<CompanyDetailsFormData>) => {
    try {
      updateCompanyData(data)
      await saveCompanyData()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleFormComplete = async (data: CompanyDetailsFormData) => {
    try {
      updateCompanyData(data)
      await saveCompanyData()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStageLabel = (stage: string | undefined) => {
    const stageMap: Record<string, string> = {
      'pre-seed': 'Pre-Seed',
      'seed': 'Seed',
      'series-a': 'Series A',
      'series-b': 'Series B',
      'series-c+': 'Series C+'
    }
    return stage ? stageMap[stage] || stage : 'Not specified'
  }

  if (isEditing) {
    return (
      <DashboardLayout userType="founder" userName={user.name}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Company Profile</h1>
                <p className="text-muted-foreground">
                  Update your company information and pitch materials
                </p>
              </div>
            </div>
          </div>

          <CompanyDetailsForm
            initialData={companyData}
            onSave={handleAutoSave}
            onComplete={handleFormComplete}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="founder" userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
              <p className="text-muted-foreground">
                View and manage your company information
              </p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{companyData.name || 'Company Name Not Set'}</h3>
                <p className="text-muted-foreground">{companyData.tagline || 'No tagline provided'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {companyData.description || 'No description provided'}
                </p>
              </div>

              {companyData.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={companyData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {companyData.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Sector</span>
                  <p className="font-medium">{companyData.sector || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Stage</span>
                  <Badge variant="secondary">{getStageLabel(companyData.stage)}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Founded</span>
                    <p className="font-medium">{companyData.foundedYear || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{companyData.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Company Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Team Size</span>
                    <p className="font-medium">{companyData.employeeCount || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Funding Raised</span>
                    <p className="font-medium">{formatCurrency(companyData.fundingRaised)}</p>
                  </div>
                </div>
              </div>

              {companyData.valuation && (
                <div>
                  <span className="text-sm text-muted-foreground">Current Valuation</span>
                  <p className="font-medium">{formatCurrency(companyData.valuation)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          <Card>
            <CardHeader>
              <CardTitle>Pitch Materials</CardTitle>
              <CardDescription>
                Documents and media files uploaded for your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFiles.pitchDeck && uploadedFiles.pitchDeck.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pitch Deck</h4>
                  {uploadedFiles.pitchDeck.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.pitchVideo && uploadedFiles.pitchVideo.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pitch Video</h4>
                  {uploadedFiles.pitchVideo.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.pitchAudio && uploadedFiles.pitchAudio.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Pitch Audio</h4>
                  {uploadedFiles.pitchAudio.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {Object.values(uploadedFiles).every(files => !files || files.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No files uploaded yet</p>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Upload Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}