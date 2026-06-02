'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { customerApi } from '@/lib/api/customer'
import type { InspectionRecord } from '@/lib/api/inspection'
import toast from 'react-hot-toast'
import {
  Search,
  Calendar,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  User,
  ClipboardList,
  MapPin,
} from 'lucide-react'

export default function CustomerInspectionsPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<InspectionRecord | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerApi.getInspectionHistory(1, 50)
      if (res.success && res.data) {
        setInspections(res.data.items ?? [])
      } else {
        toast.error(res.message || 'Failed to load inspections')
        setInspections([])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load inspections')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = inspections.filter(i => {
    const q = searchTerm.toLowerCase()
    const matchSearch =
      (i.extinguisher?.serialNumber ?? '').toLowerCase().includes(q) ||
      (i.location ?? '').toLowerCase().includes(q) ||
      (i.inspector ? `${i.inspector.firstName} ${i.inspector.lastName}` : '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const completedCount = inspections.filter(i => i.status === 'completed').length
  const scheduledCount = inspections.filter(i => i.status === 'scheduled').length
  const failedCount = inspections.filter(i => i.result === 'failed').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspection History</h1>
          <p className="text-muted-foreground">View all past and upcoming inspections for your equipment</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total', value: inspections.length, color: '', border: '' },
            { label: 'Completed', value: completedCount, color: 'text-success', border: 'border-l-4 border-l-success' },
            { label: 'Scheduled', value: scheduledCount, color: 'text-primary', border: 'border-l-4 border-l-primary' },
            { label: 'Issues Found', value: failedCount, color: 'text-warning', border: 'border-l-4 border-l-warning' },
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
              <CardTitle>All Inspections</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections..."
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
                <p className="mt-4 text-lg font-medium">No inspections found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(inspection => (
                  <div
                    key={inspection.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 shrink-0 ${
                        inspection.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        {inspection.status === 'completed'
                          ? <CheckCircle className="h-5 w-5 text-success" />
                          : <Clock className="h-5 w-5 text-primary" />
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono font-medium">
                            {inspection.extinguisher?.serialNumber ?? `#${inspection.extinguisherId}`}
                          </p>
                          <StatusBadge status={inspection.status} />
                          {inspection.result && <StatusBadge status={inspection.result} />}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {inspection.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {inspection.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(inspection.scheduledDate).toLocaleDateString()}
                          </span>
                          {inspection.inspector && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {inspection.inspector.firstName} {inspection.inspector.lastName}
                            </span>
                          )}
                        </div>
                        {inspection.remarks && (
                          <p className="mt-1 text-sm text-muted-foreground truncate">
                            {inspection.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0"
                      onClick={() => { setSelected(inspection); setViewOpen(true) }}
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-lg">
                    {selected.extinguisher?.serialNumber ?? `Inspection #${selected.id}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={selected.status} />
                    {selected.result && <StatusBadge status={selected.result} />}
                  </div>
                </div>
              </div>
              <div className="grid gap-2.5 pt-4 border-t text-sm">
                {[
                  ['Scheduled Date', new Date(selected.scheduledDate).toLocaleDateString()],
                  ['Completed Date', selected.completedDate ? new Date(selected.completedDate).toLocaleDateString() : '—'],
                  ['Inspector', selected.inspector ? `${selected.inspector.firstName} ${selected.inspector.lastName}` : '—'],
                  ['Location', selected.location || '—'],
                  ['Result', selected.result ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {selected.remarks && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Remarks</p>
                    <p className="text-sm">{selected.remarks}</p>
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
