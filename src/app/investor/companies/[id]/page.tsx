'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  ExternalLink,
  Star,
  Phone,
  Mail
} from 'lucide-react'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { InvestmentMemoDisplay } from '@/components/investment-memo/investment-memo-display'
import { mockInvestmentMemo } from '@/lib/mock-data'
import type { CompanyOverview } from '@/types'

// Mock company data - in real app this would come from API
const mockCompany: CompanyOverview = {
  id: '1',
  name: 'TechFlow AI',
  description: 'TechFlow AI is revolutionizing enterprise workflow automation through advanced artificial intelligence and machine learning technologies. Our platform helps businesses streamline their operations, reduce manual tasks, and increase productivity by up to 40%. We serve Fortune 500 companies across various industries including finance, healthcare, and manufacturing.',
  sector: 'AI/ML',
  stage: 'series-a',
  foundedYear: 2022,
  location: 'San Francisco, CA',
  website: 'https://techflow.ai',
  logo: '/logos/techflow.png',
  tagline: 'Automate your workflow with AI',
  employeeCount: 45,
  fundingRaised: 12000000,
  valuation: 50000000
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthGuard({ requiredUserType: 'investor' })
  const [company, setCompany] = useState<CompanyOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompany = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setCompany(mockCompany)
      setIsLoading(false)
    }
    
    loadCompany()
  }, [params.id])

  // Show loading while hydrating
  if (authLoading) {
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

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount}`
  }

  const formatValuation = (amount?: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    return `$${amount}`
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pre-seed':
        return 'bg-gray-100 text-gray-800'
      case 'seed':
        return 'bg-green-100 text-green-800'
      case 'series-a':
        return 'bg-blue-100 text-blue-800'
      case 'series-b':
        return 'bg-purple-100 text-purple-800'
      case 'series-c+':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSectorColor = (sector: string) => {
    const colors = {
      'AI/ML': 'bg-indigo-100 text-indigo-800',
      'FinTech': 'bg-emerald-100 text-emerald-800',
      'HealthTech': 'bg-red-100 text-red-800',
      'EdTech': 'bg-yellow-100 text-yellow-800',
      'CleanTech': 'bg-green-100 text-green-800',
      'E-commerce': 'bg-pink-100 text-pink-800',
      'SaaS': 'bg-blue-100 text-blue-800',
      'Cybersecurity': 'bg-slate-100 text-slate-800',
      'IoT': 'bg-cyan-100 text-cyan-800',
      'Blockchain': 'bg-violet-100 text-violet-800'
    }
    return colors[sector as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <DashboardLayout userType="investor" userName={user.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        ) : company ? (
          <div className="space-y-6">
            {/* Company Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={company.logo} alt={company.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {company.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold">{company.name}</CardTitle>
                      <CardDescription className="text-lg">{company.tagline}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getSectorColor(company.sector)}>
                          {company.sector}
                        </Badge>
                        <Badge variant="outline" className={getStageColor(company.stage)}>
                          {company.stage.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </Button>
                    {company.website && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(company.website, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>

            {/* Company Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Location</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company.location}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Founded</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company.foundedYear}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company.employeeCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Funding Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatFunding(company.fundingRaised)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Valuation and Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Valuation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatValuation(company.valuation)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current estimated valuation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interested in this company?</CardTitle>
                  <CardDescription>
                    Schedule a call with the founders to learn more
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule Call with Founders
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Request More Information
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Investment Memo Display */}
            <InvestmentMemoDisplay memo={mockInvestmentMemo} />
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p>Company not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}