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
import type { ExtinguisherRecord } from '@/lib/api/extinguisher'
import toast from 'react-hot-toast'
import {
  FireExtinguisher,
  Search,
  Filter,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
} from 'lucide-react'

export default function CustomerEquipmentPage() {
  const [equipment, setEquipment] = useState<ExtinguisherRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<ExtinguisherRecord | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerApi.getMyExtinguishers()
      if (res.success && res.data) {
        setEquipment(res.data.items ?? [])
      } else {
        toast.error(res.message || 'Failed to load equipment')
        setEquipment([])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load equipment')
      setEquipment([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = equipment.filter(item => {
    const q = searchTerm.toLowerCase()
    const matchSearch =
      item.serialNumber.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.location ?? '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const daysUntilExpiry = (date: string) =>
    Math.floor((new Date(date).getTime() - Date.now()) / 86400000)

  const activeCount = equipment.filter(e => e.status === 'active').length
  const expiringSoon = equipment.filter(e => daysUntilExpiry(e.expiryDate) <= 30 && daysUntilExpiry(e.expiryDate) > 0).length
  const expiredCount = equipment.filter(e => e.status === 'expired').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Equipment</h1>
          <p className="text-muted-foreground">View and track all your fire safety equipment</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Equipment', value: equipment.length, color: '' },
            { label: 'Active', value: activeCount, color: 'text-success', border: 'border-l-4 border-l-success' },
            { label: 'Expiring Soon', value: expiringSoon, color: 'text-warning', border: 'border-l-4 border-l-warning' },
            { label: 'Expired', value: expiredCount, color: 'text-destructive', border: 'border-l-4 border-l-destructive' },
          ].map(({ label, value, color, border }) => (
            <Card key={label} className={border}>
              <CardContent className="pt-6 text-center">
                {loading ? <Skeleton className="h-9 w-16 mx-auto" /> : <p className={`text-3xl font-bold ${color}`}>{value}</p>}
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table/Grid */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Equipment List</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:w-56"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No equipment found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(item => {
                  const days = daysUntilExpiry(item.expiryDate)
                  const expiring = days <= 30 && days > 0
                  return (
                    <div key={item.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${
                            item.status === 'active' && !expiring ? 'bg-success/10'
                            : expiring ? 'bg-warning/10'
                            : 'bg-destructive/10'
                          }`}>
                            <FireExtinguisher className={`h-5 w-5 ${
                              item.status === 'active' && !expiring ? 'text-success'
                              : expiring ? 'text-warning'
                              : 'text-destructive'
                            }`} />
                          </div>
                          <div>
                            <p className="font-mono font-medium">{item.serialNumber}</p>
                            <p className="text-sm text-muted-foreground">{item.type}</p>
                          </div>
                        </div>
                        <StatusBadge status={expiring ? 'expiring' : item.status} />
                      </div>

                      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.location || 'No location set'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Expires {new Date(item.expiryDate).toLocaleDateString()}</span>
                        </div>
                        {item.nextInspectionDate && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Next inspection {new Date(item.nextInspectionDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1"
                          onClick={() => { setSelected(item); setViewOpen(true) }}
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FireExtinguisher className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-lg">{selected.serialNumber}</h3>
                  <p className="text-sm text-muted-foreground">{selected.type} — {selected.capacity}</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="grid gap-2.5 pt-4 border-t text-sm">
                {[
                  ['Location', selected.location || '—'],
                  ['Manufacture Date', selected.manufactureDate ? new Date(selected.manufactureDate).toLocaleDateString() : '—'],
                  ['Expiry Date', new Date(selected.expiryDate).toLocaleDateString()],
                  ['Last Inspection', selected.lastInspectionDate ? new Date(selected.lastInspectionDate).toLocaleDateString() : '—'],
                  ['Next Inspection', selected.nextInspectionDate ? new Date(selected.nextInspectionDate).toLocaleDateString() : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p>{selected.notes}</p>
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
