'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  ExternalLink,
  Star,
  Eye,
  Phone
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CallRequestDialog } from '@/components/calls'
import { useCalls } from '@/hooks/use-calls'
import { useAppStore } from '@/stores/app-store'
import type { CompanyOverview } from '@/types'

interface CompanyCardProps {
  company: CompanyOverview
}

export function CompanyCard({ company }: CompanyCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const { sendCallRequest } = useCalls()
  const { user } = useAppStore()

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
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'seed':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'series-a':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'series-b':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'series-c+':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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

  // Calculate a mock match percentage based on company attributes
  const calculateMatchPercentage = () => {
    // This would normally be calculated based on investor preferences
    // For demo purposes, we'll use a simple algorithm
    let score = 70 // Base score
    
    if (company.stage === 'series-a' || company.stage === 'seed') score += 10
    if (company.fundingRaised > 5000000) score += 10
    if (company.employeeCount > 20) score += 5
    if (company.foundedYear >= 2020) score += 5
    
    return Math.min(score, 98) // Cap at 98%
  }

  const matchPercentage = calculateMatchPercentage()

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/investor/companies/${company.id}`)
  }

  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (company.website) {
      window.open(company.website, '_blank')
    }
  }

  const handleRequestCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCallDialog(true)
  }

  const handleCallRequest = async (request: any) => {
    try {
      await sendCallRequest(request)
      setShowCallDialog(false)
    } catch (error) {
      console.error('Failed to send call request:', error)
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isHovered ? 'shadow-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {company.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {company.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {company.tagline}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium ${
                matchPercentage >= 90 ? 'bg-green-100 text-green-800' :
                matchPercentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {matchPercentage}% match
            </Badge>
            {company.website && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVisitWebsite}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Description */}
        <div className="text-sm text-muted-foreground line-clamp-2">
          {company.description}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={getSectorColor(company.sector)}>
            {company.sector}
          </Badge>
          <Badge variant="outline" className={getStageColor(company.stage)}>
            {company.stage.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        <Separator />

        {/* Company Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{company.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Founded {company.foundedYear}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{company.employeeCount} employees</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formatFunding(company.fundingRaised)} raised</span>
          </div>
        </div>

        {/* Valuation */}
        {company.valuation && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valuation</span>
              </div>
              <span className="text-sm font-medium">{formatValuation(company.valuation)}</span>
            </div>
          </>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRequestCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Request Call
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implement add to watchlist functionality
            }}
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Call Request Dialog */}
      <CallRequestDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        company={company}
        investorName={user?.name || 'Investor'}
        onSubmit={handleCallRequest}
      />
    </Card>
  )
}