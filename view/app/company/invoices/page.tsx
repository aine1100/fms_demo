'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { paymentApi, type InvoiceRecord } from '@/lib/api/payment'
import { downloadCsv } from '@/lib/export'
import { DollarSign, CheckCircle, Eye, Download, Users } from 'lucide-react'

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await paymentApi.getInvoices(1, 200, { status: 'paid' })
      if (res.success && res.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : []
        setInvoices(items)
      } else {
        setInvoices([])
        setError(res.message || 'Failed to load payments')
      }
    } catch (err: any) {
      setInvoices([])
      setError(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const safeInvoices = Array.isArray(invoices) ? invoices : []
  const totalRevenue = safeInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount ?? invoice.amount), 0)
  const uniqueCustomers = new Set(safeInvoices.map(invoice => invoice.customerId)).size

  const columns: Column<InvoiceRecord>[] = [
    {
      key: 'invoiceNumber',
      label: 'Payment Ref',
      sortable: true,
      render: (invoice) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">{invoice.customer?.businessName ?? `Customer #${invoice.customerId}`}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (invoice) => <span className="text-sm">{invoice.description}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Amount Paid',
      sortable: true,
      render: (invoice) => (
        <span className="font-medium">
          ${(invoice.totalAmount ?? invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'paidDate',
      label: 'Paid Date',
      sortable: true,
      render: (invoice) => invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (invoice) => <StatusBadge status={invoice.status} />,
    },
  ]

  const handleExport = () => {
    downloadCsv('company-payments', safeInvoices, [
      { header: 'Payment Ref', value: invoice => invoice.invoiceNumber },
      { header: 'Customer', value: invoice => invoice.customer?.businessName ?? `Customer #${invoice.customerId}` },
      { header: 'Description', value: invoice => invoice.description },
      { header: 'Amount Paid', value: invoice => (invoice.totalAmount ?? invoice.amount).toFixed(2) },
      { header: 'Paid Date', value: invoice => invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '' },
      { header: 'Status', value: invoice => invoice.status },
    ])
  }

  const actions = (invoice: InvoiceRecord) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => {
        setSelectedInvoice(invoice)
        setIsViewDialogOpen(true)
      }}
    >
      <Eye className="h-4 w-4" />
    </Button>
  )

  const paidCount = safeInvoices.length

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">Paid invoices and payment history for your company</p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={loading || safeInvoices.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                {loading ? <Skeleton className="mt-1 h-8 w-16" /> : <p className="text-2xl font-bold">{paidCount}</p>}
              </div>
              <CheckCircle className="h-8 w-8 text-success/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                {loading ? <Skeleton className="mt-1 h-8 w-24" /> : <p className="text-2xl font-bold text-success">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>}
              </div>
              <DollarSign className="h-8 w-8 text-success/20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Customers Paid</p>
                {loading ? <Skeleton className="mt-1 h-8 w-16" /> : <p className="text-2xl font-bold">{uniqueCustomers}</p>}
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={safeInvoices}
                searchKeys={['invoiceNumber', 'description']}
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
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono text-lg font-semibold">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer?.businessName}</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>
              <div className="grid gap-3 border-t pt-4 text-sm">
                {[
                  ['Description', selectedInvoice.description],
                  ['Amount', `$${selectedInvoice.amount.toFixed(2)}`],
                  ['Tax', `$${(selectedInvoice.tax ?? 0).toFixed(2)}`],
                  ['Total', `$${(selectedInvoice.totalAmount ?? selectedInvoice.amount).toFixed(2)}`],
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
    </DashboardLayout>
  )
}
