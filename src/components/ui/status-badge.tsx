import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

type Status = "success" | "error" | "pending" | "warning"

interface StatusBadgeProps {
  status: Status
  label?: string
  className?: string
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
    defaultLabel: "Success"
  },
  error: {
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",
    defaultLabel: "Error"
  },
  pending: {
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
    defaultLabel: "Pending"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100",
    defaultLabel: "Warning"
  }
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, "flex items-center gap-1", className)}
    >
      <Icon className="h-3 w-3" />
      {label || config.defaultLabel}
    </Badge>
  )
}