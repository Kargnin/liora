'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CompanyDetailsForm } from '@/components/forms/CompanyDetailsForm'
import { CallToastNotifications } from '@/components/calls'
import { 
  Building2, 
  Upload, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Edit,
  Play,
  FileText,
  TrendingUp,
  Phone,
  Bell
} from 'lucide-react'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useFounderStore } from '@/stores/founder-store'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import { type CompanyDetailsFormData } from '@/types'

export default function FounderDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthGuard({ requiredUserType: 'founder' })
  const [showCompanyForm, setShowCompanyForm] = React.useState(false)
  
  const {
    companyData,
    uploadedFiles,
    isFormComplete,
    analysisStatus,
    analysisProgress,
    updateCompanyData,
    setFormComplete,
    setAnalysisStatus,
    saveCompanyData
  } = useFounderStore()
  
  const { callRequests, meetings } = useCalls()
  const { notifications } = useAppStore()

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const requiredFields = ['name', 'tagline', 'description', 'sector', 'stage', 'foundedYear', 'location', 'employeeCount']
    const completedFields = requiredFields.filter(field => companyData[field as keyof CompanyDetailsFormData])
    const basicCompletion = (completedFields.length / requiredFields.length) * 60 // 60% for basic info
    
    const hasFiles = Object.values(uploadedFiles).some(files => files && files.length > 0)
    const fileCompletion = hasFiles ? 25 : 0 // 25% for files
    
    const interviewCompletion = analysisStatus === 'completed' ? 15 : 0 // 15% for interview
    
    return Math.round(basicCompletion + fileCompletion + interviewCompletion)
  }

  const profileCompletion = calculateProfileCompletion()
  const hasBasicInfo = companyData.name && companyData.sector && companyData.stage
  const hasFiles = Object.values(uploadedFiles).some(files => files && files.length > 0)
  const fileCount = Object.values(uploadedFiles).reduce((count, files) => count + (files?.length || 0), 0)

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
      setFormComplete(true)
      await saveCompanyData()
      setShowCompanyForm(false)
      
      // Start AI analysis if not already started
      if (analysisStatus === 'pending') {
        setAnalysisStatus('in-progress')
      }
    } catch (error) {
      console.error('Failed to complete setup:', error)
    }
  }

  const handleStartInterview = () => {
    // Navigate to AI interview page (to be implemented in future tasks)
    router.push('/founder/interview')
  }

  const getAnalysisStatusBadge = () => {
    switch (analysisStatus) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'in-progress':
        return <Badge variant="default"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Show company form if profile is not complete and user wants to edit
  if (showCompanyForm || (!hasBasicInfo && profileCompletion < 30)) {
    return (
      <DashboardLayout userType="founder" userName={user.name}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Profile Setup</h1>
              <p className="text-muted-foreground">
                Complete your company profile to start connecting with investors
              </p>
            </div>
            {hasBasicInfo && (
              <Button variant="outline" onClick={() => setShowCompanyForm(false)}>
                Back to Dashboard
              </Button>
            )}
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
      {/* Toast Notifications */}
      <CallToastNotifications
        notifications={notifications}
        onCallRequest={(callRequest) => console.log('Call request received:', callRequest)}
        onCallResponse={(callResponse) => console.log('Call response received:', callResponse)}
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your startup profile today.
          </p>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-800">Complete Your Profile</CardTitle>
                  <CardDescription className="text-orange-600">
                    Your profile is {profileCompletion}% complete. Finish setup to maximize investor visibility.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCompanyForm(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Complete Profile
                </Button>
              </div>
              <Progress value={profileCompletion} className="mt-4" />
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <p className="text-xs text-muted-foreground">
                {profileCompletion === 100 ? 'Complete' : 'In Progress'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Call Requests</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{callRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                {callRequests.filter(r => r.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getAnalysisStatusBadge()}
              </div>
              {analysisStatus === 'in-progress' && (
                <Progress value={analysisProgress} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fileCount}</div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Complete these actions to improve your profile visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasBasicInfo && (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="flex-1">Complete company information</span>
                  <Button size="sm" onClick={() => setShowCompanyForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Setup
                  </Button>
                </div>
              )}
              
              {hasBasicInfo && !hasFiles && (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="flex-1">Upload pitch materials</span>
                  <Button size="sm" onClick={() => setShowCompanyForm(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              )}
              
              {hasBasicInfo && analysisStatus === 'pending' && (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="flex-1">Complete AI interview</span>
                  <Button size="sm" onClick={handleStartInterview}>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              )}
              
              {analysisStatus === 'completed' && (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="flex-1">Review investment memo</span>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              )}
              
              {profileCompletion > 80 && (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="flex-1">Browse investor matches</span>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Explore
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyData.name ? (
                <>
                  <div>
                    <h3 className="font-semibold">{companyData.name}</h3>
                    <p className="text-sm text-muted-foreground">{companyData.tagline}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sector:</span>
                      <p className="font-medium">{companyData.sector}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stage:</span>
                      <p className="font-medium">{companyData.stage}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Founded:</span>
                      <p className="font-medium">{companyData.foundedYear}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Team Size:</span>
                      <p className="font-medium">{companyData.employeeCount}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCompanyForm(true)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No company information yet</p>
                  <Button onClick={() => setShowCompanyForm(true)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Company Info
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