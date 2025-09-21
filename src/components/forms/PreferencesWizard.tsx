'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { InvestorPreferences } from '@/types'

// Validation schema for preferences
const preferencesSchema = z.object({
  sectors: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(100)
  })).min(1, 'Select at least one sector'),
  stages: z.array(z.object({
    stage: z.string(),
    weight: z.number().min(0).max(100)
  })).min(1, 'Select at least one stage'),
  geographies: z.array(z.string()).min(1, 'Select at least one geography'),
  investmentRange: z.object({
    min: z.number().min(0),
    max: z.number().min(1000)
  }).refine(data => data.max > data.min, {
    message: 'Maximum must be greater than minimum',
    path: ['max']
  }),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  criteria: z.object({
    revenueWeight: z.number().min(0).max(100),
    teamWeight: z.number().min(0).max(100),
    marketWeight: z.number().min(0).max(100),
    productWeight: z.number().min(0).max(100),
    tractionWeight: z.number().min(0).max(100)
  })
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

// Available options
const AVAILABLE_SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'SaaS', 'AI/ML',
  'Biotech', 'Fintech', 'EdTech', 'CleanTech', 'Gaming', 'Media',
  'Real Estate', 'Transportation', 'Food & Beverage', 'Manufacturing'
]

const AVAILABLE_STAGES = [
  'pre-seed', 'seed', 'series-a', 'series-b', 'series-c+'
]

const AVAILABLE_GEOGRAPHIES = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 
  'Middle East', 'Africa', 'Global'
]

interface PreferencesWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (preferences: InvestorPreferences) => void
  initialPreferences?: InvestorPreferences | null
}

