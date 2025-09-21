# shadcn/ui Integration Guide

This document outlines the complete shadcn/ui integration in the Liora project.

## Overview

All components in this project now use shadcn/ui exclusively. This provides:
- Consistent design system
- Accessible components
- Customizable theming
- TypeScript support
- Modern React patterns

## Installed Components

### Core UI Components
- ✅ Button
- ✅ Input
- ✅ Label
- ✅ Textarea

### Layout Components
- ✅ Card
- ✅ Separator
- ✅ Skeleton

### Navigation Components
- ✅ Dropdown Menu
- ✅ Navigation Menu
- ✅ Breadcrumb

### Form Components
- ✅ Form (with react-hook-form integration)
- ✅ Select
- ✅ Checkbox
- ✅ Radio Group
- ✅ Switch
- ✅ Slider

### Feedback Components
- ✅ Alert
- ✅ Badge
- ✅ Progress
- ✅ Sonner (Toast notifications)

### Overlay Components
- ✅ Dialog
- ✅ Alert Dialog
- ✅ Sheet
- ✅ Popover
- ✅ Hover Card
- ✅ Tooltip

### Data Display Components
- ✅ Avatar
- ✅ Table
- ✅ Tabs
- ✅ Accordion
- ✅ Collapsible

### Utility Components
- ✅ Aspect Ratio
- ✅ Scroll Area
- ✅ Resizable

### Specialized Components
- ✅ Calendar
- ✅ Command
- ✅ Carousel
- ✅ Chart
- ✅ Input OTP
- ✅ Menubar
- ✅ Context Menu
- ✅ Pagination
- ✅ Sidebar
- ✅ Toggle
- ✅ Drawer

## Custom Components

### LoadingSpinner
A reusable loading spinner component with size variants.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner'

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

### ThemeToggle
A dropdown theme toggle supporting light, dark, and system themes.

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

<ThemeToggle />
```

### EmptyState
A component for displaying empty states with optional actions.

```tsx
import { EmptyState } from '@/components/ui/empty-state'

<EmptyState
  icon={<FileIcon className="h-12 w-12" />}
  title="No files uploaded"
  description="Upload your first file to get started"
  action={{
    label: "Upload File",
    onClick: () => {}
  }}
/>
```

### StatusBadge
A badge component for displaying status with appropriate colors and icons.

```tsx
import { StatusBadge } from '@/components/ui/status-badge'

<StatusBadge status="success" label="Completed" />
<StatusBadge status="error" label="Failed" />
<StatusBadge status="pending" label="In Progress" />
<StatusBadge status="warning" label="Attention Required" />
```

## Theme Integration

The project uses a custom theme provider that integrates with shadcn/ui:

- Located at: `src/components/providers/theme-provider.tsx`
- Supports light, dark, and system themes
- Persists theme preference in localStorage
- Integrated with Sonner toast notifications

## Toast Notifications

Toast notifications are implemented using Sonner:

```tsx
import { toast } from 'sonner'

// Success toast
toast.success('Upload completed successfully')

// Error toast
toast.error('Upload failed: Invalid file type')

// Info toast
toast.info('Started uploading file.pdf')

// Warning toast
toast.warning('File size is large, this may take a while')
```

## Component Import Strategy

Use the centralized index file for cleaner imports:

```tsx
// Instead of multiple imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Use the index file
import { Button, Card, CardContent, Input } from '@/components/ui'
```

## Styling Guidelines

1. **Use CSS Variables**: All components use CSS variables for theming
2. **Tailwind Classes**: Prefer Tailwind utility classes for custom styling
3. **Component Variants**: Use built-in variants when available
4. **Consistent Spacing**: Follow the design system spacing scale

## Form Integration

Forms use react-hook-form with Zod validation:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui'

const form = useForm({
  resolver: zodResolver(schema)
})

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## Accessibility

All shadcn/ui components are built with accessibility in mind:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Performance

- Components are tree-shakeable
- Only import what you use
- Optimized for bundle size
- Server-side rendering compatible

## Migration Notes

All existing components have been updated to use shadcn/ui:
- Custom alert messages replaced with toast notifications
- Loading states use the LoadingSpinner component
- Status displays use StatusBadge component
- Theme toggle added to dashboard layout
- Consistent styling across all components

## Future Enhancements

Consider adding these components as needed:
- Data Table (custom implementation using Table component)
- File Upload (enhanced version of current FileUploadZone)
- Rich Text Editor integration
- Advanced Chart components
- Multi-step form wizard