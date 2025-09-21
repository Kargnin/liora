'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Filter } from 'lucide-react'
import type { CompanyFilters as CompanyFiltersType } from '@/types'

interface CompanyFiltersProps {
  filters: CompanyFiltersType
  onFiltersChange: (filters: CompanyFiltersType) => void
}

const SECTORS = [
  'AI/ML',
  'FinTech',
  'HealthTech',
  'EdTech',
  'CleanTech',
  'E-commerce',
  'SaaS',
  'Cybersecurity',
  'IoT',
  'Blockchain',
  'Gaming',
  'Media & Entertainment'
]

const STAGES = [
  'pre-seed',
  'seed',
  'series-a',
  'series-b',
  'series-c+'
]

const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Boston, MA',
  'Seattle, WA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Denver, CO',
  'Miami, FL',
  'Atlanta, GA'
]

export function CompanyFilters({ filters, onFiltersChange }: CompanyFiltersProps) {
  const [fundingRange, setFundingRange] = useState([
    filters.fundingRange.min / 1000000,
    filters.fundingRange.max / 1000000
  ])

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked
      ? [...filters.sectors, sector]
      : filters.sectors.filter(s => s !== sector)
    
    onFiltersChange({
      ...filters,
      sectors: newSectors
    })
  }

  const handleStageChange = (stage: string, checked: boolean) => {
    const newStages = checked
      ? [...filters.stages, stage]
      : filters.stages.filter(s => s !== stage)
    
    onFiltersChange({
      ...filters,
      stages: newStages
    })
  }

  const handleLocationChange = (location: string) => {
    onFiltersChange({
      ...filters,
      location: location === 'all' ? '' : location
    })
  }

  const handleFundingRangeChange = (values: number[]) => {
    setFundingRange(values)
    onFiltersChange({
      ...filters,
      fundingRange: {
        min: values[0] * 1000000,
        max: values[1] * 1000000
      }
    })
  }

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Companies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sectors Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sectors</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SECTORS.map(sector => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={`sector-${sector}`}
                  checked={filters.sectors.includes(sector)}
                  onCheckedChange={(checked) => 
                    handleSectorChange(sector, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`sector-${sector}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {sector}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stages Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Funding Stages</Label>
          <div className="flex flex-wrap gap-3">
            {STAGES.map(stage => (
              <div key={stage} className="flex items-center space-x-2">
                <Checkbox
                  id={`stage-${stage}`}
                  checked={filters.stages.includes(stage)}
                  onCheckedChange={(checked) => 
                    handleStageChange(stage, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`stage-${stage}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {stage.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Location Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Location</Label>
          <Select
            value={filters.location || 'all'}
            onValueChange={handleLocationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Funding Range Filter */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Funding Raised</Label>
          <div className="px-3">
            <Slider
              value={fundingRange}
              onValueChange={handleFundingRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatFunding(fundingRange[0] * 1000000)}</span>
              <span>{formatFunding(fundingRange[1] * 1000000)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Filter Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onFiltersChange({
                sectors: [],
                stages: [],
                fundingRange: { min: 0, max: 100000000 },
                location: '',
                searchQuery: filters.searchQuery
              })
              setFundingRange([0, 100])
            }}
          >
            Clear All
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {filters.sectors.length + filters.stages.length + 
             (filters.location ? 1 : 0) + 
             (filters.fundingRange.min > 0 || filters.fundingRange.max < 100000000 ? 1 : 0)} filters active
          </div>
        </div>
      </CardContent>
    </Card>
  )
}