// Application constants
export const USER_TYPES = {
  FOUNDER: 'founder',
  INVESTOR: 'investor',
} as const

export const COMPANY_STAGES = {
  PRE_SEED: 'pre-seed',
  SEED: 'seed',
  SERIES_A: 'series-a',
  SERIES_B: 'series-b',
  SERIES_C_PLUS: 'series-c+',
} as const

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export const NOTIFICATION_TYPES = {
  CALL_REQUEST: 'call-request',
  CALL_RESPONSE: 'call-response',
  MEMO_UPDATE: 'memo-update',
  SYSTEM: 'system',
} as const

export const QUESTION_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
} as const

export const INTERVIEW_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const

export const WEBSOCKET_EVENTS = {
  // Interview events
  INTERVIEW_START: 'interview:start',
  INTERVIEW_AUDIO: 'interview:audio',
  INTERVIEW_TRANSCRIPT: 'interview:transcript',
  INTERVIEW_END: 'interview:end',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  CALL_REQUEST: 'call:request',
  CALL_RESPONSE: 'call:response',

  // Status updates
  MEMO_UPDATED: 'memo:updated',
  ANALYSIS_PROGRESS: 'analysis:progress',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FOUNDER_DASHBOARD: '/founder',
  FOUNDER_COMPANY: '/founder/company',
  FOUNDER_QUESTIONS: '/founder/questions',
  FOUNDER_INTERVIEW: '/founder/interview',
  INVESTOR_DASHBOARD: '/investor',
  INVESTOR_PREFERENCES: '/investor/preferences',
  INVESTOR_COMPANIES: '/investor/companies',
  COMPANY_DETAIL: '/investor/companies/[id]',
} as const

// Desktop-optimized breakpoints (requirement 9.3)
export const BREAKPOINTS = {
  DESKTOP_MIN: '1920px',
  DESKTOP_LARGE: '2560px',
  TABLET: '1024px',
  MOBILE: '768px',
} as const

export const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Energy',
  'Transportation',
  'Food & Beverage',
  'Entertainment',
  'Other',
] as const
