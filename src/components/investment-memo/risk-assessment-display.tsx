'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Users,
  Info,
  Target,
  Lightbulb
} from 'lucide-react'
import type { RiskAssessment, RiskLevel } from '@/types'

interface RiskAssessmentDisplayProps {
  riskAssessment: RiskAssessment
  showMitigationStrategies?: boolean
  compact?: boolean
}

export function RiskAssessmentDisplay({ 
  riskAssessment, 
  showMitigationStrategies = true,
  compact = false 
}: RiskAssessmentDisplayProps) {
  
  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          progress: 'bg-green-500'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          progress: 'bg-yellow-500'
        }
      case 'high':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          progress: 'bg-red-500'
        }
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          progress: 'bg-gray-500'
        }
    }
  }

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'high':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getRiskScore = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 25
      case 'medium':
        return 60
      case 'high':
        return 90
      default:
        return 50
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market':
        return <TrendingUp className="h-4 w-4" />
      case 'financial':
        return <DollarSign className="h-4 w-4" />
      case 'operational':
        return <Settings className="h-4 w-4" />
      case 'team':
        return <Users className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const overallRiskColors = getRiskLevelColor(riskAssessment.riskLevel)
  const overallRiskScore = getRiskScore(riskAssessment.riskLevel)

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Risk Assessment</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className={`${overallRiskColors.bg} ${overallRiskColors.text} ${overallRiskColors.border} border`}>
                    {getRiskIcon(riskAssessment.riskLevel)}
                    <span className="ml-1 capitalize">{riskAssessment.riskLevel}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall Risk Level: {riskAssessment.riskLevel.toUpperCase()}</p>
                  {riskAssessment.redFlags.length > 0 && (
                    <p>{riskAssessment.redFlags.length} red flag{riskAssessment.redFlags.length > 1 ? 's' : ''} identified</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Risk Score</span>
              <span>{overallRiskScore}/100</span>
            </div>
            <Progress value={overallRiskScore} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Overall Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRiskIcon(riskAssessment.riskLevel)}
              <div>
                <p className="font-semibold capitalize">{riskAssessment.riskLevel} Risk</p>
                <p className="text-sm text-muted-foreground">
                  Overall investment risk level
                </p>
              </div>
            </div>
            <Badge className={`${overallRiskColors.bg} ${overallRiskColors.text} ${overallRiskColors.border} border text-lg px-4 py-2`}>
              {riskAssessment.riskLevel.toUpperCase()}
            </Badge>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Risk Score</span>
              <span className="font-medium">{overallRiskScore}/100</span>
            </div>
            <Progress value={overallRiskScore} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              Lower scores indicate lower risk
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags Alert */}
      {riskAssessment.redFlags.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Risk Indicators</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p className="font-medium">
                {riskAssessment.redFlags.length} red flag{riskAssessment.redFlags.length > 1 ? 's' : ''} identified:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {riskAssessment.redFlags.map((flag, index) => (
                  <li key={index} className="text-sm">{flag}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Risk Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(riskAssessment.categories).map(([category, data]) => {
              const categoryColors = getRiskLevelColor(data.level)
              const categoryScore = getRiskScore(data.level)
              
              return (
                <Card key={category} className={`border-l-4 ${categoryColors.border.replace('border-', 'border-l-')}`}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium capitalize">{category} Risk</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className={`${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border`}>
                                {data.level.toUpperCase()}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{category.charAt(0).toUpperCase() + category.slice(1)} risk level: {data.level}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Level</span>
                          <span>{categoryScore}/100</span>
                        </div>
                        <Progress value={categoryScore} className="h-2" />
                      </div>
                      
                      {data.factors.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center space-x-1">
                            <Info className="h-3 w-3" />
                            <span>Risk Factors:</span>
                          </p>
                          <ul className="space-y-1">
                            {data.factors.map((factor, index) => (
                              <li key={index} className="text-xs flex items-start space-x-1">
                                <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Analysis */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="detailed-analysis">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Detailed Risk Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {Object.entries(riskAssessment.categories).map(([category, data]) => {
                const categoryColors = getRiskLevelColor(data.level)
                
                return (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category} Risk Analysis</span>
                        <Badge className={`${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border ml-auto`}>
                          {data.level.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.factors.map((factor, index) => (
                          <Alert key={index} className={`${categoryColors.bg} ${categoryColors.border} border`}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className={categoryColors.text}>
                              {factor}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Mitigation Strategies */}
        {showMitigationStrategies && riskAssessment.mitigationStrategies.length > 0 && (
          <AccordionItem value="mitigation-strategies">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>Risk Mitigation Strategies ({riskAssessment.mitigationStrategies.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Recommended strategies to mitigate identified risks:
                </p>
                <div className="space-y-2">
                  {riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <Alert key={index} className="bg-blue-50 border-blue-200">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {strategy}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}