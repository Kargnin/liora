'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'
import { callToastUtils } from '@/components/calls'
import { mockCallRequests, mockMeetings, mockCallNotifications } from '@/lib/mock-data'
import type { 
  CallRequest, 
  CallResponse, 
  MeetingSchedule, 
  Notification,
  CallStatus 
} from '@/types'

interface UseCallsReturn {
  // State
  callRequests: CallRequest[]
  meetings: MeetingSchedule[]
  isLoading: boolean
  error: string | null

  // Actions
  sendCallRequest: (request: Omit<CallRequest, 'id' | 'timestamp' | 'status'>) => Promise<void>
  respondToCallRequest: (response: CallResponse) => Promise<void>
  scheduleMeeting: (callRequestId: string, meetingData: Partial<MeetingSchedule>) => Promise<void>
  cancelMeeting: (meetingId: string) => Promise<void>
  updateCallStatus: (requestId: string, status: CallStatus) => Promise<void>
  
  // Utilities
  getCallRequestsForUser: (userId: string) => CallRequest[]
  getMeetingsForUser: (userId: string) => MeetingSchedule[]
  createCallNotification: (callRequest: CallRequest) => void
}

export function useCalls(): UseCallsReturn {
  const [callRequests, setCallRequests] = useState<CallRequest[]>([])
  const [meetings, setMeetings] = useState<MeetingSchedule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addNotification, user } = useAppStore()

  // Initialize with mock data for demonstration
  useEffect(() => {
    setCallRequests(mockCallRequests)
    setMeetings(mockMeetings)
    
    // Add mock notifications for demonstration
    mockCallNotifications.forEach(notification => {
      addNotification(notification)
    })
  }, [addNotification])

  const sendCallRequest = useCallback(async (
    request: Omit<CallRequest, 'id' | 'timestamp' | 'status'>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create the call request
      const callRequest: CallRequest = {
        ...request,
        id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      // In a real app, this would be an API call
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add to local state
      setCallRequests(prev => [...prev, callRequest])

      // Create notification for the founder
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'call-request',
        title: 'New Call Request',
        message: `${request.investorName} wants to schedule a call`,
        timestamp: new Date().toISOString(),
        read: false,
        userId: 'founder-user-id', // This would be the actual founder's ID
        metadata: {
          callRequest,
          requestId: callRequest.id
        }
      }

      addNotification(notification)
      
      // Show success toast
      callToastUtils.showCallRequestSent(request.investorName, 'the company')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send call request'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [addNotification])

  const respondToCallRequest = useCallback(async (response: CallResponse) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update the call request status
      setCallRequests(prev => 
        prev.map(request => 
          request.id === response.requestId
            ? { ...request, status: response.status }
            : request
        )
      )

      // Create notification for the investor
      const callRequest = callRequests.find(r => r.id === response.requestId)
      if (callRequest) {
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          type: 'call-response',
          title: response.status === 'accepted' ? 'Call Request Accepted' : 'Call Request Declined',
          message: response.message || `Your call request has been ${response.status}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: callRequest.investorId,
          metadata: {
            callResponse: response,
            requestId: response.requestId
          }
        }

        addNotification(notification)

        // Show appropriate toast
        if (response.status === 'accepted') {
          callToastUtils.showCallAccepted('Founder')
        } else {
          callToastUtils.showCallDeclined('Founder', response.message)
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to respond to call request'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [callRequests, addNotification])

  const scheduleMeeting = useCallback(async (
    callRequestId: string, 
    meetingData: Partial<MeetingSchedule>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const callRequest = callRequests.find(r => r.id === callRequestId)
      if (!callRequest) {
        throw new Error('Call request not found')
      }

      // Create the meeting
      const meeting: MeetingSchedule = {
        id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        callRequestId,
        investorId: callRequest.investorId,
        founderId: 'current-founder-id', // This would come from auth context
        scheduledTime: meetingData.scheduledTime || new Date().toISOString(),
        duration: meetingData.duration || 30,
        meetingLink: meetingData.meetingLink,
        status: 'scheduled',
        notes: meetingData.notes,
        ...meetingData
      }

      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add to local state
      setMeetings(prev => [...prev, meeting])

      // Show success toast
      callToastUtils.showMeetingScheduled(meeting.scheduledTime)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule meeting'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [callRequests])

  const cancelMeeting = useCallback(async (meetingId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update meeting status
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === meetingId
            ? { ...meeting, status: 'cancelled' as const }
            : meeting
        )
      )

      // Show cancellation toast
      callToastUtils.showMeetingCancelled()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel meeting'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCallStatus = useCallback(async (requestId: string, status: CallStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update the call request status
      setCallRequests(prev => 
        prev.map(request => 
          request.id === requestId
            ? { ...request, status }
            : request
        )
      )

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update call status'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCallRequestsForUser = useCallback((userId: string) => {
    return callRequests.filter(request => 
      request.investorId === userId || 
      // For founders, we'd need to check if they own the company
      user?.type === 'founder'
    )
  }, [callRequests, user])

  const getMeetingsForUser = useCallback((userId: string) => {
    return meetings.filter(meeting => 
      meeting.investorId === userId || meeting.founderId === userId
    )
  }, [meetings])

  const createCallNotification = useCallback((callRequest: CallRequest) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'call-request',
      title: 'New Call Request',
      message: `${callRequest.investorName} wants to schedule a call`,
      timestamp: new Date().toISOString(),
      read: false,
      userId: 'founder-user-id', // This would be the actual founder's ID
      metadata: {
        callRequest,
        requestId: callRequest.id
      }
    }

    addNotification(notification)
  }, [addNotification])

  return {
    // State
    callRequests,
    meetings,
    isLoading,
    error,

    // Actions
    sendCallRequest,
    respondToCallRequest,
    scheduleMeeting,
    cancelMeeting,
    updateCallStatus,

    // Utilities
    getCallRequestsForUser,
    getMeetingsForUser,
    createCallNotification
  }
}