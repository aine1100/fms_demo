'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { StatsCard } from '@/components/shared/stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { customerApi } from '@/lib/api/customer'
import { extinguisherApi, type ExtinguisherRecord } from '@/lib/api/extinguisher'
import { type InspectionRecord } from '@/lib/api/inspection'
import { type InvoiceRecord } from '@/lib/api/payment'
import { type NotificationRecord } from '@/lib/api/notification'
import {
  FireExtinguisher,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Bell,
  Loader2,
  Building2,
  ShoppingCart,
  ArrowRight,
  Package,
  Receipt,
  ClipboardList,
  MapPin,
} from 'lucide-react'

type CatalogItem = {
  id: number
  companyId: number
  name: string
  type: string
  capacity: string
  description?: string | null
  price: string | number
  imageUrl?: string | null
}

export default function CustomerDashboardPage() {
  const [extinguishers, setExtinguishers] = useState<ExtinguisherRecord[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [alerts, setAlerts] = useState<NotificationRecord[]>([])
  const [inspections, setInspections] = useState<InspectionRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('Customer')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, extRes, catalogRes, alertRes, inspRes, invoiceRes] = await Promise.all([
        customerApi.getMyProfile(),
        customerApi.getMyExtinguishers(),
        extinguisherApi.getCatalog(1, 8),
        customerApi.getAlerts(1, 4),
        customerApi.getInspectionHistory(1, 5),
        customerApi.getInvoices(1, 5),
      ])

      if (profileRes.success && profileRes.data) {
        setCustomerName(profileRes.data.businessName || profileRes.data.contactPerson || 'Customer')
      }

      if (extRes.success && extRes.data) {
        setExtinguishers(extRes.data.items ?? [])
      } else {
        setExtinguishers([])
      }

      if (catalogRes.success && catalogRes.data) {
        setCatalog((catalogRes.data.items ?? []) as CatalogItem[])
      } else {
        setCatalog([])
      }

      if (alertRes.success && alertRes.data) {
        setAlerts(alertRes.data.items ?? [])
      } else {
        setAlerts([])
      }

      if (inspRes.success && inspRes.data) {
        setInspections(inspRes.data.items ?? [])
      } else {
        setInspections([])
      }

      if (invoiceRes.success && invoiceRes.data) {
        setInvoices(invoiceRes.data.items ?? [])
      } else {
        setInvoices([])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customer dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const activeCount = extinguishers.filter(ext => ext.status === 'active').length
  const expiringSoon = extinguishers.filter(ext => {
    const daysUntilExpiry = Math.floor((new Date(ext.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }).length
  const expiredCount = extinguishers.filter(ext => ext.status === 'expired').length
  const totalSpent = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.totalAmount ?? inv.amount ?? 0), 0)

  const companyCount = useMemo(() => {
    return new Set(catalog.map(item => item.companyId)).size
  }, [catalog])

  const alertsToShow = alerts.slice(0, 3)
  const recentInspections = inspections.slice(0, 3)
  const recentPayments = invoices.slice(0, 3)
  const catalogPreview = catalog.slice(0, 6)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {customerName}. Browse equipment, track your units, and follow up on payments and inspections.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/customer/equipment"><Package className="mr-2 h-4 w-4" /> My Equipment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/service-requests"><ShoppingCart className="mr-2 h-4 w-4" /> Request Service</Link>
            </Button>
            <Button asChild>
              <Link href="/customer/service-requests"><Calendar className="mr-2 h-4 w-4" /> Buy / Request</Link>
            </Button>
          </div>
        </div>

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {alertsToShow.length > 0 && (
          <div className="space-y-2">
            {alertsToShow.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  alert.type === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-primary/10 border-primary/20'
                }`}
              >
                <Bell className={`h-5 w-5 ${alert.type === 'warning' ? 'text-warning' : 'text-primary'}`} />
                <span className="text-sm font-medium">{alert.title}: {alert.message}</span>
                <Button variant="ghost" size="sm" className="ml-auto" asChild>
                  <Link href="/customer/service-requests">Open</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="My Extinguishers"
            value={loading ? '—' : extinguishers.length}
            icon={FireExtinguisher}
            description="Registered to you"
          />
          <StatsCard
            title="Active"
            value={loading ? '—' : activeCount}
            icon={CheckCircle}
            description="In service"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Expiring Soon"
            value={loading ? '—' : expiringSoon}
            icon={AlertTriangle}
            description="Within 30 days"
            className="border-l-4 border-l-warning"
          />
          <StatsCard
            title="Available Companies"
            value={loading ? '—' : companyCount}
            icon={Building2}
            description="In the catalog"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Extinguishers</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customer/equipment">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : extinguishers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No extinguishers are linked to your account yet.</p>
              ) : (
                <div className="space-y-3">
                  {extinguishers.slice(0, 3).map((ext) => (
                    <div key={ext.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{ext.serialNumber}</p>
                        <p className="text-sm text-muted-foreground">{ext.type} • {ext.location || 'No location set'}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires {new Date(ext.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={ext.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customer/invoices">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentPayments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No payments yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Invoice #{inv.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(inv.totalAmount ?? inv.amount).toFixed(2)} • {inv.customer?.businessName ?? 'Your account'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inspection Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customer/inspections">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentInspections.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No recent inspection activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentInspections.map((inspection) => (
                    <div key={inspection.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-primary/10 p-2">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{inspection.extinguisher?.serialNumber ?? `#${inspection.extinguisherId}`}</p>
                          <p className="text-sm text-muted-foreground">{inspection.location || 'No location set'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inspection.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={inspection.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catalog Preview</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customer/service-requests">Browse more <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : catalogPreview.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No catalog items available right now.</p>
              ) : (
                <div className="space-y-3">
                  {catalogPreview.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Company #{item.companyId} • {item.type} • {item.capacity}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.description || 'Available for customer requests'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                        <Button asChild size="sm" className="mt-2">
                          <Link href="/customer/service-requests">Request</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/customer/service-requests"><ShoppingCart className="h-5 w-5" /><span>Buy / Request</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/customer/equipment"><Package className="h-5 w-5" /><span>My Equipment</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/customer/inspections"><ClipboardList className="h-5 w-5" /><span>Inspections</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
                <Link href="/customer/invoices"><Receipt className="h-5 w-5" /><span>Payments</span></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Extinguishers</p>
                  <p className="text-2xl font-bold">{extinguishers.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-warning">{expiringSoon}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Paid Total</p>
                  <p className="text-2xl font-bold text-success">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
