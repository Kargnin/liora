'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CallWorkflow, CallToastNotifications } from '@/components/calls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import { Phone, Calendar, Clock, CheckCircle } from 'lucide-react'

export default function InvestorCallsPage() {
  const { user, isAuthenticated, isLoading } = useAuthGuard({ requiredUserType: 'investor' })
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
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled')
  const completedMeetings = meetings.filter(m => m.status === 'completed')

  return (
    <DashboardLayout userType="investor" userName={user.name}>
      {/* Toast Notifications */}
      <CallToastNotifications
        notifications={notifications}
        onCallRequest={(callRequest) => console.log('Call request received:', callRequest)}
        onCallResponse={(callResponse) => console.log('Call response received:', callResponse)}
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Management</h1>
          <p className="text-muted-foreground">
            Manage your call requests and scheduled meetings with founders.
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
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Requests</CardTitle>
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
              <CardTitle className="text-sm font-medium">Completed Meetings</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMeetings.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Call Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Call Workflow</CardTitle>
            <CardDescription>
              Track and manage your call requests and meetings
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