'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CallWorkflow, CallToastNotifications } from '@/components/calls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import { Phone, Calendar, Clock, CheckCircle, Users } from 'lucide-react'

export default function FounderCallsPage() {
  const { user, isAuthenticated, isLoading } = useAuthGuard({ requiredUserType: 'founder' })
  const { 
    callRequests, 
    meetings, 
    respondToCallRequest, 
    scheduleMeeting, 
    cancelMeeting, 
    updateCallStatus 
  } = useCalls()
  const { notifications } = useAppStore()

  // Show loading while hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const pendingRequests = callRequests.filter(r => r.status === 'pending')
  const acceptedRequests = callRequests.filter(r => r.status === 'accepted')
  const declinedRequests = callRequests.filter(r => r.status === 'declined')
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled')
  const completedMeetings = meetings.filter(m => m.status === 'completed')

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
          <h1 className="text-3xl font-bold tracking-tight">Investor Calls</h1>
          <p className="text-muted-foreground">
            Manage call requests from investors and schedule meetings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Need response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Calls</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Ready to schedule</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledMeetings.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(callRequests.map(r => r.investorId)).size}
              </div>
              <p className="text-xs text-muted-foreground">Interested</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Call Requests Alert */}
        {pendingRequests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-800">
                    {pendingRequests.length} Pending Call Request{pendingRequests.length > 1 ? 's' : ''}
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    You have investors waiting for your response. Review and respond to maintain engagement.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Action Required
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Call Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Call Management</CardTitle>
            <CardDescription>
              Review call requests and manage your meeting schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CallWorkflow
              callRequests={callRequests}
              meetings={meetings}
              onUpdateCallStatus={updateCallStatus}
              onScheduleMeeting={scheduleMeeting}
              onCancelMeeting={cancelMeeting}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}