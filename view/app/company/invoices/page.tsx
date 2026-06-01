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
import { paymentApi, type InvoiceRecord, type CreateInvoicePayload } from '@/lib/api/payment'
import { customerApi, type CustomerRecord } from '@/lib/api/customer'
import {
  Plus,
  MoreHorizontal,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  CreditCard,
} from 'lucide-react'

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money', 'card'] as const

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [total, setTotal] = useState(0)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)

  const [form, setForm] = useState<CreateInvoicePayload>({
    customerId: 0,
    description: '',
    amount: 0,
    tax: 0,
    dueDate: '',
  })

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMethod: 'cash' as typeof PAYMENT_METHODS[number],
    transactionRef: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [invRes, custRes] = await Promise.allSettled([
        paymentApi.getInvoices(1, 100),
        customerApi.getCustomers(1, 100),
      ])
      if (invRes.status === 'fulfilled' && invRes.value.success) {
        setInvoices(invRes.value.data?.items ?? [])
        setTotal(invRes.value.data?.total ?? 0)
      }
      if (custRes.status === 'fulfilled' && custRes.value.success) {
        setCustomers(custRes.value.data?.items ?? [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    if (!form.customerId || !form.description || !form.amount || !form.dueDate) return
    setSaving(true)
    setError(null)
    try {
      const res = await paymentApi.createInvoice(form)
      if (res.success && res.data) {
        setInvoices(prev => [res.data!, ...prev])
        setTotal(prev => prev + 1)
        setIsCreateDialogOpen(false)
        setForm({ customerId: 0, description: '', amount: 0, tax: 0, dueDate: '' })
      } else {
        setError(res.message || 'Failed to create invoice')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !payForm.amount) return
    setSaving(true)
    setError(null)
    try {
      const res = await paymentApi.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        transactionRef: payForm.transactionRef || undefined,
        notes: payForm.notes || undefined,
      })
      if (res.success) {
        setInvoices(prev =>
          prev.map(inv =>
            inv.id === selectedInvoice.id ? { ...inv, status: 'paid' as const } : inv
          )
        )
        setIsPayDialogOpen(false)
      } else {
        setError(res.message || 'Payment failed')
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<InvoiceRecord>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      sortable: true,
      render: (inv) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono font-medium">{inv.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">{inv.customer?.businessName ?? `Customer #${inv.customerId}`}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (inv) => <span className="text-sm">{inv.description}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (inv) => (
        <span className="font-medium">
          ${(inv.totalAmount ?? inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (inv) => new Date(inv.dueDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (inv) => <StatusBadge status={inv.status} />,
    },
  ]

  const actions = (inv: InvoiceRecord) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setSelectedInvoice(inv); setIsViewDialogOpen(true) }}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        {inv.status === 'pending' && (
          <DropdownMenuItem onClick={() => {
            setSelectedInvoice(inv)
            setPayForm({ amount: inv.totalAmount ?? inv.amount, paymentMethod: 'cash', transactionRef: '', notes: '' })
            setIsPayDialogOpen(true)
          }}>
            <CreditCard className="mr-2 h-4 w-4" /> Record Payment
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const pendingCount = invoices.filter(i => i.status === 'pending').length
  const paidCount = invoices.filter(i => i.status === 'paid').length
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.totalAmount ?? i.amount), 0)

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and payments</p>
          </div>
          <Button onClick={() => { setForm({ customerId: 0, description: '', amount: 0, tax: 0, dueDate: '' }); setError(null); setIsCreateDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', value: total, icon: DollarSign, color: '' },
            { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-warning' },
            { label: 'Paid', value: paidCount, icon: CheckCircle, color: 'text-success' },
            { label: 'Overdue', value: overdueCount, icon: XCircle, color: 'text-destructive' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className={`text-2xl font-bold ${color}`}>{value}</p>}
                </div>
                <Icon className="h-8 w-8 text-muted-foreground/20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Banner */}
        {!loading && (
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue Collected</p>
                <p className="text-2xl font-bold text-success">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={invoices}
                searchKeys={['invoiceNumber', 'description']}
                actions={actions}
                exportable
                onExport={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Generate a new invoice for a customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={form.customerId ? form.customerId.toString() : ''}
                onValueChange={v => setForm(f => ({ ...f, customerId: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Fire extinguisher inspection and maintenance..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount || ''}
                  onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.tax || ''}
                  onChange={e => setForm(f => ({ ...f, tax: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            {form.amount > 0 && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                Total: <strong>${((form.amount || 0) + (form.tax || 0)).toFixed(2)}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !form.customerId || !form.description || !form.amount || !form.dueDate}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-lg">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer?.businessName}</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t text-sm">
                {[
                  ['Description', selectedInvoice.description],
                  ['Amount', `$${selectedInvoice.amount.toFixed(2)}`],
                  ['Tax', `$${(selectedInvoice.tax ?? 0).toFixed(2)}`],
                  ['Total', `$${(selectedInvoice.totalAmount ?? selectedInvoice.amount).toFixed(2)}`],
                  ['Due Date', new Date(selectedInvoice.dueDate).toLocaleDateString()],
                  ['Paid Date', selectedInvoice.paidDate ? new Date(selectedInvoice.paidDate).toLocaleDateString() : '—'],
                  ['Created', new Date(selectedInvoice.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={payForm.amount || ''}
                onChange={e => setPayForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={payForm.paymentMethod}
                onValueChange={v => setPayForm(f => ({ ...f, paymentMethod: v as typeof PAYMENT_METHODS[number] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input
                placeholder="Optional"
                value={payForm.transactionRef}
                onChange={e => setPayForm(f => ({ ...f, transactionRef: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional"
                value={payForm.notes}
                onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={saving || !payForm.amount}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
