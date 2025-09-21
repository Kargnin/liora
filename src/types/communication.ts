// Communication and notification type definitions

export interface Notification {
  id: string
  type: 'call-request' | 'call-response' | 'memo-update' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  userId: string
  metadata?: Record<string, unknown>
}

export interface CallRequest {
  id: string
  investorId: string
  investorName: string
  companyId: string
  message?: string
  timestamp: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface CallResponse {
  requestId: string
  status: 'accepted' | 'declined'
  message?: string
  proposedTimes?: string[]
}

export interface MeetingSchedule {
  id: string
  callRequestId: string
  investorId: string
  founderId: string
  scheduledTime: string
  duration: number // in minutes
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

// Utility types
export type NotificationType = 'call-request' | 'call-response' | 'memo-update' | 'system'
export type CallStatus = 'pending' | 'accepted' | 'declined'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'