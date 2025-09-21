'use client'

import { useState } from 'react'
import { Calendar, Clock, MessageSquare, Phone, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import type { CallRequest, CallResponse } from '@/types'

interface CallNotificationProps {
  callRequest: CallRequest
  onAccept: (response: CallResponse) => void
  onDecline: (response: CallResponse) => void
  onDismiss: () => void
}

export function CallNotification({
  callRequest,
  onAccept,
  onDecline,
  onDismiss
}: CallNotificationProps) {
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseType, setResponseType] = useState<'accept' | 'decline'>('accept')
  const [responseMessage, setResponseMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResponse = async () => {
    setIsSubmitting(true)
    
    try {
      const response: CallResponse = {
        requestId: callRequest.id,
        status: responseType === 'accept' ? 'accepted' : 'declined',
        message: responseMessage.trim() || undefined
      }

      if (responseType === 'accept') {
        await onAccept(response)
      } else {
        await onDecline(response)
      }

      setShowResponseDialog(false)
      onDismiss()
    } catch (error) {
      console.error('Failed to send response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openResponseDialog = (type: 'accept' | 'decline') => {
    setResponseType(type)
    setShowResponseDialog(true)
  }

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Call Request</h3>
                <p className="text-sm text-muted-foreground">
                  From {callRequest.investorName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {format(new Date(callRequest.timestamp), 'MMM d, HH:mm')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="font-medium">Investor:</span>
            <span>{callRequest.investorName}</span>
          </div>

          {callRequest.message && (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                {callRequest.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => openResponseDialog('accept')}
              className="flex-1"
            >
              Accept Call
            </Button>
            <Button
              variant="outline"
              onClick={() => openResponseDialog('decline')}
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accept' ? 'Accept Call Request' : 'Decline Call Request'}
            </DialogTitle>
            <DialogDescription>
              {responseType === 'accept' 
                ? 'Send a message to the investor and suggest meeting times.'
                : 'Let the investor know why you cannot take the call at this time.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response-message">
                {responseType === 'accept' ? 'Message & Availability' : 'Reason (Optional)'}
              </Label>
              <Textarea
                id="response-message"
                placeholder={
                  responseType === 'accept'
                    ? "Thank you for your interest! I'm available for a call on..."
                    : "Thank you for your interest. Unfortunately, I'm not available for calls at this time because..."
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>

            {responseType === 'accept' && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  After accepting, you can coordinate specific meeting times through follow-up messages.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResponse}
              disabled={isSubmitting}
              variant={responseType === 'decline' ? 'destructive' : 'default'}
            >
              {isSubmitting 
                ? 'Sending...' 
                : responseType === 'accept' 
                  ? 'Accept & Send' 
                  : 'Decline & Send'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}