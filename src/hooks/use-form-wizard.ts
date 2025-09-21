'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { type CompanyDetailsFormData } from '@/types/forms'

interface UseFormWizardOptions {
  initialData?: Partial<CompanyDetailsFormData>
  autoSaveDelay?: number
  onAutoSave?: (data: Partial<CompanyDetailsFormData>) => void
  onStepChange?: (step: number) => void
  onComplete?: (data: CompanyDetailsFormData) => void
}

interface UseFormWizardReturn {
  // Form state
  data: Partial<CompanyDetailsFormData>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isDirty: boolean
  isValid: boolean
  
  // Step management
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  
  // Actions
  setValue: (field: keyof CompanyDetailsFormData, value: string | number) => void
  setError: (field: keyof CompanyDetailsFormData, error: string) => void
  clearError: (field: keyof CompanyDetailsFormData) => void
  setTouched: (field: keyof CompanyDetailsFormData, touched: boolean) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  validateStep: (step: number) => boolean
  validateForm: () => boolean
  resetForm: () => void
  submitForm: () => void
}

const TOTAL_STEPS = 4

export function useFormWizard({
  initialData = {},
  autoSaveDelay = 1000,
  onAutoSave,
  onStepChange,
  onComplete
}: UseFormWizardOptions = {}): UseFormWizardReturn {
  const [data, setData] = useState<Partial<CompanyDetailsFormData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouchedState] = useState<Record<string, boolean>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialDataRef = useRef(initialData)
  const onAutoSaveRef = useRef(onAutoSave)
  
  // Update the ref when onAutoSave changes
  useEffect(() => {
    onAutoSaveRef.current = onAutoSave
  }, [onAutoSave])

  // Auto-save functionality - disabled for now to prevent infinite loops
  // useEffect(() => {
  //   if (isDirty && onAutoSaveRef.current) {
  //     if (autoSaveTimeoutRef.current) {
  //       clearTimeout(autoSaveTimeoutRef.current)
  //     }
      
  //     autoSaveTimeoutRef.current = setTimeout(() => {
  //       onAutoSaveRef.current?.(data)
  //       setIsDirty(false)
  //     }, autoSaveDelay)
  //   }
    
  //   return () => {
  //     if (autoSaveTimeoutRef.current) {
  //       clearTimeout(autoSaveTimeoutRef.current)
  //     }
  //   }
  // }, [data, isDirty, autoSaveDelay])

  const setValue = useCallback((field: keyof CompanyDetailsFormData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const setError = useCallback((field: keyof CompanyDetailsFormData, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearError = useCallback((field: keyof CompanyDetailsFormData) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const setTouched = useCallback((field: keyof CompanyDetailsFormData, touched: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: touched }))
  }, [])

  // Validation functions
  const validateField = useCallback((field: keyof CompanyDetailsFormData, value: string | number | undefined): string | null => {
    switch (field) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          return 'Company name must be at least 2 characters'
        }
        break
      case 'tagline':
        if (!value || (typeof value === 'string' && value.trim().length < 10)) {
          return 'Tagline must be at least 10 characters'
        }
        break
      case 'description':
        if (!value || (typeof value === 'string' && value.trim().length < 50)) {
          return 'Description must be at least 50 characters'
        }
        break
      case 'website':
        if (value && typeof value === 'string' && !/^https?:\/\/.+\..+/.test(value)) {
          return 'Please enter a valid website URL'
        }
        break
      case 'sector':
        if (!value) {
          return 'Please select a sector'
        }
        break
      case 'stage':
        if (!value) {
          return 'Please select a funding stage'
        }
        break
      case 'foundedYear':
        const currentYear = new Date().getFullYear()
        if (!value || (typeof value === 'number' && (value < 1900 || value > currentYear))) {
          return `Founded year must be between 1900 and ${currentYear}`
        }
        break
      case 'location':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          return 'Location is required'
        }
        break
      case 'employeeCount':
        if (!value || (typeof value === 'number' && value < 1)) {
          return 'Employee count must be at least 1'
        }
        break
      case 'fundingRaised':
        if (value !== undefined && typeof value === 'number' && value < 0) {
          return 'Funding raised cannot be negative'
        }
        break
    }
    return null
  }, [])

  const validateStep = useCallback((step: number): boolean => {
    const stepFields = getStepFields(step)
    let isStepValid = true
    const newErrors: Record<string, string> = {}

    stepFields.forEach(field => {
      const fieldValue = data[field]
      const error = validateField(field, fieldValue)
      if (error) {
        newErrors[field] = error
        isStepValid = false
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }))
    }
    return isStepValid
  }, [data, validateField])

  const validateForm = useCallback((): boolean => {
    let isFormValid = true
    const newErrors: Record<string, string> = {}

    // Validate all required fields
    const requiredFields: (keyof CompanyDetailsFormData)[] = [
      'name', 'tagline', 'description', 'sector', 'stage', 
      'foundedYear', 'location', 'employeeCount'
    ]

    requiredFields.forEach(field => {
      const error = validateField(field, data[field])
      if (error) {
        newErrors[field] = error
        isFormValid = false
      }
    })

    setErrors(newErrors)
    return isFormValid
  }, [data, validateField])

  const nextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }, [currentStep, validateStep, onStepChange])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }, [currentStep, onStepChange])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      // Validate all previous steps
      let canGoToStep = true
      for (let i = 0; i < step; i++) {
        if (!validateStep(i)) {
          canGoToStep = false
          break
        }
      }
      
      if (canGoToStep) {
        setCurrentStep(step)
        onStepChange?.(step)
      }
    }
  }, [validateStep, onStepChange])

  const resetForm = useCallback(() => {
    setData(initialDataRef.current)
    setErrors({})
    setTouchedState({})
    setCurrentStep(0)
    setIsDirty(false)
  }, [])

  const submitForm = useCallback(() => {
    if (validateForm()) {
      onComplete?.(data as CompanyDetailsFormData)
    }
  }, [data, validateForm, onComplete])

  // Computed values
  const isValid = Object.keys(errors).length === 0
  const canGoNext = currentStep < TOTAL_STEPS - 1
  const canGoPrevious = currentStep > 0

  return {
    // Form state
    data,
    errors,
    touched,
    isDirty,
    isValid,
    
    // Step management
    currentStep,
    totalSteps: TOTAL_STEPS,
    canGoNext,
    canGoPrevious,
    
    // Actions
    setValue,
    setError,
    clearError,
    setTouched,
    nextStep,
    previousStep,
    goToStep,
    validateStep,
    validateForm,
    resetForm,
    submitForm
  }
}

// Helper function to get fields for each step
function getStepFields(step: number): (keyof CompanyDetailsFormData)[] {
  switch (step) {
    case 0: // Basic Information
      return ['name', 'tagline', 'description', 'website']
    case 1: // Business Details
      return ['sector', 'stage', 'foundedYear', 'location']
    case 2: // Metrics
      return ['employeeCount', 'fundingRaised', 'valuation']
    case 3: // Additional Info
      return ['businessModel', 'targetMarket', 'revenueModel', 'competitiveAdvantage']
    default:
      return []
  }
}