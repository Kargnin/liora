'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Briefcase, 
  GraduationCap, 
  Award, 
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import type { FounderProfile } from '@/types'

interface FounderProfileDisplayProps {
  founder: FounderProfile
  showRedFlags?: boolean
  compact?: boolean
}

export function FounderProfileDisplay({ 
  founder, 
  showRedFlags = true, 
  compact = false 
}: FounderProfileDisplayProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDuration = (duration: string) => {
    // Helper to format duration strings consistently
    return duration.replace(/(\d+)\s*(year|yr|y)/gi, '$1y').replace(/(\d+)\s*(month|mo|m)/gi, '$1m')
  }

  if (compact) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={founder.profileImage} alt={founder.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getInitials(founder.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold truncate">{founder.name}</h3>
                {founder.redFlags.length > 0 && showRedFlags && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="destructive" className="h-5 w-5 p-0 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{founder.redFlags.length} risk indicator{founder.redFlags.length > 1 ? 's' : ''}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{founder.role}</p>
              
              {/* Social Links */}
              <div className="flex space-x-1 mt-1">
                {founder.socialLinks.linkedin && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={founder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-3 w-3" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>LinkedIn Profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {founder.socialLinks.twitter && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={founder.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-3 w-3" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Twitter Profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {founder.socialLinks.github && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={founder.socialLinks.github} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>GitHub Profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={founder.profileImage} alt={founder.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(founder.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{founder.name}</CardTitle>
                <p className="text-muted-foreground">{founder.role}</p>
              </div>
              
              {founder.redFlags.length > 0 && showRedFlags && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{founder.redFlags.length} Risk{founder.redFlags.length > 1 ? 's' : ''}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view risk indicators in detail</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-2">
              {founder.socialLinks.linkedin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <a href={founder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-1" />
                          LinkedIn
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View LinkedIn Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {founder.socialLinks.twitter && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <a href={founder.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-1" />
                          Twitter
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Twitter Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {founder.socialLinks.github && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <a href={founder.socialLinks.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-1" />
                          GitHub
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View GitHub Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bio Section */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center space-x-1">
            <Info className="h-4 w-4" />
            <span>BIOGRAPHY</span>
          </h4>
          <ScrollArea className="h-20">
            <p className="text-sm leading-relaxed">{founder.bio}</p>
          </ScrollArea>
        </div>

        {/* Red Flags Alert */}
        {founder.redFlags.length > 0 && showRedFlags && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Risk Indicators Identified:</p>
                <ul className="list-disc list-inside space-y-1">
                  {founder.redFlags.map((flag, index) => (
                    <li key={index} className="text-sm">{flag}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Information Accordion */}
        <Accordion type="multiple" className="w-full">
          {/* Professional Experience */}
          <AccordionItem value="experience">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Professional Experience ({founder.experience.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {founder.experience.map((exp, index) => (
                  <Card key={index} className="border-l-2 border-l-primary/30">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs">
                                {formatDuration(exp.duration)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duration: {exp.duration}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm">{exp.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Education ({founder.education.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {founder.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{edu.degree}</p>
                      <p className="text-xs text-muted-foreground">{edu.institution}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            {edu.year}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Graduation Year: {edu.year}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Achievements */}
          <AccordionItem value="achievements">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Key Achievements ({founder.achievements.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {founder.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Risk Indicators (if any) */}
          {founder.redFlags.length > 0 && showRedFlags && (
            <AccordionItem value="red-flags">
              <AccordionTrigger className="text-sm text-destructive">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Risk Indicators ({founder.redFlags.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {founder.redFlags.map((flag, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {flag}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}