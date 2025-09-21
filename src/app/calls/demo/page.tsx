'use client'

import { useState } from 'react'
import { Phone, Calendar, Bell, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CallRequestDialog,
  NotificationCenter,
  CallWorkflow,
  CallToastNotifications
} from '@/components/calls'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import type { CompanyOverview, CallRequest, CallResponse } from '@/types'

// Mock data for demo
const mockCompany: CompanyOverview = {
  id: 'company-1',
  name: 'TechFlow AI',
  description: 'AI-powered workflow automation platform for enterprises',
  sector: 'Enterprise Software',
  stage: 'series-a',
  foundedYear: 2022,
  location: 'San Francisco, CA',
  website: 'https://techflow.ai',
  logo: '/api/placeholder/64/64',
  tagline: 'Automate your workflows with AI',
  employeeCount: 25,
  fundingRaised: 5000000,
  valuation: 25000000
}

const mockInvestor = {
  id: 'investor-1',
  name: 'Sarah Chen',
  firm: 'Venture Capital Partners'
}

export default function CallsDemoPage() {
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const {
    callRequests,
    meetings,
    isLoading,
    sendCallRequest,
    respondToCallRequest,
    scheduleMeeting,
    cancelMeeting,
    updateCallStatus
  } = useCalls()

  const { notifications, user } = useAppStore()

  const handleSendCallRequest = async (request: Omit<CallRequest, 'id' | 'timestamp' | 'status'>) => {
    try {
      await sendCallRequest(request)
      console.log('Call request sent successfully')
    } catch (error) {
      console.error('Failed to send call request:', error)
    }
  }

  const handleCallResponse = async (response: CallResponse) => {
    try {
      await respondToCallRequest(response)
      console.log('Call response sent successfully')
    } catch (error) {
      console.error('Failed to respond to call:', error)
    }
  }

  const handleScheduleMeeting = async (callRequestId: string, meetingData: any) => {
    try {
      await scheduleMeeting(callRequestId, {
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 30,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Investment discussion meeting',
        ...meetingData
      })
      console.log('Meeting scheduled successfully')
    } catch (error) {
      console.error('Failed to schedule meeting:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Toast Notifications */}
      <CallToastNotifications
        notifications={notifications}
        onCallRequest={(callRequest) => console.log('Call request received:', callRequest)}
        onCallResponse={(callResponse) => console.log('Call response received:', callResponse)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Scheduling Demo</h1>
          <p className="text-muted-foreground">
            Demonstration of the call scheduling and notification system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter
            onCallAccept={handleCallResponse}
            onCallDecline={handleCallResponse}
          />
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-3 w-3" />
            {user?.type || 'Demo User'}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="request">Request Call</TabsTrigger>
          <TabsTrigger value="workflow">Call Workflow</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Requests
                </CardTitle>
                <CardDescription>
                  Manage incoming and outgoing call requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{callRequests.length}</div>
                <p className="text-sm text-muted-foreground">
                  Active requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Meetings
                </CardTitle>
                <CardDescription>
                  Scheduled and completed meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meetings.length}</div>
                <p className="text-sm text-muted-foreground">
                  Total meetings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Real-time notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <p className="text-sm text-muted-foreground">
                  Unread notifications
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Demo Company Profile</CardTitle>
              <CardDescription>
                Sample company for testing call requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <img 
                  src={mockCompany.logo} 
                  alt={`${mockCompany.name} logo`}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{mockCompany.name}</h3>
                  <p className="text-muted-foreground mb-2">{mockCompany.tagline}</p>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">{mockCompany.sector}</Badge>
                    <Badge variant="outline">{mockCompany.stage}</Badge>
                  </div>
                  <Button onClick={() => setShowCallDialog(true)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Request Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Call Tab */}
        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Request Interface</CardTitle>
              <CardDescription>
                Test the call request dialog and scheduling interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to open the call request dialog and test the scheduling interface.
                </p>
                <Button onClick={() => setShowCallDialog(true)} size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Open Call Request Dialog
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Workflow Management</CardTitle>
              <CardDescription>
                View and manage call requests and scheduled meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallWorkflow
                callRequests={callRequests}
                meetings={meetings}
                onUpdateCallStatus={updateCallStatus}
                onScheduleMeeting={handleScheduleMeeting}
                onCancelMeeting={cancelMeeting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification System</CardTitle>
              <CardDescription>
                Real-time notifications for call requests and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Notifications appear in the notification center (bell icon) and as toast messages.
                  Try sending a call request to see the notification system in action.
                </p>
                
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-sm">Send a call request to see notifications in action</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          <Badge variant="outline">{notification.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call Request Dialog */}
      <CallRequestDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        company={mockCompany}
        investorName={mockInvestor.name}
        onSubmit={handleSendCallRequest}
      />
    </div>
  )
}