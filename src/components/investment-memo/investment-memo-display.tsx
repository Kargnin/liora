'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Award,
  GraduationCap,
  Briefcase,
  Shield,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import type { InvestmentMemo, RiskLevel } from '@/types'

interface InvestmentMemoDisplayProps {
  memo: InvestmentMemo
  isLoading?: boolean
}

export function InvestmentMemoDisplay({ memo, isLoading = false }: InvestmentMemoDisplayProps) {


  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Memo</CardTitle>
          <CardDescription>Loading analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Investment Memo Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Investment Memo</CardTitle>
              <CardDescription>
                Comprehensive analysis for {memo.overview.name} • Version {memo.version}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                Updated {new Date(memo.updatedAt).toLocaleDateString()}
              </Badge>
              <Badge 
                className={`text-sm ${
                  memo.recommendation.score >= 80 
                    ? 'bg-green-100 text-green-800' 
                    : memo.recommendation.score >= 60 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Score: {memo.recommendation.score}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="founders">Founders</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
        </TabsList>

        {/* Company Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">COMPANY DETAILS</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{memo.overview.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Founded {memo.overview.foundedYear}</span>
                      </div>
                      {memo.overview.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={memo.overview.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center space-x-1"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">STAGE & SECTOR</h4>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">{memo.overview.sector}</Badge>
                      <Badge variant="outline">{memo.overview.stage.replace('-', ' ').toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">KEY METRICS</h4>
                    <div className="grid gap-3 grid-cols-2">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">{memo.overview.employeeCount}</div>
                        <div className="text-xs text-muted-foreground">Employees</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">{formatLargeNumber(memo.overview.fundingRaised)}</div>
                        <div className="text-xs text-muted-foreground">Funding Raised</div>
                      </div>
                    </div>
                  </div>
                  
                  {memo.overview.valuation && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">VALUATION</h4>
                      <div className="text-center p-3 bg-primary/5 rounded-lg border">
                        <div className="text-3xl font-bold text-primary">{formatLargeNumber(memo.overview.valuation)}</div>
                        <div className="text-xs text-muted-foreground">Current Valuation</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">COMPANY DESCRIPTION</h4>
                <ScrollArea className="h-32">
                  <p className="text-sm leading-relaxed">{memo.overview.description}</p>
                </ScrollArea>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">INVESTMENT THESIS</h4>
                <ScrollArea className="h-24">
                  <p className="text-sm leading-relaxed">{memo.recommendation.investmentThesis}</p>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Market Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Market Size</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Market</span>
                        <span className="font-semibold">
                          {formatCurrency(memo.marketAnalysis.marketSize.current, memo.marketAnalysis.marketSize.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Projected ({memo.marketAnalysis.marketSize.year})</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(memo.marketAnalysis.marketSize.projected, memo.marketAnalysis.marketSize.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Growth Rate</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {formatPercentage(memo.marketAnalysis.growthRate)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Competitive Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-lg px-4 py-2 ${
                          memo.marketAnalysis.competitivePosition === 'leader' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : memo.marketAnalysis.competitivePosition === 'challenger'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : memo.marketAnalysis.competitivePosition === 'follower'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        {memo.marketAnalysis.competitivePosition.charAt(0).toUpperCase() + 
                         memo.marketAnalysis.competitivePosition.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">MARKET TRENDS</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {memo.marketAnalysis.marketTrends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              {memo.marketAnalysis.chartData.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">GROWTH TRAJECTORY</h4>
                    <Card>
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead>Market Size</TableHead>
                              {memo.marketAnalysis.chartData.some(d => d.companyRevenue) && (
                                <TableHead>Company Revenue</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memo.marketAnalysis.chartData.map((data, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{data.year}</TableCell>
                                <TableCell>{formatLargeNumber(data.marketSize)}</TableCell>
                                {data.companyRevenue && (
                                  <TableCell>{formatLargeNumber(data.companyRevenue)}</TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>  
      {/* Founders Tab */}
        <TabsContent value="founders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Founder Profiles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {memo.founders.map((founder, index) => (
                  <Card key={founder.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={founder.profileImage} alt={founder.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {founder.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold">{founder.name}</h3>
                            <p className="text-muted-foreground">{founder.role}</p>
                            
                            {/* Social Links */}
                            <div className="flex space-x-2 mt-2">
                              {founder.socialLinks.linkedin && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={founder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {founder.socialLinks.twitter && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={founder.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {founder.socialLinks.github && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={founder.socialLinks.github} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>

                          <ScrollArea className="h-20">
                            <p className="text-sm leading-relaxed">{founder.bio}</p>
                          </ScrollArea>

                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="experience">
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span>Professional Experience</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3">
                                  {founder.experience.map((exp, expIndex) => (
                                    <div key={expIndex} className="border-l-2 border-muted pl-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">{exp.role}</h4>
                                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {exp.duration}
                                        </Badge>
                                      </div>
                                      <p className="text-sm mt-1">{exp.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="education">
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Education</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {founder.education.map((edu, eduIndex) => (
                                    <div key={eduIndex} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                      <div>
                                        <p className="font-medium text-sm">{edu.degree}</p>
                                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {edu.year}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="achievements">
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4" />
                                  <span>Key Achievements</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {founder.achievements.map((achievement, achIndex) => (
                                    <div key={achIndex} className="flex items-center space-x-2">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">{achievement}</span>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {founder.redFlags.length > 0 && (
                              <AccordionItem value="red-flags">
                                <AccordionTrigger className="text-sm text-red-600">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Risk Indicators</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {founder.redFlags.map((flag, flagIndex) => (
                                      <div key={flagIndex} className="flex items-center space-x-2 p-2 bg-red-50 rounded border border-red-200">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <span className="text-sm text-red-800">{flag}</span>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                          </Accordion>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competition Tab */}
        <TabsContent value="competition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Competitive Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">MARKET POSITION</h4>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm leading-relaxed">{memo.competition.marketPosition}</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">COMPETITIVE ADVANTAGES</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {memo.competition.competitiveAdvantages.map((advantage, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">COMPETITOR ANALYSIS</h4>
                <div className="space-y-4">
                  {memo.competition.competitors.map((competitor, index) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger asChild>
                        <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h4 className="font-semibold">{competitor.name}</h4>
                                  <p className="text-sm text-muted-foreground">{competitor.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium">{formatLargeNumber(competitor.fundingRaised)}</div>
                                  <div className="text-xs text-muted-foreground">Funding Raised</div>
                                </div>
                                {competitor.marketShare && (
                                  <div className="text-right">
                                    <div className="text-sm font-medium">{competitor.marketShare}%</div>
                                    <div className="text-xs text-muted-foreground">Market Share</div>
                                  </div>
                                )}
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Card className="mt-2 border-l-4 border-l-muted">
                          <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h5 className="font-medium text-green-700 mb-2">Strengths</h5>
                                <div className="space-y-1">
                                  {competitor.strengths.map((strength, sIndex) => (
                                    <div key={sIndex} className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      <span className="text-sm">{strength}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium text-red-700 mb-2">Weaknesses</h5>
                                <div className="space-y-1">
                                  {competitor.weaknesses.map((weakness, wIndex) => (
                                    <div key={wIndex} className="flex items-center space-x-2">
                                      <XCircle className="h-3 w-3 text-red-600" />
                                      <span className="text-sm">{weakness}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Key Performance Indicators</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Revenue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(memo.kpis.revenue.current)}</div>
                      <div className="text-sm text-muted-foreground">Current Revenue</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={memo.kpis.revenue.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {memo.kpis.revenue.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(memo.kpis.revenue.growth)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Growth Rate</span>
                    </div>
                    {memo.kpis.revenue.recurring && (
                      <div>
                        <Progress value={(memo.kpis.revenue.recurring / memo.kpis.revenue.current) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Recurring Revenue</span>
                          <span>{formatCurrency(memo.kpis.revenue.recurring)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Customers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{formatLargeNumber(memo.kpis.customers.total)}</div>
                      <div className="text-sm text-muted-foreground">Total Customers</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={memo.kpis.customers.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {memo.kpis.customers.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(memo.kpis.customers.growth)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Growth Rate</span>
                    </div>
                    {memo.kpis.customers.churn && (
                      <div>
                        <Progress value={memo.kpis.customers.churn} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Churn Rate</span>
                          <span>{formatPercentage(memo.kpis.customers.churn)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-purple-600" />
                      <span>Sector Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {Object.entries(memo.kpis.sectorSpecific).map(([key, value], sectorIndex) => (
                          <div key={`${key}-${sectorIndex}`} className="flex justify-between items-center text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <Badge variant="outline">
                              {typeof value === 'number' 
                                ? value > 1000 
                                  ? formatLargeNumber(value)
                                  : value.toString()
                                : value.toString()
                              }
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* KPI Summary Table */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">PERFORMANCE SUMMARY</h4>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead>Growth Rate</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Revenue</TableCell>
                          <TableCell>{formatCurrency(memo.kpis.revenue.current)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={memo.kpis.revenue.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {formatPercentage(memo.kpis.revenue.growth)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {memo.kpis.revenue.growth >= 20 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : memo.kpis.revenue.growth >= 10 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Customer Growth</TableCell>
                          <TableCell>{formatLargeNumber(memo.kpis.customers.total)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={memo.kpis.customers.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {formatPercentage(memo.kpis.customers.growth)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {memo.kpis.customers.growth >= 15 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : memo.kpis.customers.growth >= 5 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent> 
       {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Risk Level */}
              <Card className={`border-2 ${getRiskLevelColor(memo.riskAssessment.riskLevel)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-3">
                    {getRiskIcon(memo.riskAssessment.riskLevel)}
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {memo.riskAssessment.riskLevel.toUpperCase()} RISK
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Risk Assessment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Risk Categories */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-4">RISK CATEGORIES</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(memo.riskAssessment.categories).map(([category, data]) => (
                    <Card key={category} className="border-l-4 border-l-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg capitalize flex items-center justify-between">
                          <span>{category} Risk</span>
                          <Badge className={getRiskLevelColor(data.level)}>
                            {getRiskIcon(data.level)}
                            <span className="ml-1">{data.level.toUpperCase()}</span>
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-24">
                          <div className="space-y-1">
                            {data.factors.map((factor, index) => (
                              <div key={index} className="flex items-start space-x-2 text-sm">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                                <span>{factor}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Red Flags */}
              {memo.riskAssessment.redFlags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">RED FLAGS</h4>
                  <div className="space-y-2">
                    {memo.riskAssessment.redFlags.map((flag, flagIndex) => (
                      <Card key={flagIndex} className="border-red-200 bg-red-50">
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-800">{flag}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Mitigation Strategies */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">MITIGATION STRATEGIES</h4>
                <Accordion type="single" collapsible className="w-full">
                  {memo.riskAssessment.mitigationStrategies.map((strategy, strategyIndex) => (
                    <AccordionItem key={strategyIndex} value={`strategy-${strategyIndex}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Strategy {strategyIndex + 1}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800">{strategy}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <Separator />

              {/* Risk Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Key Factors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(memo.riskAssessment.categories).map(([category, data]) => (
                        <TableRow key={category}>
                          <TableCell className="font-medium capitalize">{category}</TableCell>
                          <TableCell>
                            <Badge className={getRiskLevelColor(data.level)}>
                              {data.level.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {data.factors.slice(0, 2).join(', ')}
                              {data.factors.length > 2 && ` +${data.factors.length - 2} more`}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Investment Recommendation Summary */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Investment Recommendation</span>
            <Badge 
              className={`text-lg px-4 py-2 ${
                memo.recommendation.score >= 80 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : memo.recommendation.score >= 60 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {memo.recommendation.score >= 80 ? 'STRONG BUY' : 
               memo.recommendation.score >= 60 ? 'MODERATE BUY' : 'HOLD/PASS'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">INVESTMENT SCORE</h4>
              <div className="flex items-center space-x-4">
                <Progress value={memo.recommendation.score} className="flex-1 h-3" />
                <span className="text-2xl font-bold">{memo.recommendation.score}/100</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">REASONING</h4>
              <ScrollArea className="h-24">
                <p className="text-sm leading-relaxed">{memo.recommendation.reasoning}</p>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}