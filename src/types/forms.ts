// Form-specific type definitions for user interfaces

// ============================================================================
// FORM FIELD TYPES
// ============================================================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'textarea' | 'file' | 'date' | 'checkbox' | 'radio'
  required: boolean
  placeholder?: string
  helpText?: string
  validation?: ValidationRule[]
  options?: SelectOption[]
  disabled?: boolean
  hidden?: boolean
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: string | number
  message: string
  validator?: (value: unknown) => boolean | Promise<boolean>
}

export interface FormError {
  field: string
  message: string
  type: 'validation' | 'server' | 'network'
}

export interface FormState {
  values: Record<string, unknown>
  errors: FormError[]
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

// ============================================================================
// COMPANY DETAILS FORM TYPES
// ============================================================================

export interface CompanyDetailsFormData {
  // Basic Information
  name: string
  tagline: string
  description: string
  website?: string
  
  // Business Details
  sector: string
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+'
  foundedYear: number
  location: string
  
  // Team and Metrics
  employeeCount: number
  fundingRaised: number
  valuation?: number
  
  // Additional Information
  businessModel: string
  targetMarket: string
  revenueModel: string
  competitiveAdvantage: string
}

export interface CompanyDetailsFormStep {
  id: string
  title: string
  description: string
  fields: FormField[]
  validation?: (data: Partial<CompanyDetailsFormData>) => FormError[]
}

// ============================================================================
// INVESTOR PREFERENCES FORM TYPES
// ============================================================================

export interface InvestorPreferencesFormData {
  // Investment Criteria
  sectors: { name: string; weight: number }[]
  stages: { stage: string; weight: number }[]
  geographies: string[]
  
  // Investment Range
  investmentMin: number
  investmentMax: number
  
  // Risk and Strategy
  riskTolerance: 'low' | 'medium' | 'high'
  investmentStrategy: 'growth' | 'value' | 'disruptive' | 'sustainable'
  
  // Weighting Criteria
  revenueWeight: number
  teamWeight: number
  marketWeight: number
  productWeight: number
  tractionWeight: number
  
  // Additional Preferences
  preferredDealSize: number
  followOnCapacity: boolean
  boardSeatRequirement: boolean
  geographicFocus?: string[]
  excludedSectors?: string[]
}

export interface WeightingSlider {
  name: string
  label: string
  value: number
  min: number
  max: number
  step: number
  description?: string
}

// ============================================================================
// DYNAMIC QUESTIONS FORM TYPES
// ============================================================================

export interface DynamicQuestion {
  id: string
  text: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'scale' | 'boolean'
  required: boolean
  category: string
  subcategory?: string
  order: number
  options?: SelectOption[]
  validation?: ValidationRule[]
  conditionalLogic?: ConditionalLogic
  helpText?: string
  placeholder?: string
}

export interface ConditionalLogic {
  dependsOn: string // Question ID
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: string | number | boolean
  action: 'show' | 'hide' | 'require' | 'disable'
}

export interface QuestionCategory {
  id: string
  name: string
  description: string
  order: number
  questions: DynamicQuestion[]
  completionRequired: boolean
}

export interface QuestionResponse {
  questionId: string
  answer: string | number | string[] | boolean
  timestamp: string
  confidence?: number
}

// ============================================================================
// FILE UPLOAD FORM TYPES
// ============================================================================

export interface FileUploadFormData {
  pitchDeck?: File
  pitchVideo?: File
  pitchAudio?: File
  financialDocs?: File[]
  additionalDocs?: File[]
}

export interface FileUploadField {
  name: keyof FileUploadFormData
  label: string
  accept: string[]
  maxSize: number
  multiple: boolean
  required: boolean
  description?: string
}

export interface FileValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ============================================================================
// SEARCH AND FILTER FORM TYPES
// ============================================================================

export interface CompanySearchFormData {
  query?: string
  sectors: string[]
  stages: string[]
  locations: string[]
  fundingMin?: number
  fundingMax?: number
  employeeMin?: number
  employeeMax?: number
  foundedAfter?: number
  foundedBefore?: number
  hasVideo: boolean
  hasPitchDeck: boolean
  sortBy: 'relevance' | 'funding' | 'employees' | 'founded' | 'name'
  sortOrder: 'asc' | 'desc'
}

export interface FilterOption {
  id: string
  label: string
  count?: number
  selected: boolean
  children?: FilterOption[]
}

export interface SearchSuggestion {
  type: 'company' | 'sector' | 'location' | 'keyword'
  value: string
  label: string
  count?: number
}

// ============================================================================
// CALL SCHEDULING FORM TYPES
// ============================================================================

export interface CallSchedulingFormData {
  message?: string
  preferredTimes: string[]
  duration: 30 | 45 | 60
  meetingType: 'video' | 'phone' | 'in-person'
  agenda?: string
  timezone: string
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  timezone: string
}

export interface AvailabilityCalendar {
  date: string
  slots: TimeSlot[]
}

// ============================================================================
// FORM WIZARD TYPES
// ============================================================================

export interface FormWizardStep {
  id: string
  title: string
  description?: string
  component: string
  validation?: (data: Record<string, unknown>) => FormError[]
  canSkip?: boolean
  isComplete?: boolean
}

export interface FormWizardState {
  currentStep: number
  steps: FormWizardStep[]
  data: Record<string, unknown>
  errors: Record<string, FormError[]>
  isValid: boolean
  canProceed: boolean
  canGoBack: boolean
}

// ============================================================================
// FORM HOOKS TYPES
// ============================================================================

export interface UseFormOptions<T = Record<string, unknown>> {
  initialValues: T
  validationSchema?: ValidationSchema<T>
  onSubmit: (values: T) => void | Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  enableReinitialize?: boolean
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule[]
}

export interface FormMethods<T = Record<string, unknown>> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  setValue: (field: keyof T, value: T[keyof T]) => void
  setError: (field: keyof T, error: string) => void
  setTouched: (field: keyof T, touched: boolean) => void
  validateField: (field: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  resetForm: () => void
  submitForm: () => Promise<void>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'textarea' 
  | 'file' 
  | 'date' 
  | 'checkbox' 
  | 'radio'
  | 'scale'
  | 'boolean'

export type ValidationRuleType = 
  | 'required' 
  | 'min' 
  | 'max' 
  | 'pattern' 
  | 'custom'

export type ConditionalAction = 'show' | 'hide' | 'require' | 'disable'
export type ConditionalCondition = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
export type MeetingType = 'video' | 'phone' | 'in-person'
export type CallDuration = 30 | 45 | 60
export type SortBy = 'relevance' | 'funding' | 'employees' | 'founded' | 'name'