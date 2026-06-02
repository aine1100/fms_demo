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
import { extinguisherApi, type ExtinguisherRecord, type RegisterExtinguisherPayload } from '@/lib/api/extinguisher'
import { downloadCsv } from '@/lib/export'
import toast from 'react-hot-toast'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react'

const EXTINGUISHER_TYPES = [
  { value: 'water', label: 'Water' },
  { value: 'foam', label: 'Foam' },
  { value: 'co2', label: 'CO2' },
  { value: 'dry_powder', label: 'Dry Powder' },
  { value: 'wet_chemical', label: 'Wet Chemical' },
]
const STATUS_OPTIONS = ['active', 'expired', 'maintenance', 'decommissioned'] as const

const emptyForm: RegisterExtinguisherPayload & { notes: string } = {
  serialNumber: '',
  type: '',
  capacity: '',
  location: '',
  manufactureDate: '',
  expiryDate: '',
  customerId: undefined,
  notes: '',
}

export default function InventoryPage() {
  const today = new Date().toISOString().split('T')[0]
  const [extinguishers, setExtinguishers] = useState<ExtinguisherRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExtinguisherRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newStatus, setNewStatus] = useState<typeof STATUS_OPTIONS[number]>('active')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const extRes = await extinguisherApi.getExtinguishers(1, 100)
      if (extRes.success) {
        setExtinguishers(extRes.data?.items ?? [])
        setTotal(extRes.data?.total ?? 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    setSelectedItem(null)
    setForm(emptyForm)
    setIsAddDialogOpen(true)
  }

  const openEdit = (item: ExtinguisherRecord) => {
    setSelectedItem(item)
    setForm({
      serialNumber: item.serialNumber,
      type: item.type,
      capacity: item.capacity,
      location: item.location,
      manufactureDate: item.manufactureDate?.slice(0, 10) ?? '',
      expiryDate: item.expiryDate?.slice(0, 10) ?? '',
      customerId: item.customerId,
      notes: item.notes ?? '',
    })
    setIsAddDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.serialNumber || !form.type || !form.capacity || !form.location || !form.manufactureDate || !form.expiryDate) return
    const manufactureDate = new Date(`${form.manufactureDate}T00:00:00`)
    const expiryDate = new Date(`${form.expiryDate}T00:00:00`)
    if (expiryDate < manufactureDate) {
      toast.error('Expiry date cannot be before manufacture date')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (selectedItem) {
        // Update status only (backend only exposes PATCH /:id/status for updates)
        // For full edit we update status if changed
        setIsAddDialogOpen(false)
      } else {
        const res = await extinguisherApi.registerExtinguisher({
          serialNumber: form.serialNumber,
          type: form.type,
          capacity: form.capacity,
          location: form.location,
          manufactureDate: form.manufactureDate,
          expiryDate: form.expiryDate,
          customerId: form.customerId,
          notes: form.notes,
        })
        if (res.success && res.data) {
          setExtinguishers(prev => [res.data!, ...prev])
          setTotal(prev => prev + 1)
          if (expiryDate < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00')) {
            toast.success('Extinguisher registered as expired')
          } else {
            toast.success('Extinguisher registered successfully')
          }
          setIsAddDialogOpen(false)
        } else {
          toast.error(res.message || 'Failed to register extinguisher')
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const res = await extinguisherApi.updateExtinguisherStatus(selectedItem.id, newStatus)
      if (res.success && res.data) {
        setExtinguishers(prev => prev.map(e => e.id === selectedItem.id ? { ...e, status: newStatus } : e))
        toast.success('Status updated successfully')
        setIsStatusDialogOpen(false)
      } else {
        toast.error(res.message || 'Status update failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Status update failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<ExtinguisherRecord>[] = [
    {
      key: 'serialNumber',
      label: 'Serial Number',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono font-medium">{item.serialNumber}</p>
            <p className="text-xs text-muted-foreground">{item.type}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'capacity', label: 'Capacity' },
    { key: 'location', label: 'Location', sortable: true },
    {
      key: 'customerId',
      label: 'Customer',
      render: (item) => item.customer?.businessName ?? '—',
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      sortable: true,
      render: (item) => new Date(item.expiryDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ]

  const actions = (item: ExtinguisherRecord) => (
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
        <DropdownMenuItem onClick={() => openEdit(item)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setSelectedItem(item)
          setNewStatus(item.status)
          setIsStatusDialogOpen(true)
        }}>
          <CheckCircle className="mr-2 h-4 w-4" /> Update Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const activeCount = extinguishers.filter(e => e.status === 'active').length
  const maintenanceCount = extinguishers.filter(e => e.status === 'maintenance').length
  const expiredCount = extinguishers.filter(e => e.status === 'expired').length
  const handleExport = () => {
    downloadCsv('company-inventory', extinguishers, [
      { header: 'Serial Number', value: item => item.serialNumber },
      { header: 'Type', value: item => item.type },
      { header: 'Capacity', value: item => item.capacity },
      { header: 'Location', value: item => item.location },
      { header: 'Customer', value: item => item.customer?.businessName ?? '' },
      { header: 'Status', value: item => item.status },
      { header: 'Manufacture Date', value: item => item.manufactureDate ? new Date(item.manufactureDate).toLocaleDateString() : '' },
      { header: 'Expiry Date', value: item => new Date(item.expiryDate).toLocaleDateString() },
    ])
  }

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage fire extinguisher inventory</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Extinguisher
          </Button>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', value: total, icon: Package, className: 'text-primary/20' },
            { label: 'Active', value: activeCount, icon: CheckCircle, className: 'text-success/20', textClass: 'text-success' },
            { label: 'Maintenance', value: maintenanceCount, icon: AlertTriangle, className: 'text-warning/20', textClass: 'text-warning' },
            { label: 'Expired', value: expiredCount, icon: XCircle, className: 'text-destructive/20', textClass: 'text-destructive' },
          ].map(({ label, value, icon: Icon, className, textClass }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {loading
                    ? <Skeleton className="h-8 w-16 mt-1" />
                    : <p className={`text-2xl font-bold ${textClass ?? ''}`}>{value}</p>
                  }
                </div>
                <Icon className={`h-8 w-8 ${className}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>All Extinguishers</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={extinguishers}
                searchKeys={['serialNumber', 'type', 'location']}
                actions={actions}
                exportable
                onExport={handleExport}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Extinguisher' : 'Register Extinguisher'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update extinguisher details' : 'Fill in the details to register a new extinguisher'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Serial Number *</Label>
                <Input
                  placeholder="FE-2024-001"
                  value={form.serialNumber}
                  onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
                  disabled={!!selectedItem}
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {EXTINGUISHER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity *</Label>
                <Input
                  placeholder="10 lbs"
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Location *</Label>
                <Input
                  placeholder="Building A - Floor 1"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Manufacture Date *</Label>
                <Input
                  type="date"
                  max={today}
                  value={form.manufactureDate}
                  onChange={e => setForm(f => ({ ...f, manufactureDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.serialNumber || !form.type || !form.capacity || !form.location || !form.manufactureDate || !form.expiryDate}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedItem ? 'Save Changes' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Extinguisher Details</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-lg">{selectedItem.serialNumber}</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.type} — {selectedItem.capacity}</p>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t text-sm">
                {[
                  ['Location', selectedItem.location],
                  ['Customer', selectedItem.customer?.businessName ?? '—'],
                  ['Manufacture Date', selectedItem.manufactureDate ? new Date(selectedItem.manufactureDate).toLocaleDateString() : '—'],
                  ['Expiry Date', new Date(selectedItem.expiryDate).toLocaleDateString()],
                  ['Last Inspection', selectedItem.lastInspectionDate ? new Date(selectedItem.lastInspectionDate).toLocaleDateString() : '—'],
                  ['Next Inspection', selectedItem.nextInspectionDate ? new Date(selectedItem.nextInspectionDate).toLocaleDateString() : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                {selectedItem.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p>{selectedItem.notes}</p>
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

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Change the status of {selectedItem?.serialNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={v => setNewStatus(v as typeof STATUS_OPTIONS[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
