'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CompanyDiscovery } from '@/components/investor/company-discovery'
import { useAuthGuard } from '@/hooks/use-auth-guard'

export default function CompaniesPage() {
  const { user, isAuthenticated, isLoading } = useAuthGuard({ requiredUserType: 'investor' })
  
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Discovery</h1>
          <p className="text-muted-foreground">
            Explore startups and find your next investment opportunity.
          </p>
        </div>
        
        <CompanyDiscovery />
      </div>
    </DashboardLayout>
  )
}