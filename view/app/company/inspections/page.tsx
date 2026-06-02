'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { inspectionApi, type InspectionRecord, type ScheduleInspectionPayload } from '@/lib/api/inspection'
import { extinguisherApi, type ExtinguisherRecord } from '@/lib/api/extinguisher'
import { authApi } from '@/lib/api/auth'
import { downloadCsv } from '@/lib/export'
import toast from 'react-hot-toast'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Calendar,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Ban,
} from 'lucide-react'

const UNASSIGNED_INSPECTOR = '__unassigned__'

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [extinguishers, setExtinguishers] = useState<ExtinguisherRecord[]>([])
  const [inspectors, setInspectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InspectionRecord | null>(null)

  const [form, setForm] = useState<ScheduleInspectionPayload>({
    extinguisherId: 0,
    inspectorId: undefined,
    customerId: undefined,
    scheduledDate: '',
    location: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [inspRes, extRes, usersRes] = await Promise.allSettled([
        inspectionApi.getInspections(1, 100),
        extinguisherApi.getExtinguishers(1, 100),
        authApi.getAllUsers(100, 0),
      ])
      if (inspRes.status === 'fulfilled' && inspRes.value.success) {
        setInspections(inspRes.value.data?.items ?? [])
        setTotal(inspRes.value.data?.total ?? 0)
      }
      if (extRes.status === 'fulfilled' && extRes.value.success) {
        setExtinguishers(extRes.value.data?.items ?? [])
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        const allUsers = usersRes.value.data?.items ?? []
        setInspectors(allUsers.filter((u: any) => u.role === 'inspector'))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSchedule = async () => {
    if (!form.extinguisherId || !form.scheduledDate) return
    setSaving(true)
    setError(null)
    try {
      const res = await inspectionApi.scheduleInspection(form)
      if (res.success && res.data) {
        setInspections(prev => [res.data!, ...prev])
        setTotal(prev => prev + 1)
        setIsScheduleDialogOpen(false)
        setForm({ extinguisherId: 0, scheduledDate: '', location: '', notes: '' })
      } else {
        setError(res.message || 'Failed to schedule inspection')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule inspection')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const res = await inspectionApi.cancelInspection(selectedItem.id)
      if (res.success) {
        setInspections(prev =>
          prev.map(i => i.id === selectedItem.id ? { ...i, status: 'cancelled' as const } : i)
        )
        setIsCancelDialogOpen(false)
      } else {
        setError(res.message || 'Cancel failed')
      }
    } catch (err: any) {
      setError(err.message || 'Cancel failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<InspectionRecord>[] = [
    {
      key: 'extinguisherId',
      label: 'Extinguisher',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono font-medium">
              {item.extinguisher?.serialNumber ?? `#${item.extinguisherId}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.customer?.businessName ?? item.location ?? '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'inspectorId',
      label: 'Inspector',
      render: (item) =>
        item.inspector
          ? `${item.inspector.firstName} ${item.inspector.lastName}`
          : '—',
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      sortable: true,
      render: (item) => new Date(item.scheduledDate).toLocaleDateString(),
    },
    {
      key: 'completedDate',
      label: 'Completed',
      render: (item) => item.completedDate ? new Date(item.completedDate).toLocaleDateString() : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'result',
      label: 'Result',
      render: (item) => item.result ? <StatusBadge status={(item.result === 'passed' ? 'pass' : item.result === 'failed' ? 'fail' : item.result) as any} /> : '—',
    },
  ]

  const actions = (item: InspectionRecord) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsViewDialogOpen(true) }}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        {item.status === 'scheduled' && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => { setSelectedItem(item); setIsCancelDialogOpen(true) }}
          >
            <Ban className="mr-2 h-4 w-4" /> Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length
  const inProgressCount = inspections.filter(i => i.status === 'in_progress').length
  const completedCount = inspections.filter(i => i.status === 'completed').length
  const cancelledCount = inspections.filter(i => i.status === 'cancelled').length
  const handleExport = () => {
    downloadCsv('company-inspections', inspections, [
      { header: 'Extinguisher', value: item => item.extinguisher?.serialNumber ?? `#${item.extinguisherId}` },
      { header: 'Customer', value: item => item.customer?.businessName ?? '' },
      { header: 'Inspector', value: item => item.inspector ? `${item.inspector.firstName} ${item.inspector.lastName}` : '' },
      { header: 'Scheduled Date', value: item => new Date(item.scheduledDate).toLocaleDateString() },
      { header: 'Completed Date', value: item => item.completedDate ? new Date(item.completedDate).toLocaleDateString() : '' },
      { header: 'Status', value: item => item.status },
      { header: 'Result', value: item => item.result ?? '' },
      { header: 'Location', value: item => item.location ?? '' },
    ])
  }

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspections</h1>
            <p className="text-muted-foreground">Schedule and track inspections</p>
          </div>
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Inspection
          </Button>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Scheduled', value: scheduledCount, icon: Calendar, color: 'text-primary', bg: 'text-primary/20' },
            { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-warning', bg: 'text-warning/20' },
            { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-success', bg: 'text-success/20' },
            { label: 'Cancelled', value: cancelledCount, icon: XCircle, color: 'text-muted-foreground', bg: 'text-muted-foreground/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className={`text-2xl font-bold ${color}`}>{value}</p>}
                </div>
                <Icon className={`h-8 w-8 ${bg}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>All Inspections</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={inspections}
                searchKeys={['location']}
                actions={actions}
                exportable
                onExport={handleExport}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
            <DialogDescription>Schedule a new inspection for an extinguisher</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Extinguisher *</Label>
              <Select
                value={form.extinguisherId ? form.extinguisherId.toString() : ''}
                onValueChange={v => setForm(f => ({ ...f, extinguisherId: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select extinguisher" /></SelectTrigger>
                <SelectContent>
                  {extinguishers.map(ext => (
                    <SelectItem key={ext.id} value={ext.id.toString()}>
                      {ext.serialNumber} — {ext.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Inspector</Label>
              <Select
                value={form.inspectorId?.toString() ?? ''}
                onValueChange={v => setForm(f => ({ ...f, inspectorId: v === UNASSIGNED_INSPECTOR ? undefined : parseInt(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select inspector (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_INSPECTOR}>Unassigned</SelectItem>
                  {inspectors.map(ins => (
                    <SelectItem key={ins.id} value={ins.id.toString()}>
                      {ins.firstName} {ins.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Building A - Floor 1"
                value={form.location ?? ''}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional instructions..."
                value={form.notes ?? ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={saving || !form.extinguisherId || !form.scheduledDate}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Inspection Details</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-lg">
                    {selectedItem.extinguisher?.serialNumber ?? `#${selectedItem.extinguisherId}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.customer?.businessName ?? selectedItem.location ?? '—'}
                  </p>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t text-sm">
                {[
                  ['Inspector', selectedItem.inspector ? `${selectedItem.inspector.firstName} ${selectedItem.inspector.lastName}` : '—'],
                  ['Scheduled Date', new Date(selectedItem.scheduledDate).toLocaleDateString()],
                  ['Completed Date', selectedItem.completedDate ? new Date(selectedItem.completedDate).toLocaleDateString() : '—'],
                  ['Result', selectedItem.result ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {selectedItem.remarks && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Remarks</p>
                    <p>{selectedItem.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Inspection</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this inspection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
