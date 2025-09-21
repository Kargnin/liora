'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, AlertTriangle, Info } from 'lucide-react'
import { FounderProfileDisplay } from './founder-profile-display'
import type { FounderProfile } from '@/types'

interface FoundersDisplayProps {
  founders: FounderProfile[]
  showRedFlags?: boolean
  compact?: boolean
  title?: string
}

export function FoundersDisplay({ 
  founders, 
  showRedFlags = true, 
  compact = false,
  title = "Founder Profiles"
}: FoundersDisplayProps) {
  
  const totalRedFlags = founders.reduce((total, founder) => total + founder.redFlags.length, 0)
  const foundersWithRedFlags = founders.filter(founder => founder.redFlags.length > 0).length

  if (founders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>No founder information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{title}</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{founders.length} Founder{founders.length > 1 ? 's' : ''}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of founders</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {totalRedFlags > 0 && showRedFlags && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{totalRedFlags} Risk{totalRedFlags > 1 ? 's' : ''}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>{totalRedFlags} total risk indicator{totalRedFlags > 1 ? 's' : ''}</p>
                        <p>{foundersWithRedFlags} founder{foundersWithRedFlags > 1 ? 's' : ''} with risks</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Summary Alert */}
      {totalRedFlags > 0 && showRedFlags && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                Team Risk Summary: {totalRedFlags} risk indicator{totalRedFlags > 1 ? 's' : ''} identified across {foundersWithRedFlags} founder{foundersWithRedFlags > 1 ? 's' : ''}
              </p>
              <p className="text-sm">
                Review individual founder profiles below for detailed risk analysis.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Founder Profiles */}
      <div className="space-y-4">
        {founders.map((founder, index) => (
          <div key={founder.id}>
            {!compact && index > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex-1 h-px bg-border"></div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Info className="h-3 w-3" />
                        <span>Founder {index + 1}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Founder profile {index + 1} of {founders.length}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            )}
            
            <FounderProfileDisplay
              founder={founder}
              showRedFlags={showRedFlags}
              compact={compact}
            />
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      {!compact && founders.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Team Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{founders.length}</div>
                <div className="text-xs text-muted-foreground">Total Founders</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {founders.reduce((total, founder) => total + founder.experience.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Combined Experience</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {founders.reduce((total, founder) => total + founder.achievements.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Achievements</div>
              </div>
            </div>
            
            {totalRedFlags > 0 && showRedFlags && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Risk Indicators</span>
                  <Badge variant="destructive">{totalRedFlags}</Badge>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  {foundersWithRedFlags} of {founders.length} founders have identified risk factors
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}