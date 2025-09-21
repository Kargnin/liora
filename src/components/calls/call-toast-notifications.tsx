'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { Phone, Calendar, CheckCircle, XCircle, Bell } from 'lucide-react'
import type { Notification, CallRequest, CallResponse } from '@/types'

interface CallToastNotificationsProps {
  notifications: Notification[]
  onCallRequest?: (callRequest: CallRequest) => void
  onCallResponse?: (callResponse: CallResponse) => void
}

export function CallToastNotifications({
  notifications,
  onCallRequest,
  onCallResponse
}: CallToastNotificationsProps) {
  
  useEffect(() => {
    // Process new notifications and show toasts
    notifications.forEach((notification) => {
      if (notification.read) return // Skip already read notifications

      switch (notification.type) {
        case 'call-request':
          if (notification.metadata?.callRequest) {
            const callRequest = notification.metadata.callRequest as CallRequest
            toast(notification.title, {
              description: notification.message,
              icon: <Phone className="h-4 w-4" />,
              action: {
                label: 'View',
                onClick: () => onCallRequest?.(callRequest)
              },
              duration: 10000, // 10 seconds for call requests
            })
          }
          break

        case 'call-response':
          if (notification.metadata?.callResponse) {
            const callResponse = notification.metadata.callResponse as CallResponse
            const isAccepted = callResponse.status === 'accepted'
            
            toast(notification.title, {
              description: notification.message,
              icon: isAccepted 
                ? <CheckCircle className="h-4 w-4 text-green-500" />
                : <XCircle className="h-4 w-4 text-red-500" />,
              action: isAccepted ? {
                label: 'Schedule',
                onClick: () => onCallResponse?.(callResponse)
              } : undefined,
              duration: 8000,
            })
          }
          break

        case 'memo-update':
          toast(notification.title, {
            description: notification.message,
            icon: <Bell className="h-4 w-4" />,
            duration: 5000,
          })
          break

        case 'system':
          toast(notification.title, {
            description: notification.message,
            icon: <Bell className="h-4 w-4" />,
            duration: 5000,
          })
          break

        default:
          // Generic notification
          toast(notification.title, {
            description: notification.message,
            icon: <Bell className="h-4 w-4" />,
            duration: 5000,
          })
      }
    })
  }, [notifications, onCallRequest, onCallResponse])

  return null // This component only handles side effects
}

// Utility functions for creating toast notifications
export const callToastUtils = {
  showCallRequestSent: (investorName: string, companyName: string) => {
    toast.success('Call request sent', {
      description: `Your call request has been sent to ${companyName}`,
      icon: <Phone className="h-4 w-4" />,
      duration: 5000,
    })
  },

  showCallRequestReceived: (investorName: string, companyName: string) => {
    toast('New call request', {
      description: `${investorName} wants to schedule a call about ${companyName}`,
      icon: <Phone className="h-4 w-4" />,
      duration: 10000,
    })
  },

  showCallAccepted: (founderName: string) => {
    toast.success('Call request accepted', {
      description: `${founderName} has accepted your call request`,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 8000,
    })
  },

  showCallDeclined: (founderName: string, reason?: string) => {
    toast.error('Call request declined', {
      description: reason || `${founderName} has declined your call request`,
      icon: <XCircle className="h-4 w-4" />,
      duration: 8000,
    })
  },

  showMeetingScheduled: (scheduledTime: string) => {
    toast.success('Meeting scheduled', {
      description: `Your meeting has been scheduled for ${scheduledTime}`,
      icon: <Calendar className="h-4 w-4" />,
      duration: 8000,
    })
  },

  showMeetingCancelled: (reason?: string) => {
    toast.error('Meeting cancelled', {
      description: reason || 'The scheduled meeting has been cancelled',
      icon: <XCircle className="h-4 w-4" />,
      duration: 8000,
    })
  },

  showMeetingReminder: (meetingTime: string, minutesUntil: number) => {
    toast('Meeting reminder', {
      description: `Your meeting starts in ${minutesUntil} minutes (${meetingTime})`,
      icon: <Calendar className="h-4 w-4" />,
      duration: 15000, // Longer duration for reminders
      action: {
        label: 'Join',
        onClick: () => {
          // This would open the meeting link
          console.log('Opening meeting link...')
        }
      }
    })
  }
}