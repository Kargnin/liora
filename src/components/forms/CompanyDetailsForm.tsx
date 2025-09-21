'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ChevronLeft, ChevronRight, Save, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FileUploadZone } from './FileUploadZone'
import { type CompanyDetailsFormData } from '@/types'
import { type UploadedFile } from '@/types/upload'
import { UPLOAD_CONFIGS } from '@/types/upload'
import { cn } from '@/lib/utils'

interface CompanyDetailsFormProps {
  initialData?: Partial<CompanyDetailsFormData>
  onSave?: (data: Partial<CompanyDetailsFormData>) => void
  onComplete?: (data: CompanyDetailsFormData) => void
  className?: string
}

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Real Estate', 'Manufacturing', 'Energy', 'Transportation', 'Food & Beverage',
  'Entertainment', 'Agriculture', 'Retail', 'Consulting', 'Other'
]

const STAGES = [
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
  { value: 'series-b', label: 'Series B' },
  { value: 'series-c+', label: 'Series C+' }
] as const

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  sector: z.string().min(1, 'Please select a sector'),
  stage: z.enum(['pre-seed', 'seed', 'series-a', 'series-b', 'series-c+'], {
    message: 'Please select a funding stage'
  }),
  foundedYear: z.number()
    .min(1900, 'Founded year must be after 1900')
    .max(new Date().getFullYear(), `Founded year cannot be in the future`),
  location: z.string().min(2, 'Location is required'),
  employeeCount: z.number().min(1, 'Employee count must be at least 1'),
  fundingRaised: z.number().min(0, 'Funding raised cannot be negative').optional(),
  valuation: z.number().min(0, 'Valuation cannot be negative').optional(),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  revenueModel: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function CompanyDetailsForm({
  initialData,
  onSave,
  onComplete,
  className
}: CompanyDetailsFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadedFiles, setUploadedFiles] = React.useState<{
    pitchDeck?: UploadedFile[]
    pitchVideo?: UploadedFile[]
    pitchAudio?: UploadedFile[]
  }>({})

  const totalSteps = 4

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      tagline: initialData?.tagline || '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      sector: initialData?.sector || '',
      stage: initialData?.stage || undefined,
      foundedYear: initialData?.foundedYear || new Date().getFullYear(),
      location: initialData?.location || '',
      employeeCount: initialData?.employeeCount || 1,
      fundingRaised: initialData?.fundingRaised || 0,
      valuation: initialData?.valuation || undefined,
      businessModel: initialData?.businessModel || '',
      targetMarket: initialData?.targetMarket || '',
      revenueModel: initialData?.revenueModel || '',
      competitiveAdvantage: initialData?.competitiveAdvantage || '',
    },
    mode: 'onChange'
  })

  // Auto-save functionality
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const timeoutId = setTimeout(() => {
        if (onSave && form.formState.isDirty) {
          onSave(values)
        }
      }, 1000)

      return () => clearTimeout(timeoutId)
    })

    return () => subscription.unsubscribe()
  }, [form, onSave])

  const validateCurrentStep = React.useCallback(async () => {
    const stepFields = getStepFields(currentStep)
    const result = await form.trigger(stepFields)
    return result
  }, [currentStep, form.trigger])

  const nextStep = React.useCallback(async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [validateCurrentStep, currentStep, totalSteps])

  const previousStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const onSubmit = React.useCallback((data: FormData) => {
    if (onComplete) {
      onComplete(data as CompanyDetailsFormData)
    }
  }, [onComplete])

  const getStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ['name', 'tagline', 'description', 'website']
      case 1:
        return ['sector', 'stage', 'foundedYear', 'location']
      case 2:
        return ['employeeCount', 'fundingRaised', 'valuation']
      case 3:
        return []
      default:
        return []
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 0: return 'Basic Information'
      case 1: return 'Business Details'
      case 2: return 'Company Metrics'
      case 3: return 'Pitch Materials'
      default: return 'Step'
    }
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  const BasicInformationStep = React.useCallback(() => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter your company name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tagline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tagline *</FormLabel>
            <FormControl>
              <Input placeholder="A brief, compelling tagline for your company" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what your company does, the problem you solve, and your solution"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://yourcompany.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  ), [form.control])

  const BusinessDetailsStep = React.useCallback(() => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="sector"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sector *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry sector" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Stage *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your current funding stage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="foundedYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Founded Year *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <FormControl>
                <Input placeholder="San Francisco, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  ), [form.control])

  const MetricsStep = React.useCallback(() => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="employeeCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee Count *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="10"
                min="1"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fundingRaised"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Funding Raised (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1000000"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              Enter the total amount of funding raised to date
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="valuation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Valuation (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="10000000"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
              />
            </FormControl>
            <FormDescription>
              Enter your current company valuation (optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  ), [form.control])

  const FileUploadsStep = React.useCallback(() => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Pitch Deck</h3>
          <p className="text-sm text-muted-foreground">
            Upload your pitch deck (PDF, PPT, or PPTX format)
          </p>
        </div>
        <FileUploadZone
          config={UPLOAD_CONFIGS.PITCH_DECK}
          onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, pitchDeck: files }))}
          title="Upload Pitch Deck"
          description="Drag and drop your pitch deck here"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Pitch Video (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Upload a video pitch (MP4, MOV, or AVI format)
          </p>
        </div>
        <FileUploadZone
          config={UPLOAD_CONFIGS.PITCH_VIDEO}
          onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, pitchVideo: files }))}
          title="Upload Pitch Video"
          description="Drag and drop your pitch video here"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Pitch Audio (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Upload an audio pitch (MP3, WAV, or M4A format)
          </p>
        </div>
        <FileUploadZone
          config={UPLOAD_CONFIGS.PITCH_AUDIO}
          onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, pitchAudio: files }))}
          title="Upload Pitch Audio"
          description="Drag and drop your pitch audio here"
        />
      </div>
    </div>
  ), [setUploadedFiles])

  const renderStepContent = React.useCallback(() => {
    switch (currentStep) {
      case 0:
        return <BasicInformationStep />
      case 1:
        return <BusinessDetailsStep />
      case 2:
        return <MetricsStep />
      case 3:
        return <FileUploadsStep />
      default:
        return null
    }
  }, [currentStep, BasicInformationStep, BusinessDetailsStep, MetricsStep, FileUploadsStep])

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {totalSteps}: {getStepTitle(currentStep)}
            </CardDescription>
          </div>
          {form.formState.isDirty && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Save className="h-4 w-4 mr-1" />
              Auto-saving...
            </div>
          )}
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}