'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { customerApi, type CustomerRecord } from '@/lib/api/customer'
import { downloadCsv } from '@/lib/export'
import { Eye, Package, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customerApi.getCustomers(1, 100)
      if (res.success && res.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : []
        setCustomers(items)
        setTotal(typeof res.data.total === 'number' ? res.data.total : items.length)
      } else {
        setCustomers([])
        setTotal(0)
        toast.error(res.message || 'Failed to load customers')
      }
    } catch (err: any) {
      setCustomers([])
      setTotal(0)
      toast.error(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const safeCustomers = Array.isArray(customers) ? customers : []
  const activeCount = safeCustomers.filter(customer => customer.isActive).length

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'businessName',
      label: 'Customer',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {customer.contactPerson
                .split(' ')
                .map(part => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{customer.businessName}</p>
            <p className="text-xs text-muted-foreground">{customer.user?.email ?? customer.contactPerson}</p>
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
      render: (customer) => customer.phone || '—',
    },
    {
      key: 'city',
      label: 'City',
      render: (customer) => customer.city || '—',
    },
    {
      key: 'createdAt',
      label: 'Customer Since',
      sortable: true,
      render: (customer) => new Date(customer.createdAt).toLocaleDateString(),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (customer) => <StatusBadge status={customer.isActive ? 'active' : 'pending'} />,
    },
  ]

  const handleExport = () => {
    downloadCsv('company-customers', safeCustomers, [
      { header: 'Business Name', value: customer => customer.businessName },
      { header: 'Contact Person', value: customer => customer.contactPerson },
      { header: 'Email', value: customer => customer.user?.email ?? '' },
      { header: 'Phone', value: customer => customer.phone ?? '' },
      { header: 'City', value: customer => customer.city ?? '' },
      { header: 'Address', value: customer => customer.address ?? '' },
      { header: 'Status', value: customer => (customer.isActive ? 'Active' : 'Inactive') },
      { header: 'Created At', value: customer => new Date(customer.createdAt).toLocaleDateString() },
    ])
  }

  const actions = (customer: CustomerRecord) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => {
        setSelectedCustomer(customer)
        setIsViewDialogOpen(true)
      }}
    >
      <Eye className="h-4 w-4" />
    </Button>
  )

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Customers who have purchased from your company</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                {loading ? <Skeleton className="mt-1 h-8 w-16" /> : <p className="text-2xl font-bold">{total}</p>}
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                {loading ? <Skeleton className="mt-1 h-8 w-16" /> : <p className="text-2xl font-bold text-success">{activeCount}</p>}
              </div>
              <Users className="h-8 w-8 text-success/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                {loading ? <Skeleton className="mt-1 h-8 w-16" /> : <p className="text-2xl font-bold text-muted-foreground">{total - activeCount}</p>}
              </div>
              <Package className="h-8 w-8 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={safeCustomers}
                searchKeys={['businessName', 'contactPerson', 'phone', 'city']}
                actions={actions}
                exportable
                onExport={handleExport}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedCustomer.contactPerson
                      .split(' ')
                      .map(part => part[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.businessName}</h3>
                  <StatusBadge status={selectedCustomer.isActive ? 'active' : 'pending'} />
                </div>
              </div>
              <div className="grid gap-3 border-t pt-4">
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
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
