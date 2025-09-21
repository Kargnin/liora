// Type validation utilities for runtime type checking

import type {
  User,
  CompanyOverview,
  InvestmentMemo,
  InvestorPreferences,
  Question,
  Notification,
  CallRequest,
  FileUpload
} from './index'

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export const isString = (value: unknown): value is string => 
  typeof value === 'string'

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value)

export const isBoolean = (value: unknown): value is boolean => 
  typeof value === 'boolean'

export const isArray = (value: unknown): value is unknown[] => 
  Array.isArray(value)

export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const hasProperty = <T extends Record<string, unknown>>(
  obj: T,
  key: string
): boolean => Object.prototype.hasOwnProperty.call(obj, key)

// ============================================================================
// USER TYPE VALIDATORS
// ============================================================================

export const isValidUserType = (value: unknown): value is 'founder' | 'investor' =>
  value === 'founder' || value === 'investor'

export const isValidUser = (value: unknown): value is User => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'type') && isValidUserType(value.type) &&
    (!hasProperty(value, 'email') || isString(value.email)) &&
    (!hasProperty(value, 'companyId') || isString(value.companyId))
  )
}

// ============================================================================
// COMPANY TYPE VALIDATORS
// ============================================================================

export const isValidCompanyStage = (value: unknown): value is 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c+' =>
  ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c+'].includes(value as string)

export const isValidCompanyOverview = (value: unknown): value is CompanyOverview => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name) &&
    hasProperty(value, 'description') && isString(value.description) &&
    hasProperty(value, 'sector') && isString(value.sector) &&
    hasProperty(value, 'stage') && isValidCompanyStage(value.stage) &&
    hasProperty(value, 'foundedYear') && isNumber(value.foundedYear) &&
    hasProperty(value, 'location') && isString(value.location) &&
    hasProperty(value, 'tagline') && isString(value.tagline) &&
    hasProperty(value, 'employeeCount') && isNumber(value.employeeCount) &&
    hasProperty(value, 'fundingRaised') && isNumber(value.fundingRaised) &&
    (!hasProperty(value, 'website') || isString(value.website)) &&
    (!hasProperty(value, 'logo') || isString(value.logo)) &&
    (!hasProperty(value, 'valuation') || isNumber(value.valuation))
  )
}

// ============================================================================
// INVESTMENT MEMO VALIDATORS
// ============================================================================

export const isValidRiskLevel = (value: unknown): value is 'low' | 'medium' | 'high' =>
  ['low', 'medium', 'high'].includes(value as string)

export const isValidInvestmentMemo = (value: unknown): value is InvestmentMemo => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'companyId') && isString(value.companyId) &&
    hasProperty(value, 'version') && isString(value.version) &&
    hasProperty(value, 'createdAt') && isString(value.createdAt) &&
    hasProperty(value, 'updatedAt') && isString(value.updatedAt) &&
    hasProperty(value, 'overview') && isValidCompanyOverview(value.overview) &&
    hasProperty(value, 'founders') && isArray(value.founders) &&
    hasProperty(value, 'recommendation') && isObject(value.recommendation)
  )
}

// ============================================================================
// PREFERENCES VALIDATORS
// ============================================================================

export const isValidInvestorPreferences = (value: unknown): value is InvestorPreferences => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'sectors') && isArray(value.sectors) &&
    hasProperty(value, 'stages') && isArray(value.stages) &&
    hasProperty(value, 'geographies') && isArray(value.geographies) &&
    hasProperty(value, 'investmentRange') && isObject(value.investmentRange) &&
    hasProperty(value, 'riskTolerance') && isValidRiskLevel(value.riskTolerance) &&
    hasProperty(value, 'criteria') && isObject(value.criteria)
  )
}

// ============================================================================
// QUESTION VALIDATORS
// ============================================================================

export const isValidQuestionType = (value: unknown): value is 'text' | 'number' | 'select' | 'multiselect' =>
  ['text', 'number', 'select', 'multiselect'].includes(value as string)

export const isValidQuestion = (value: unknown): value is Question => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'text') && isString(value.text) &&
    hasProperty(value, 'type') && isValidQuestionType(value.type) &&
    hasProperty(value, 'required') && isBoolean(value.required) &&
    hasProperty(value, 'category') && isString(value.category) &&
    (!hasProperty(value, 'options') || isArray(value.options))
  )
}

// ============================================================================
// NOTIFICATION VALIDATORS
// ============================================================================

export const isValidNotificationType = (value: unknown): value is 'call-request' | 'call-response' | 'memo-update' | 'system' =>
  ['call-request', 'call-response', 'memo-update', 'system'].includes(value as string)

export const isValidNotification = (value: unknown): value is Notification => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'type') && isValidNotificationType(value.type) &&
    hasProperty(value, 'title') && isString(value.title) &&
    hasProperty(value, 'message') && isString(value.message) &&
    hasProperty(value, 'timestamp') && isString(value.timestamp) &&
    hasProperty(value, 'read') && isBoolean(value.read) &&
    hasProperty(value, 'userId') && isString(value.userId)
  )
}

