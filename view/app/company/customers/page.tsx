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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { customerApi, type CustomerRecord, type CustomerPayload } from '@/lib/api/customer'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
  Package,
  Loader2,
} from 'lucide-react'

const emptyForm: CustomerPayload = {
  businessName: '',
  contactPerson: '',
  phone: '',
  address: '',
  city: '',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [form, setForm] = useState<CustomerPayload>(emptyForm)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customerApi.getCustomers(1, 100)
      if (res.success && res.data) {
        const nextCustomers = Array.isArray(res.data.items) ? res.data.items : []
        setCustomers(nextCustomers)
        setTotal(typeof res.data.total === 'number' ? res.data.total : nextCustomers.length)
      } else {
        setError(res.message || 'Failed to load customers')
        setCustomers([])
        setTotal(0)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customers')
      setCustomers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const openAdd = () => {
    setSelectedCustomer(null)
    setForm(emptyForm)
    setIsAddDialogOpen(true)
  }

  const openEdit = (customer: CustomerRecord) => {
    setSelectedCustomer(customer)
    setForm({
      businessName: customer.businessName,
      contactPerson: customer.contactPerson,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
    })
    setIsAddDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.businessName.trim() || !form.contactPerson.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (selectedCustomer) {
        const res = await customerApi.updateCustomer(selectedCustomer.id, form)
        if (res.success) {
          setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...res.data! } : c))
        } else {
          setError(res.message || 'Update failed')
        }
      } else {
        const res = await customerApi.createCustomer(form)
        if (res.success && res.data) {
          setCustomers(prev => [res.data!, ...prev])
          setTotal(prev => prev + 1)
        } else {
          setError(res.message || 'Create failed')
        }
      }
      setIsAddDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    setSaving(true)
    try {
      const res = await customerApi.deleteCustomer(selectedCustomer.id)
      if (res.success) {
        setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id))
        setTotal(prev => prev - 1)
        setIsDeleteDialogOpen(false)
        setSelectedCustomer(null)
      } else {
        setError(res.message || 'Delete failed')
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (c: CustomerRecord) =>
    c.contactPerson
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'businessName',
      label: 'Customer',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(c)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{c.businessName}</p>
            <p className="text-xs text-muted-foreground">{c.user?.email ?? c.contactPerson}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (c) => c.phone || '—',
    },
    {
      key: 'city',
      label: 'City',
      render: (c) => c.city || '—',
    },
    {
      key: 'createdAt',
      label: 'Customer Since',
      sortable: true,
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (c) => <StatusBadge status={c.isActive ? 'active' : 'pending'} />,
    },
  ]

  const actions = (c: CustomerRecord) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setSelectedCustomer(c); setIsViewDialogOpen(true) }}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEdit(c)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => { setSelectedCustomer(c); setIsDeleteDialogOpen(true) }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const safeCustomers = Array.isArray(customers) ? customers : []
  const activeCount = safeCustomers.filter(c => c.isActive).length

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage your customer accounts</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{total}</p>}
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-success">{activeCount}</p>}
              </div>
              <Users className="h-8 w-8 text-success/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-muted-foreground">{total - activeCount}</p>}
              </div>
              <Package className="h-8 w-8 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>All Customers</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={customers}
                searchKeys={['businessName', 'contactPerson']}
                actions={actions}
                exportable
                onExport={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? 'Update customer information' : 'Fill in the details to add a new customer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Acme Corp"
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="John Doe"
                value={form.contactPerson}
                onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.businessName.trim() || !form.contactPerson.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedCustomer)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.businessName}</h3>
                  <StatusBadge status={selectedCustomer.isActive ? 'active' : 'pending'} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person</span>
                  <span className="font-medium">{selectedCustomer.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedCustomer.user?.email ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedCustomer.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{selectedCustomer.city || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium">{selectedCustomer.address || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Since</span>
                  <span className="font-medium">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCustomer?.businessName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
