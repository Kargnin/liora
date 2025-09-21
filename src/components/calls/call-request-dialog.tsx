'use client'

import { useState } from 'react'
import { Calendar, Clock, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CompanyOverview, CallRequest } from '@/types'

interface CallRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyOverview
  investorName: string
  onSubmit: (request: Omit<CallRequest, 'id' | 'timestamp' | 'status'>) => void
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export function CallRequestDialog({
  open,
  onOpenChange,
  company,
  investorName,
  onSubmit
}: CallRequestDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    
    try {
      const scheduledDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      await onSubmit({
        investorId: 'current-investor-id', // This would come from auth context
        investorName,
        companyId: company.id,
        message: message.trim() || undefined
      })

      // Reset form
      setSelectedDate(undefined)
      setSelectedTime(undefined)
      setMessage('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to send call request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedDate && selectedTime

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Request Call with {company.name}
          </DialogTitle>
          <DialogDescription>
            Schedule a call to discuss investment opportunities with the founding team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Info Card */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {company.logo && (
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {company.tagline}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{company.sector}</Badge>
                    <Badge variant="outline">{company.stage}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot">
                  {selectedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedTime}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message about your interest in the company..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {isFormValid && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Call Request Summary
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Company:</strong> {company.name}</p>
                    <p><strong>Date:</strong> {format(selectedDate!, "PPP")}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Investor:</strong> {investorName}</p>
                    {message && (
                      <p><strong>Message:</strong> {message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}