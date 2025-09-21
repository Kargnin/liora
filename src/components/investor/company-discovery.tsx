'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyFilters } from './company-filters'
import { CompanyCard } from './company-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useInvestorStore } from '@/stores/investor-store'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { CompanyOverview } from '@/types'

// Mock data for demonstration - in real app this would come from API
const mockCompanies: CompanyOverview[] = [
  {
    id: '1',
    name: 'TechFlow AI',
    description: 'AI-powered workflow automation platform for enterprise teams',
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
  },
  {
    id: '2',
    name: 'GreenTech Solutions',
    description: 'Sustainable energy solutions for commercial buildings',
    sector: 'CleanTech',
    stage: 'seed',
    foundedYear: 2021,
    location: 'Austin, TX',
    website: 'https://greentech.com',
    tagline: 'Clean energy for everyone',
    employeeCount: 28,
    fundingRaised: 5000000,
    valuation: 25000000
  },
  {
    id: '3',
    name: 'HealthTech Innovations',
    description: 'Digital health platform connecting patients with specialists',
    sector: 'HealthTech',
    stage: 'pre-seed',
    foundedYear: 2023,
    location: 'Boston, MA',
    website: 'https://healthtech.io',
    tagline: 'Healthcare made accessible',
    employeeCount: 12,
    fundingRaised: 1500000,
    valuation: 8000000
  },
  {
    id: '4',
    name: 'FinanceFlow',
    description: 'Modern banking infrastructure for fintech companies',
    sector: 'FinTech',
    stage: 'series-a',
    foundedYear: 2020,
    location: 'New York, NY',
    website: 'https://financeflow.com',
    tagline: 'Banking infrastructure reimagined',
    employeeCount: 67,
    fundingRaised: 25000000,
    valuation: 120000000
  },
  {
    id: '5',
    name: 'EduTech Platform',
    description: 'Personalized learning platform for K-12 education',
    sector: 'EdTech',
    stage: 'seed',
    foundedYear: 2022,
    location: 'Seattle, WA',
    website: 'https://edutech.com',
    tagline: 'Personalized learning for every student',
    employeeCount: 34,
    fundingRaised: 8000000,
    valuation: 35000000
  }
]

export function CompanyDiscovery() {
  const { companies, filters, setFilters, setCompanies } = useInvestorStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')

  // Simulate loading companies
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCompanies(mockCompanies)
      setIsLoading(false)
    }
    
    loadCompanies()
  }, [setCompanies])

  // Update search query in filters when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, searchQuery })
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters, setFilters])

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          company.name.toLowerCase().includes(query) ||
          company.description.toLowerCase().includes(query) ||
          company.sector.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(company.sector)) {
        return false
      }

      // Stage filter
      if (filters.stages.length > 0 && !filters.stages.includes(company.stage)) {
        return false
      }

      // Funding range filter
      if (company.fundingRaised < filters.fundingRange.min || 
          company.fundingRaised > filters.fundingRange.max) {
        return false
      }

      // Location filter
      if (filters.location && 
          !company.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      return true
    })
  }, [companies, filters])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.sectors.length > 0) count++
    if (filters.stages.length > 0) count++
    if (filters.location) count++
    if (filters.fundingRange.min > 0 || filters.fundingRange.max < 100000000) count++
    return count
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Companies</CardTitle>
              <CardDescription>
                Find startups that match your investment criteria
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, sector, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <CompanyFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.sectors.map(sector => (
                <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                  {sector}
                  <button
                    onClick={() => setFilters({
                      ...filters,
                      sectors: filters.sectors.filter(s => s !== sector)
                    })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.stages.map(stage => (
                <Badge key={stage} variant="secondary" className="flex items-center gap-1">
                  {stage}
                  <button
                    onClick={() => setFilters({
                      ...filters,
                      stages: filters.stages.filter(s => s !== stage)
                    })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.location}
                  <button
                    onClick={() => setFilters({ ...filters, location: '' })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            `Showing ${filteredCompanies.length} of ${companies.length} companies`
          )}
        </div>
        {!isLoading && filteredCompanies.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                sectors: [],
                stages: [],
                fundingRange: { min: 0, max: 100000000 },
                location: '',
                searchQuery: ''
              })
              setSearchQuery('')
            }}
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Company Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No companies found"
          description="Try adjusting your search criteria or filters to find more companies."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setFilters({
                sectors: [],
                stages: [],
                fundingRange: { min: 0, max: 100000000 },
                location: '',
                searchQuery: ''
              })
              setSearchQuery('')
            }
          }}
        />
      )}
    </div>
  )
}