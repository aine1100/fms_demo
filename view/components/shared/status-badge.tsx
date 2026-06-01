import { cn } from '@/lib/utils'

type StatusVariant = 'active' | 'expired' | 'maintenance' | 'decommissioned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pass' | 'fail' | 'requires_maintenance' | 'draft' | 'sent' | 'paid' | 'overdue' | 'pending' | 'success' | 'warning' | 'error' | 'info'

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  // Extinguisher Status
  active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
  expired: { label: 'Expired', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  maintenance: { label: 'Maintenance', className: 'bg-warning/10 text-warning border-warning/20' },
  decommissioned: { label: 'Decommissioned', className: 'bg-muted text-muted-foreground border-muted' },
  
  // Inspection Status
  scheduled: { label: 'Scheduled', className: 'bg-primary/10 text-primary border-primary/20' },
  in_progress: { label: 'In Progress', className: 'bg-warning/10 text-warning border-warning/20' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-muted' },
  
  // Inspection Result
  pass: { label: 'Pass', className: 'bg-success/10 text-success border-success/20' },
  fail: { label: 'Fail', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  requires_maintenance: { label: 'Needs Maintenance', className: 'bg-warning/10 text-warning border-warning/20' },
  
  // Invoice Status
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-muted' },
  sent: { label: 'Sent', className: 'bg-primary/10 text-primary border-primary/20' },
  paid: { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
  overdue: { label: 'Overdue', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  
  // General
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  success: { label: 'Success', className: 'bg-success/10 text-success border-success/20' },
  warning: { label: 'Warning', className: 'bg-warning/10 text-warning border-warning/20' },
  error: { label: 'Error', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  info: { label: 'Info', className: 'bg-primary/10 text-primary border-primary/20' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
