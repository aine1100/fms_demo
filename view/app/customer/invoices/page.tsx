'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { paymentApi, type InvoiceRecord } from '@/lib/api/payment'
import { customerApi } from '@/lib/api/customer'
import toast from 'react-hot-toast'
import {
  Search,
  FileText,
  DollarSign,
  Calendar,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Download,
  ArrowRight,
} from 'lucide-react'

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'bank_transfer' as const,
    transactionRef: '',
    notes: '',
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await paymentApi.getInvoices(1, 100)
      if (res.success && res.data) {
        setInvoices(res.data.items ?? [])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const filterInvoices = () => {
    return invoices.filter(inv => {
      const searchMatch = searchTerm === '' ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchTerm.toLowerCase())

      const statusMatch = statusFilter === 'all' || inv.status === statusFilter

      return searchMatch && statusMatch
    })
  }

  const handlePayment = async () => {
    if (!selectedInvoice) {
      toast.error('No invoice selected')
      return
    }

    setIsProcessingPayment(true)
    try {
      const res = await paymentApi.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.totalAmount,
        paymentMethod: paymentData.paymentMethod,
        transactionRef: paymentData.transactionRef || undefined,
        notes: paymentData.notes || undefined,
      })

      if (res.success) {
        toast.success('Payment recorded successfully')
        setPaymentDialogOpen(false)
        setPaymentData({ paymentMethod: 'bank_transfer', transactionRef: '', notes: '' })
        await loadInvoices()
        setSelectedInvoice(null)
      } else {
        toast.error(res.message || 'Failed to record payment')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleViewInvoice = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv)
    setViewOpen(true)
  }

  const handlePayInvoice = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv)
    setPaymentDialogOpen(true)
  }

  const filtered = filterInvoices()
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  }

  const getPendingAmount = () => {
    return invoices
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices & Payments</h1>
            <p className="text-muted-foreground">View and manage your payment invoices</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/customer/buy-equipment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Buy Equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Invoices</div>
              <div className="text-3xl font-bold mt-2">{loading ? '—' : stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-3xl font-bold mt-2 text-warning">{loading ? '—' : stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Due Amount</div>
              <div className="text-3xl font-bold mt-2 text-destructive">${getPendingAmount().toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Paid</div>
              <div className="text-3xl font-bold mt-2 text-success">{loading ? '—' : stats.paid}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by invoice number or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No invoices found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or buy equipment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="rounded-lg bg-muted p-2 shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono font-medium">
                            {invoice.invoiceNumber}
                          </p>
                          <StatusBadge status={invoice.status} />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {invoice.description}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                      <div className="text-right">
                        <p className="font-semibold">${invoice.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.status === 'paid' ? 'Paid' : 'Due'}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePayInvoice(invoice)}
                          >
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Pay</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-mono font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm font-medium">{selectedInvoice.description}</p>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Due</span>
                  <span className="text-lg text-primary">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.status === 'paid' && selectedInvoice.paidDate && (
                <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-sm">
                  <p className="text-success">
                    ✓ Paid on {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setViewOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            {selectedInvoice && (selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
              <Button
                onClick={() => {
                  setViewOpen(false)
                  handlePayInvoice(selectedInvoice)
                }}
                className="flex-1 gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Complete the payment for this invoice
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Invoice</p>
                <p className="font-mono font-semibold">{selectedInvoice.invoiceNumber}</p>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Due</span>
                    <span className="font-semibold text-lg">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method *</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(v: any) =>
                    setPaymentData(prev => ({ ...prev, paymentMethod: v }))
                  }
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-ref">Transaction Reference</Label>
                <Input
                  id="transaction-ref"
                  placeholder="Enter transaction ID or reference number"
                  value={paymentData.transactionRef}
                  onChange={e =>
                    setPaymentData(prev => ({ ...prev, transactionRef: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional payment notes (optional)"
                  value={paymentData.notes}
                  onChange={e =>
                    setPaymentData(prev => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                <p className="text-foreground">
                  Please ensure payment has been made before recording it. This will update the invoice status to paid.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
