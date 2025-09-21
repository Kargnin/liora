# Call Scheduling and Notification System

This module implements a comprehensive call scheduling and notification system for the Liora platform, enabling seamless communication between investors and founders.

## Components

### CallRequestDialog
A modal dialog that allows investors to request calls with founders. Features:
- Company information display
- Date and time selection using shadcn/ui Calendar and Select components
- Optional message input
- Form validation and submission
- Real-time preview of request details

**Props:**
- `open`: Boolean to control dialog visibility
- `onOpenChange`: Callback for dialog state changes
- `company`: Company information object
- `investorName`: Name of the requesting investor
- `onSubmit`: Callback for form submission

### CallNotification
Displays call request notifications with action buttons. Features:
- Call request details display
- Accept/decline action buttons
- Response dialog with message input
- Status indicators and timestamps

**Props:**
- `callRequest`: Call request object
- `onAccept`: Callback for accepting calls
- `onDecline`: Callback for declining calls
- `onDismiss`: Callback for dismissing notifications

### NotificationCenter
A centralized notification management system. Features:
- Bell icon with unread count badge
- Popover with scrollable notification list
- Different notification types (call requests, responses, system)
- Bulk actions (clear all notifications)
- Real-time updates

**Props:**
- `onCallAccept`: Optional callback for call acceptance
- `onCallDecline`: Optional callback for call decline

### CallWorkflow
Manages the complete call workflow from request to meeting. Features:
- Call request status tracking
- Meeting scheduling interface
- Status updates and actions
- Dropdown menus for workflow actions

**Props:**
- `callRequests`: Array of call request objects
- `meetings`: Array of scheduled meetings
- `onUpdateCallStatus`: Callback for status updates
- `onScheduleMeeting`: Callback for meeting scheduling
- `onCancelMeeting`: Callback for meeting cancellation

### CallToastNotifications
Handles real-time toast notifications using Sonner. Features:
- Automatic toast display for new notifications
- Different toast types for different events
- Action buttons in toasts
- Configurable duration and styling

**Props:**
- `notifications`: Array of notification objects
- `onCallRequest`: Callback for call request notifications
- `onCallResponse`: Callback for call response notifications

## Hooks

### useCalls
A custom hook for managing call-related state and operations. Features:
- Call request management
- Meeting scheduling
- Status updates
- Error handling
- Loading states

**Returns:**
- State: `callRequests`, `meetings`, `isLoading`, `error`
- Actions: `sendCallRequest`, `respondToCallRequest`, `scheduleMeeting`, `cancelMeeting`, `updateCallStatus`
- Utilities: `getCallRequestsForUser`, `getMeetingsForUser`, `createCallNotification`

## Types

### CallRequest
```typescript
interface CallRequest {
  id: string
  investorId: string
  investorName: string
  companyId: string
  message?: string
  timestamp: string
  status: 'pending' | 'accepted' | 'declined'
}
```

### CallResponse
```typescript
interface CallResponse {
  requestId: string
  status: 'accepted' | 'declined'
  message?: string
  proposedTimes?: string[]
}
```

### MeetingSchedule
```typescript
interface MeetingSchedule {
  id: string
  callRequestId: string
  investorId: string
  founderId: string
  scheduledTime: string
  duration: number
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}
```

## Usage Examples

### Basic Call Request
```tsx
import { CallRequestDialog } from '@/components/calls'

function InvestorDashboard() {
  const [showDialog, setShowDialog] = useState(false)
  
  const handleCallRequest = async (request) => {
    // Send call request to backend
    await sendCallRequest(request)
    setShowDialog(false)
  }

  return (
    <CallRequestDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      company={selectedCompany}
      investorName="John Doe"
      onSubmit={handleCallRequest}
    />
  )
}
```

### Notification Center Integration
```tsx
import { NotificationCenter } from '@/components/calls'

function AppHeader() {
  return (
    <div className="header">
      <NotificationCenter
        onCallAccept={handleCallAccept}
        onCallDecline={handleCallDecline}
      />
    </div>
  )
}
```

### Complete Call Management
```tsx
import { useCalls, CallWorkflow } from '@/components/calls'

function CallManagementPage() {
  const {
    callRequests,
    meetings,
    sendCallRequest,
    respondToCallRequest,
    scheduleMeeting
  } = useCalls()

  return (
    <CallWorkflow
      callRequests={callRequests}
      meetings={meetings}
      onUpdateCallStatus={respondToCallRequest}
      onScheduleMeeting={scheduleMeeting}
    />
  )
}
```

## Features

### Real-time Notifications
- WebSocket integration for instant notifications
- Toast notifications using Sonner
- Notification center with real-time updates
- Badge indicators for unread notifications

### Scheduling Interface
- Calendar component for date selection
- Time slot selection with predefined options
- Meeting duration configuration
- Meeting link generation

### Workflow Management
- Status tracking (pending, accepted, declined)
- Meeting lifecycle management
- Bulk operations and filtering
- Action menus with contextual options

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility
- ARIA labels and descriptions
- Focus management

### Performance
- Optimized re-renders with React.memo
- Efficient state management with Zustand
- Lazy loading of heavy components
- Debounced search and filtering

## Testing

The module includes comprehensive tests covering:
- Component rendering and interactions
- Form validation and submission
- Notification handling
- Workflow state management
- Integration scenarios

Run tests with:
```bash
npm test -- --testPathPattern=call-scheduling
```

## Dependencies

- **shadcn/ui**: UI component library
- **date-fns**: Date formatting and manipulation
- **sonner**: Toast notification system
- **zustand**: State management
- **lucide-react**: Icon library

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Components use React.memo for optimization
- State updates are batched for efficiency
- Large lists use virtualization
- Images are lazy-loaded
- Bundle size is optimized with tree-shaking