export function PreferencesWizard({ 
  isOpen, 
  onClose, 
  onComplete, 
  initialPreferences 
}: PreferencesWizardProps) {
  const [activeTab, setActiveTab] = useState('sectors')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [pendingPreferences, setPendingPreferences] = useState<InvestorPreferences | null>(null)

  // Initialize form with existing preferences or defaults
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialPreferences || {
      sectors: [],
      stages: [],
      geographies: [],
      investmentRange: {
        min: 10000,
        max: 10000000
      },
      riskTolerance: 'medium',
      criteria: {
        revenueWeight: 20,
        teamWeight: 25,
        marketWeight: 20,
        productWeight: 20,
        tractionWeight: 15
      }
    }
  })

  const handleSave = (data: PreferencesFormData) => {
    // Validate that weights sum to 100
    const totalWeight = Object.values(data.criteria).reduce((sum, weight) => sum + weight, 0)
    if (Math.abs(totalWeight - 100) > 1) {
      form.setError('criteria.revenueWeight', {
        message: 'All criteria weights must sum to 100%'
      })
      return
    }

    setPendingPreferences(data as InvestorPreferences)
    setShowSaveDialog(true)
  }

  const confirmSave = () => {
    if (pendingPreferences) {
      onComplete(pendingPreferences)
      setShowSaveDialog(false)
      onClose()
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  // Calculate completion progress
  const getCompletionProgress = () => {
    const values = form.getValues()
    let completed = 0
    const total = 5

    if (values.sectors?.length > 0) completed++
    if (values.stages?.length > 0) completed++
    if (values.geographies?.length > 0) completed++
    if (values.investmentRange?.min >= 0 && values.investmentRange?.max > values.investmentRange?.min) completed++
    if (values.riskTolerance) completed++

    return (completed / total) * 100
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investment Preferences</DialogTitle>
            <DialogDescription>
              Configure your investment preferences to receive personalized startup recommendations.
            </DialogDescription>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Setup Progress</span>
                <span>{Math.round(getCompletionProgress())}%</span>
              </div>
              <Progress value={getCompletionProgress()} className="w-full" />
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sectors">Sectors</TabsTrigger>
                  <TabsTrigger value="stages">Stages</TabsTrigger>
                  <TabsTrigger value="criteria">Criteria</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="sectors" className="space-y-4">
                  <SectorsTab form={form} />
                </TabsContent>

                <TabsContent value="stages" className="space-y-4">
                  <StagesTab form={form} />
                </TabsContent>

                <TabsContent value="criteria" className="space-y-4">
                  <CriteriaTab form={form} />
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <DetailsTab form={form} />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Preferences
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preferences</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these investment preferences? This will update your startup recommendations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Sectors Tab Component
function SectorsTab({ form }: { form: ReturnType<typeof useForm<PreferencesFormData>> }) {
  const sectors = form.watch('sectors') || []

  const addSector = (sectorName: string) => {
    const currentSectors = form.getValues('sectors') || []
    if (!currentSectors.find((s: { name: string; weight: number }) => s.name === sectorName)) {
      form.setValue('sectors', [...currentSectors, { name: sectorName, weight: 10 }])
    }
  }

  const removeSector = (sectorName: string) => {
    const currentSectors = form.getValues('sectors') || []
    form.setValue('sectors', currentSectors.filter((s: { name: string; weight: number }) => s.name !== sectorName))
  }

  const updateSectorWeight = (sectorName: string, weight: number) => {
    const currentSectors = form.getValues('sectors') || []
    form.setValue('sectors', currentSectors.map((s: { name: string; weight: number }) => 
      s.name === sectorName ? { ...s, weight } : s
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Preferences</CardTitle>
        <CardDescription>
          Select the sectors you&apos;re interested in and set their relative importance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Available Sectors</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {AVAILABLE_SECTORS.map(sector => (
              <Badge
                key={sector}
                variant={sectors.find((s: { name: string; weight: number }) => s.name === sector) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (sectors.find((s: { name: string; weight: number }) => s.name === sector)) {
                    removeSector(sector)
                  } else {
                    addSector(sector)
                  }
                }}
              >
                {sector}
              </Badge>
            ))}
          </div>
        </div>

        {sectors.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Sector Weights</Label>
            {sectors.map((sector: { name: string; weight: number }) => (
              <div key={sector.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">{sector.name}</Label>
                  <span className="text-sm text-muted-foreground">{sector.weight}%</span>
                </div>
                <Slider
                  value={[sector.weight]}
                  onValueChange={([value]) => updateSectorWeight(sector.name, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="sectors"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

// Stages Tab Component
function StagesTab({ form }: { form: ReturnType<typeof useForm<PreferencesFormData>> }) {
  const stages = form.watch('stages') || []

  const addStage = (stageName: string) => {
    const currentStages = form.getValues('stages') || []
    if (!currentStages.find((s: { stage: string; weight: number }) => s.stage === stageName)) {
      form.setValue('stages', [...currentStages, { stage: stageName, weight: 20 }])
    }
  }

  const removeStage = (stageName: string) => {
    const currentStages = form.getValues('stages') || []
    form.setValue('stages', currentStages.filter((s: { stage: string; weight: number }) => s.stage !== stageName))
  }

  const updateStageWeight = (stageName: string, weight: number) => {
    const currentStages = form.getValues('stages') || []
    form.setValue('stages', currentStages.map((s: { stage: string; weight: number }) => 
      s.stage === stageName ? { ...s, weight } : s
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Stages</CardTitle>
        <CardDescription>
          Select the investment stages you&apos;re interested in and their relative importance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Available Stages</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {AVAILABLE_STAGES.map(stage => (
              <Badge
                key={stage}
                variant={stages.find((s: { stage: string; weight: number }) => s.stage === stage) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => {
                  if (stages.find((s: { stage: string; weight: number }) => s.stage === stage)) {
                    removeStage(stage)
                  } else {
                    addStage(stage)
                  }
                }}
              >
                {stage}
              </Badge>
            ))}
          </div>
        </div>

        {stages.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Stage Weights</Label>
            {stages.map((stage: { stage: string; weight: number }) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm capitalize">{stage.stage}</Label>
                  <span className="text-sm text-muted-foreground">{stage.weight}%</span>
                </div>
                <Slider
                  value={[stage.weight]}
                  onValueChange={([value]) => updateStageWeight(stage.stage, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="stages"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

// Criteria Tab Component
function CriteriaTab({ form }: { form: ReturnType<typeof useForm<PreferencesFormData>> }) {
  const criteria = form.watch('criteria') || {}
  
  const totalWeight = Object.values(criteria).reduce((sum: number, weight: unknown) => sum + (typeof weight === 'number' ? weight : 0), 0)
  const isValidTotal = Math.abs(totalWeight - 100) <= 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Criteria</CardTitle>
        <CardDescription>
          Set the relative importance of different evaluation criteria. Weights should sum to 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant={isValidTotal ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Total weight: {totalWeight}% {isValidTotal ? '✓' : '(Must equal 100%)'}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="criteria.revenueWeight"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Revenue & Financial Performance</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value || 0}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Importance of revenue growth, profitability, and financial metrics
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria.teamWeight"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Team & Leadership</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value || 0}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Importance of founder experience, team composition, and leadership quality
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria.marketWeight"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Market Opportunity</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value || 0}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Importance of market size, growth potential, and competitive landscape
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria.productWeight"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Product & Technology</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value || 0}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Importance of product quality, innovation, and technical differentiation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria.tractionWeight"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Traction & Growth</FormLabel>
                  <span className="text-sm text-muted-foreground">{field.value || 0}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Importance of customer acquisition, user growth, and market validation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Details Tab Component
function DetailsTab({ form }: { form: ReturnType<typeof useForm<PreferencesFormData>> }) {
  const geographies = form.watch('geographies') || []

  const toggleGeography = (geography: string) => {
    const current = form.getValues('geographies') || []
    if (current.includes(geography)) {
      form.setValue('geographies', current.filter((g: string) => g !== geography))
    } else {
      form.setValue('geographies', [...current, geography])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Geographic Preferences</CardTitle>
          <CardDescription>
            Select the regions where you prefer to invest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_GEOGRAPHIES.map(geography => (
              <FormField
                key={geography}
                control={form.control}
                name="geographies"
                render={() => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={geographies.includes(geography)}
                        onCheckedChange={() => toggleGeography(geography)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        {geography}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormField
            control={form.control}
            name="geographies"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Range</CardTitle>
          <CardDescription>
            Set your preferred investment amount range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="investmentRange.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Investment ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10,000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investmentRange.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Investment ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10,000,000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Tolerance</CardTitle>
          <CardDescription>
            Select your preferred risk level for investments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="riskTolerance"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex flex-col">
                        <span className="font-medium">Low Risk</span>
                        <span className="text-sm text-muted-foreground">
                          Established companies with proven business models
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex flex-col">
                        <span className="font-medium">Medium Risk</span>
                        <span className="text-sm text-muted-foreground">
                          Growing companies with some market validation
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex flex-col">
                        <span className="font-medium">High Risk</span>
                        <span className="text-sm text-muted-foreground">
                          Early-stage startups with high growth potential
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}