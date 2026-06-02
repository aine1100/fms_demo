'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { extinguisherApi, type CatalogItem } from '@/lib/api/extinguisher'
import { notificationApi } from '@/lib/api/notification'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  Search,
  ShoppingCart,
  Building2,
  Package,
  Filter,
  Flame,
  Loader2,
  Tag,
  Info,
  CheckCircle,
} from 'lucide-react'

const EXTINGUISHER_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'water', label: 'Water' },
  { value: 'foam', label: 'Foam' },
  { value: 'co2', label: 'CO2' },
  { value: 'dry_powder', label: 'Dry Powder' },
  { value: 'wet_chemical', label: 'Wet Chemical' },
]

export default function BuyEquipmentPage() {
  const { user } = useAuthStore()
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Request dialog
  const [requestItem, setRequestItem] = useState<CatalogItem | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [requestForm, setRequestForm] = useState({
    preferredDate: '',
    location: '',
    notes: '',
    quantity: '1',
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const loadCatalog = useCallback(async () => {
    setLoading(true)
    try {
      const res = await extinguisherApi.getCatalog(1, 50, {
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: debouncedSearch || undefined,
      })
      if (res.success && res.data) {
        setCatalog(res.data.items ?? [])
        setTotalItems(res.data.total ?? 0)
      } else {
        setCatalog([])
        setTotalItems(0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load catalog')
      setCatalog([])
    } finally {
      setLoading(false)
    }
  }, [typeFilter, debouncedSearch])

  useEffect(() => { loadCatalog() }, [loadCatalog])

  const handleRequest = async () => {
    if (!requestItem) return
    if (!requestForm.preferredDate) {
      toast.error('Please select a preferred date')
      return
    }

    setSending(true)
    try {
      // Send a notification/request to the company that listed this item
      const message = [
        `Customer ${user?.firstName ?? ''} ${user?.lastName ?? ''} (${user?.email}) is requesting to purchase:`,
        `• Item: ${requestItem.name}`,
        `• Type: ${requestItem.type}`,
        `• Capacity: ${requestItem.capacity}`,
        `• Quantity: ${requestForm.quantity}`,
        `• Preferred Date: ${new Date(requestForm.preferredDate).toLocaleDateString()}`,
        requestForm.location ? `• Location: ${requestForm.location}` : '',
        requestForm.notes ? `• Notes: ${requestForm.notes}` : '',
      ].filter(Boolean).join('\n')

      const res = await notificationApi.sendNotification({
        userId: requestItem.companyId,
        title: `Purchase Request: ${requestItem.name}`,
        message,
        type: 'info',
      })

      if (res.success) {
        toast.success('Purchase request sent to the company!')
        setRequestOpen(false)
        setRequestForm({ preferredDate: '', location: '', notes: '', quantity: '1' })
      } else {
        toast.error(res.message || 'Failed to send request')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  // Group items by company for display
  const companies = Array.from(new Set(catalog.map(i => i.companyId)))

  const typeColor: Record<string, string> = {
    water: 'bg-blue-100 text-blue-700',
    foam: 'bg-green-100 text-green-700',
    co2: 'bg-gray-100 text-gray-700',
    dry_powder: 'bg-yellow-100 text-yellow-700',
    wet_chemical: 'bg-orange-100 text-orange-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">Buy Equipment</h1>
          <p className="text-muted-foreground">
            Browse fire extinguishers from all registered service companies and request a purchase.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, type, description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXTINGUISHER_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {totalItems} item{totalItems !== 1 ? 's' : ''} available from {companies.length} company{companies.length !== 1 ? 'ies' : ''}
          </p>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No items available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {debouncedSearch || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No companies have listed equipment yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map(item => (
              <Card
                key={item.id}
                className="flex flex-col hover:shadow-md transition-shadow border-border"
              >
                {/* Card top banner */}
                <div className="h-2 rounded-t-xl bg-primary" />
                <CardContent className="flex flex-col flex-1 p-5 gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Flame className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.capacity}</p>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 text-xs capitalize ${typeColor[item.type] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {item.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {item.description || 'No description provided.'}
                  </p>

                  {/* Company badge */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Company #{item.companyId}</span>
                  </div>

                  {/* Price + CTA */}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-success" />
                      <span className="text-xl font-bold text-success">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setRequestItem(item)
                        setRequestForm({ preferredDate: '', location: '', notes: '', quantity: '1' })
                        setRequestOpen(true)
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Purchase</DialogTitle>
            <DialogDescription>
              Send a purchase request to the company for this item.
            </DialogDescription>
          </DialogHeader>

          {requestItem && (
            <div className="space-y-4 py-2">
              {/* Item summary */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{requestItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {requestItem.type.replace('_', ' ')} • {requestItem.capacity} •{' '}
                    <span className="font-medium text-success">${Number(requestItem.price).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={requestForm.quantity}
                      onChange={e => setRequestForm(f => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred Date *</Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={requestForm.preferredDate}
                      onChange={e => setRequestForm(f => ({ ...f, preferredDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery / Installation Location</Label>
                  <Input
                    placeholder="Building A - Floor 1"
                    value={requestForm.location}
                    onChange={e => setRequestForm(f => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any special requirements or questions..."
                    rows={3}
                    value={requestForm.notes}
                    onChange={e => setRequestForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-muted-foreground">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Your request will be sent to the company. They will contact you to confirm the purchase and arrange delivery.
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setRequestOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  onClick={handleRequest}
                  disabled={sending || !requestForm.preferredDate}
                >
                  {sending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle className="h-4 w-4" />
                  }
                  {sending ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
