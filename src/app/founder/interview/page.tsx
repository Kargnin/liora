'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useFounderStore } from '@/stores/founder-store'

export default function FounderInterviewPage() {
  const { user, isAuthenticated } = useAuthGuard({ requiredUserType: 'founder' })
  const { analysisStatus, analysisProgress, companyData } = useFounderStore()

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const hasBasicInfo = companyData.name && companyData.sector && companyData.stage

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>
      case 'in-progress':
        return <Badge variant="default"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <DashboardLayout userType="founder" userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Interview</h1>
          <p className="text-muted-foreground">
            Complete your AI-powered interview to generate your investment memo
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Interview Status</span>
              </CardTitle>
              <CardDescription>
                Current status of your AI interview process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                {getStatusBadge()}
              </div>
              
              {analysisStatus === 'in-progress' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Progress:</span>
                    <span className="text-sm">{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysisStatus === 'completed' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Your interview has been completed successfully! Your investment memo is now available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Learn about the AI interview process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Camera & Microphone Check</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll test your audio and video setup
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium">AI-Powered Interview</p>
                    <p className="text-sm text-muted-foreground">
                      Answer questions about your startup and vision
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Investment Memo Generation</p>
                    <p className="text-sm text-muted-foreground">
                      AI creates a comprehensive memo for investors
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Start?</CardTitle>
            <CardDescription>
              {!hasBasicInfo 
                ? 'Complete your company profile first before starting the interview'
                : 'Begin your AI interview to generate your investment memo'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasBasicInfo ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Please complete your company profile before starting the interview
                </p>
                <Button onClick={() => window.location.href = '/founder/profile'}>
                  Complete Profile
                </Button>
              </div>
            ) : analysisStatus === 'pending' ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ready to start your AI interview? This will take about 15-20 minutes.
                </p>
                <Button size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </Button>
              </div>
            ) : analysisStatus === 'in-progress' ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground mb-4">
                  Your interview is being processed. This may take a few minutes.
                </p>
                <Button variant="outline" disabled>
                  Processing...
                </Button>
              </div>
            ) : analysisStatus === 'completed' ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Interview completed! Your investment memo has been generated.
                </p>
                <div className="space-x-4">
                  <Button>
                    View Investment Memo
                  </Button>
                  <Button variant="outline">
                    Retake Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  There was an error processing your interview. Please try again.
                </p>
                <Button variant="outline">
                  Retry Interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}