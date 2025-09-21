'use client'

import { useState } from 'react'
import { Calendar, Clock, Phone, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import type { CallRequest, MeetingSchedule, CallStatus } from '@/types'

interface CallWorkflowProps {
  callRequests: CallRequest[]
  meetings: MeetingSchedule[]
  onUpdateCallStatus?: (requestId: string, status: CallStatus) => void
  onScheduleMeeting?: (callRequestId: string, meetingData: Partial<MeetingSchedule>) => void
  onCancelMeeting?: (meetingId: string) => void
}

export function CallWorkflow({
  callRequests,
  meetings,
  onUpdateCallStatus,
  onScheduleMeeting,
  onCancelMeeting
}: CallWorkflowProps) {
  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getMeetingStatusColor = (status: MeetingSchedule['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'scheduled':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Call Requests Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Requests ({callRequests.length})
        </h3>
        
        {callRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No call requests at this time</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {callRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <CardTitle className="text-base">
                          Call with {request.investorName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Requested {format(new Date(request.timestamp), 'MMM d, yyyy at HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onUpdateCallStatus?.(request.id, 'accepted')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Request
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onUpdateCallStatus?.(request.id, 'declined')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline Request
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onScheduleMeeting?.(request.id, {})}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Meeting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            Remove Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {request.message && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Meetings Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Meetings ({meetings.length})
        </h3>
        
        {meetings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled meetings</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-base">
                          Meeting #{meeting.id.slice(-6)}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(meeting.scheduledTime), 'MMM d, yyyy at HH:mm')}
                          </span>
                          <span>{meeting.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMeetingStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {meeting.status === 'scheduled' && (
                            <>
                              {meeting.meetingLink && (
                                <DropdownMenuItem asChild>
                                  <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Join Meeting
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => onCancelMeeting?.(meeting.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Meeting
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {meeting.notes && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">{meeting.notes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}