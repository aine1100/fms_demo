'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { customerApi } from '@/lib/api/customer'
import { inspectionApi, type InspectionRecord } from '@/lib/api/inspection'
import type { ExtinguisherRecord } from '@/lib/api/extinguisher'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Loader2,
  Ban,
} from 'lucide-react'
import Link from 'next/link'

export default function CustomerServiceRequestsPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([])
  const [extinguishers, setExtinguishers] = useState<ExtinguisherRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewItem, setViewItem] = useState<InspectionRecord | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const [form, setForm] = useState({
    extinguisherId: '',
    scheduledDate: '',
    location: '',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [inspRes, extRes] = await Promise.allSettled([
        customerApi.getInspectionHistory(1, 100),
        customerApi.getMyExtinguishers(),
      ])
      if (inspRes.status === 'fulfilled' && inspRes.value.success) {
        setInspections(inspRes.value.data?.items ?? [])
      } else {
        setInspections([])
      }
      if (extRes.status === 'fulfilled' && extRes.value.success) {
        setExtinguishers(extRes.value.data?.items ?? [])
      } else {
        setExtinguishers([])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (!form.extinguisherId || !form.scheduledDate) {
      toast.error('Please select an extinguisher and date')
      return
    }
    setSaving(true)
    try {
      const res = await inspectionApi.scheduleInspection({
        extinguisherId: parseInt(form.extinguisherId),
        scheduledDate: form.scheduledDate,
        location: form.location || undefined,
        notes: form.notes || undefined,
      })
      if (res.success && res.data) {
        toast.success('Service request submitted successfully')
        setInspections(prev => [res.data!, ...prev])
        setIsDialogOpen(false)
        setForm({ extinguisherId: '', scheduledDate: '', location: '', notes: '' })
      } else {
        toast.error(res.message || 'Failed to submit request')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id: number) => {
    try {
      const res = await inspectionApi.cancelInspection(id)
      if (res.success) {
        toast.success('Request cancelled')
        setInspections(prev =>
          prev.map(i => i.id === id ? { ...i, status: 'cancelled' as const } : i)
        )
      } else {
        toast.error(res.message || 'Failed to cancel')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel')
    }
  }

  const filtered = inspections.filter(i => {
    const q = searchTerm.toLowerCase()
    const matchSearch =
      (i.extinguisher?.serialNumber ?? '').toLowerCase().includes(q) ||
      (i.location ?? '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length
  const inProgressCount = inspections.filter(i => i.status === 'in_progress').length
  const completedCount = inspections.filter(i => i.status === 'completed').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />
      case 'in_progress': return <Clock className="h-4 w-4 text-primary" />
      case 'scheduled': return <AlertCircle className="h-4 w-4 text-warning" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-muted-foreground" />
      default: return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
            <p className="text-muted-foreground">Schedule and track inspection requests for your equipment</p>
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Requests', value: inspections.length, color: '', border: '' },
            { label: 'Scheduled', value: scheduledCount, color: 'text-warning', border: 'border-l-4 border-l-warning' },
            { label: 'In Progress', value: inProgressCount, color: 'text-primary', border: 'border-l-4 border-l-primary' },
            { label: 'Completed', value: completedCount, color: 'text-success', border: 'border-l-4 border-l-success' },
          ].map(({ label, value, color, border }) => (
            <Card key={label} className={border}>
              <CardContent className="pt-6 text-center">
                {loading ? <Skeleton className="h-9 w-16 mx-auto" /> : <p className={`text-3xl font-bold ${color}`}>{value}</p>}
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Request History</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:w-56"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No requests found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or create a new request</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-muted p-2 shrink-0">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono font-medium">
                            {item.extinguisher?.serialNumber ?? `Request #${item.id}`}
                          </p>
                          <StatusBadge status={item.status} />
                          {item.result && <StatusBadge status={item.result} />}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        {item.remarks && (
                          <p className="mt-1 text-sm text-muted-foreground truncate">{item.remarks}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => { setViewItem(item); setViewOpen(true) }}
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      {item.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleCancel(item.id)}
                        >
                          <Ban className="h-4 w-4" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Service Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Extinguisher *</Label>
              {extinguishers.length === 0 ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  No extinguishers found. Please add equipment first or <Link href="/customer/buy-equipment" className="font-medium underline">buy one</Link>.
                </div>
              ) : (
                <Select value={form.extinguisherId} onValueChange={v => setForm(f => ({ ...f, extinguisherId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your extinguisher" />
                  </SelectTrigger>
                  <SelectContent>
                    {extinguishers.map(ext => (
                      <SelectItem key={ext.id} value={ext.id.toString()}>
                        {ext.serialNumber} — {ext.location || ext.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Preferred Date *</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Building A - Floor 1"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Describe the issue or any special instructions..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || !form.extinguisherId || !form.scheduledDate}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={viewItem.status} />
                {viewItem.result && <StatusBadge status={viewItem.result} />}
              </div>
              <div className="grid gap-2.5 text-sm">
                {[
                  ['Extinguisher', viewItem.extinguisher?.serialNumber ?? `#${viewItem.extinguisherId}`],
                  ['Scheduled Date', new Date(viewItem.scheduledDate).toLocaleDateString()],
                  ['Completed Date', viewItem.completedDate ? new Date(viewItem.completedDate).toLocaleDateString() : '—'],
                  ['Location', viewItem.location || '—'],
                  ['Inspector', viewItem.inspector ? `${viewItem.inspector.firstName} ${viewItem.inspector.lastName}` : 'Not assigned yet'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {viewItem.remarks && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Remarks</p>
                    <p className="text-sm">{viewItem.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
