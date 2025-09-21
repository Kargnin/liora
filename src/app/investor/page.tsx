'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, Calendar, Star, Search, Phone } from 'lucide-react'
import { PreferencesSetup } from '@/components/forms/PreferencesSetup'
import { CallWorkflow, CallToastNotifications } from '@/components/calls'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useInvestorStore } from '@/stores/investor-store'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import { useRouter } from 'next/navigation'

export default function InvestorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthGuard({ requiredUserType: 'investor' })
  const { isPreferencesSetupComplete } = useInvestorStore()
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

  return (
    <DashboardLayout userType="investor" userName={user.name}>
      {/* Toast Notifications */}
      <CallToastNotifications
        notifications={notifications}
        onCallRequest={(callRequest) => console.log('Call request received:', callRequest)}
        onCallResponse={(callResponse) => console.log('Call response received:', callResponse)}
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">
              Discover new investment opportunities and manage your portfolio.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/investor/companies')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Discover Companies
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Matches</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">90%+ match</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Calls</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetings.length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Preferences Setup - Show if not complete */}
        {!isPreferencesSetupComplete && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <PreferencesSetup />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Why Set Preferences?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Setting up your investment preferences helps us:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Find startups that match your criteria</li>
                  <li>• Prioritize companies by your interests</li>
                  <li>• Send relevant notifications</li>
                  <li>• Improve recommendation accuracy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Matches</CardTitle>
                  <CardDescription>
                    Companies that best match your investment preferences
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/investor/companies')}
                >
                  Browse All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">TechFlow AI</p>
                    <p className="text-sm text-muted-foreground">AI/ML • Series A</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">94% match</p>
                  <Button size="sm" className="mt-1" onClick={() => router.push('/investor/companies/1')}>View Details</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">GreenTech Solutions</p>
                    <p className="text-sm text-muted-foreground">CleanTech • Seed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">91% match</p>
                  <Button size="sm" className="mt-1" onClick={() => router.push('/investor/companies/2')}>View Details</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">HealthTech Innovations</p>
                    <p className="text-sm text-muted-foreground">HealthTech • Pre-seed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">88% match</p>
                  <Button size="sm" className="mt-1" onClick={() => router.push('/investor/companies/3')}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Call Management</CardTitle>
              <CardDescription>
                Manage your call requests and scheduled meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callRequests.length > 0 || meetings.length > 0 ? (
                <div className="space-y-4">
                  {/* Recent Call Requests */}
                  {callRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Call Request</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {request.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upcoming Meetings */}
                  {meetings.slice(0, 2).map((meeting) => (
                    <div key={meeting.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Scheduled Meeting</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meeting.scheduledTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/investor/calls')}
                  >
                    View All Calls
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No calls scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    Request calls with companies you're interested in
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}