// ============================================================================
// CALL REQUEST VALIDATORS
// ============================================================================

export const isValidCallStatus = (value: unknown): value is 'pending' | 'accepted' | 'declined' =>
  ['pending', 'accepted', 'declined'].includes(value as string)

export const isValidCallRequest = (value: unknown): value is CallRequest => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'investorId') && isString(value.investorId) &&
    hasProperty(value, 'investorName') && isString(value.investorName) &&
    hasProperty(value, 'companyId') && isString(value.companyId) &&
    hasProperty(value, 'timestamp') && isString(value.timestamp) &&
    hasProperty(value, 'status') && isValidCallStatus(value.status) &&
    (!hasProperty(value, 'message') || isString(value.message))
  )
}

// ============================================================================
// FILE UPLOAD VALIDATORS
// ============================================================================

export const isValidUploadStatus = (value: unknown): value is 'pending' | 'uploading' | 'completed' | 'error' =>
  ['pending', 'uploading', 'completed', 'error'].includes(value as string)

export const isValidFileUpload = (value: unknown): value is FileUpload => {
  if (!isObject(value)) return false
  
  return (
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'file') && value.file instanceof File &&
    hasProperty(value, 'progress') && isNumber(value.progress) &&
    hasProperty(value, 'status') && isValidUploadStatus(value.status) &&
    (!hasProperty(value, 'error') || isString(value.error)) &&
    (!hasProperty(value, 'url') || isString(value.url))
  )
}

// ============================================================================
// WEBSOCKET EVENT VALIDATORS
// ============================================================================

export const isValidSocketEvent = (eventName: string): boolean => {
  const validEvents = [
    'connect',
    'disconnect',
    'error',
    'interview:start',
    'interview:audio',
    'interview:transcript',
    'interview:end',
    'notification:new',
    'call:request',
    'call:response',
    'memo:updated',
    'analysis:progress'
  ]
  
  return validEvents.includes(eventName)
}

// ============================================================================
// FORM DATA VALIDATORS
// ============================================================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear + 10
}

export const validateFunding = (amount: number): boolean => {
  return amount >= 0 && amount <= 1000000000 // Max 1B
}

export const validateEmployeeCount = (count: number): boolean => {
  return count >= 1 && count <= 1000000
}

// ============================================================================
// COMPOSITE VALIDATORS
// ============================================================================

export const validateCompanyForm = (data: Partial<CompanyOverview>): string[] => {
  const errors: string[] = []
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Company name must be at least 2 characters')
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters')
  }
  
  if (!data.sector || data.sector.trim().length === 0) {
    errors.push('Sector is required')
  }
  
  if (!data.stage || !isValidCompanyStage(data.stage)) {
    errors.push('Valid company stage is required')
  }
  
  if (!data.foundedYear || !validateYear(data.foundedYear)) {
    errors.push('Valid founded year is required')
  }
  
  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required')
  }
  
  if (data.website && !validateUrl(data.website)) {
    errors.push('Valid website URL is required')
  }
  
  if (data.employeeCount !== undefined && !validateEmployeeCount(data.employeeCount)) {
    errors.push('Valid employee count is required')
  }
  
  if (data.fundingRaised !== undefined && !validateFunding(data.fundingRaised)) {
    errors.push('Valid funding amount is required')
  }
  
  return errors
}

export const validatePreferencesForm = (data: Partial<InvestorPreferences>): string[] => {
  const errors: string[] = []
  
  if (!data.sectors || data.sectors.length === 0) {
    errors.push('At least one sector preference is required')
  }
  
  if (!data.stages || data.stages.length === 0) {
    errors.push('At least one stage preference is required')
  }
  
  if (!data.investmentRange || 
      !isNumber(data.investmentRange.min) || 
      !isNumber(data.investmentRange.max) ||
      data.investmentRange.min >= data.investmentRange.max) {
    errors.push('Valid investment range is required')
  }
  
  if (!data.riskTolerance || !isValidRiskLevel(data.riskTolerance)) {
    errors.push('Risk tolerance is required')
  }
  
  if (!data.criteria) {
    errors.push('Investment criteria weights are required')
  } else {
    const totalWeight = Object.values(data.criteria).reduce((sum, weight) => sum + (weight || 0), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push('Criteria weights must sum to 100%')
    }
  }
  
  return errors
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '')
}

export const sanitizeNumber = (num: unknown): number | null => {
  const parsed = Number(num)
  return isNaN(parsed) ? null : parsed
}

export const sanitizeArray = <T>(arr: unknown, validator: (item: unknown) => item is T): T[] => {
  if (!isArray(arr)) return []
  return arr.filter(validator)
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (isString(value)) return value.trim().length === 0
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}