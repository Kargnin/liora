import { z } from 'zod'
import { COMPANY_STAGES, RISK_LEVELS, SECTORS } from './constants'

// User validation schemas
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['founder', 'investor']),
  email: z.string().email().optional(),
  companyId: z.string().optional(),
})

export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  userType: z.enum(['founder', 'investor']),
})

// Company validation schemas
export const companyOverviewSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sector: z.enum(SECTORS as readonly [string, ...string[]]),
  stage: z.enum([
    COMPANY_STAGES.PRE_SEED,
    COMPANY_STAGES.SEED,
    COMPANY_STAGES.SERIES_A,
    COMPANY_STAGES.SERIES_B,
    COMPANY_STAGES.SERIES_C_PLUS,
  ] as const),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url().optional().or(z.literal('')),
  tagline: z.string().min(1, 'Tagline is required'),
  employeeCount: z.number().min(1, 'Employee count must be at least 1'),
  fundingRaised: z.number().min(0, 'Funding raised cannot be negative'),
  valuation: z.number().min(0).optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['pitch-deck', 'pitch-video', 'pitch-audio', 'other']),
})

// Investor preferences validation
export const investorPreferencesSchema = z.object({
  sectors: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().min(0).max(1),
      })
    )
    .min(1, 'At least one sector preference is required'),

  stages: z
    .array(
      z.object({
        stage: z.string(),
        weight: z.number().min(0).max(1),
      })
    )
    .min(1, 'At least one stage preference is required'),

  geographies: z.array(z.string()).min(1, 'At least one geography is required'),

  investmentRange: z
    .object({
      min: z.number().min(0, 'Minimum investment cannot be negative'),
      max: z.number().min(0, 'Maximum investment cannot be negative'),
    })
    .refine(data => data.max >= data.min, {
      message: 'Maximum investment must be greater than or equal to minimum',
      path: ['max'],
    }),

  riskTolerance: z.enum([
    RISK_LEVELS.LOW,
    RISK_LEVELS.MEDIUM,
    RISK_LEVELS.HIGH,
  ] as const),

  criteria: z.object({
    revenueWeight: z.number().min(0).max(1),
    teamWeight: z.number().min(0).max(1),
    marketWeight: z.number().min(0).max(1),
    productWeight: z.number().min(0).max(1),
    tractionWeight: z.number().min(0).max(1),
  }),
})

// Question response validation
export const questionResponseSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
})

export const questionFormSchema = z.object({
  responses: z.array(questionResponseSchema),
})

// Call scheduling validation
export const callRequestSchema = z.object({
  investorId: z.string(),
  companyId: z.string(),
  message: z.string().optional(),
})

export const callResponseSchema = z.object({
  callRequestId: z.string(),
  accepted: z.boolean(),
  message: z.string().optional(),
  proposedTimes: z.array(z.string().datetime()).optional(),
})

// Export types
export type LoginFormData = z.infer<typeof loginSchema>
export type CompanyOverviewFormData = z.infer<typeof companyOverviewSchema>
export type InvestorPreferencesFormData = z.infer<
  typeof investorPreferencesSchema
>
export type QuestionResponseData = z.infer<typeof questionResponseSchema>
export type CallRequestData = z.infer<typeof callRequestSchema>
export type CallResponseData = z.infer<typeof callResponseSchema>
