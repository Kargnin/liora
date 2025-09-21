'use client'

import { useState } from 'react'
import { Bell, BellRing, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { CallNotification } from './call-notification'
import { format } from 'date-fns'
import { useAppStore } from '@/stores/app-store'
import type { Notification, CallRequest, CallResponse } from '@/types'

interface NotificationCenterProps {
  onCallAccept?: (response: CallResponse) => void
  onCallDecline?: (response: CallResponse) => void
}

export function NotificationCenter({
  onCallAccept,
  onCallDecline
}: NotificationCenterProps) {
  const { notifications, removeNotification, clearNotifications } = useAppStore()
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length
  const callRequests = notifications.filter(n => n.type === 'call-request')
  const otherNotifications = notifications.filter(n => n.type !== 'call-request')

  const handleCallAccept = (response: CallResponse) => {
    onCallAccept?.(response)
    // Remove the notification after handling
    const notification = notifications.find(n => 
      n.type === 'call-request' && 
      n.metadata?.requestId === response.requestId
    )
    if (notification) {
      removeNotification(notification.id)
    }
  }

  const handleCallDecline = (response: CallResponse) => {
    onCallDecline?.(response)
    // Remove the notification after handling
    const notification = notifications.find(n => 
      n.type === 'call-request' && 
      n.metadata?.requestId === response.requestId
    )
    if (notification) {
      removeNotification(notification.id)
    }
  }

  const renderNotification = (notification: Notification) => {
    if (notification.type === 'call-request' && notification.metadata?.callRequest) {
      return (
        <CallNotification
          key={notification.id}
          callRequest={notification.metadata.callRequest as CallRequest}
          onAccept={handleCallAccept}
          onDecline={handleCallDecline}
          onDismiss={() => removeNotification(notification.id)}
        />
      )
    }

    return (
      <Card key={notification.id} className="mb-3">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(notification.timestamp), 'MMM d, HH:mm')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm">{notification.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearNotifications}>
                  Clear all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-4">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-12 w-12" />}
                title="No notifications"
                description="You're all caught up! New notifications will appear here."
              />
            ) : (
              <div className="space-y-3">
                {/* Call requests first */}
                {callRequests.map(renderNotification)}
                
                {/* Other notifications */}
                {otherNotifications.map(renderNotification)}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}