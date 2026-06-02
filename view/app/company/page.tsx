'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Package,
  Users,
  ClipboardCheck,
  AlertTriangle,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { extinguisherApi, type ExtinguisherRecord } from '@/lib/api/extinguisher'
import { inspectionApi, type InspectionRecord } from '@/lib/api/inspection'
import { customerApi } from '@/lib/api/customer'
import { paymentApi } from '@/lib/api/payment'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface DashboardStats {
  totalExtinguishers: number
  activeExtinguishers: number
  maintenanceRequired: number
  pendingInspections: number
  totalCustomers: number
  totalRevenue: number
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExtinguishers: 0,
    activeExtinguishers: 0,
    maintenanceRequired: 0,
    pendingInspections: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [upcomingInspections, setUpcomingInspections] = useState<InspectionRecord[]>([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<ExtinguisherRecord[]>([])
  const [statusData, setStatusData] = useState([
    { name: 'Active', value: 0, color: 'hsl(var(--success))' },
    { name: 'Maintenance', value: 0, color: 'hsl(var(--warning))' },
    { name: 'Expired', value: 0, color: 'hsl(var(--destructive))' },
    { name: 'Decommissioned', value: 0, color: 'hsl(var(--muted-foreground))' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [extRes, inspRes, custRes, invoiceRes] = await Promise.allSettled([
          extinguisherApi.getExtinguishers(1, 100),
          inspectionApi.getInspections(1, 50, { status: 'scheduled' }),
          customerApi.getCustomers(1, 1),
          paymentApi.getInvoices(1, 100, { status: 'paid' }),
        ])

        let extinguishers: ExtinguisherRecord[] = []
        if (extRes.status === 'fulfilled' && extRes.value.success) {
          extinguishers = extRes.value.data?.items ?? []
          const active = extinguishers.filter(e => e.status === 'active').length
          const maintenance = extinguishers.filter(e => e.status === 'maintenance').length
          const expired = extinguishers.filter(e => e.status === 'expired').length
          const decommissioned = extinguishers.filter(e => e.status === 'decommissioned').length

          setStats(prev => ({
            ...prev,
            totalExtinguishers: extRes.value.data?.total ?? extinguishers.length,
            activeExtinguishers: active,
            maintenanceRequired: maintenance + expired,
          }))
          setStatusData([
            { name: 'Active', value: active, color: 'hsl(var(--success))' },
            { name: 'Maintenance', value: maintenance, color: 'hsl(var(--warning))' },
            { name: 'Expired', value: expired, color: 'hsl(var(--destructive))' },
            { name: 'Decommissioned', value: decommissioned, color: 'hsl(var(--muted-foreground))' },
          ])
          setMaintenanceAlerts(
            extinguishers.filter(e => e.status === 'maintenance' || e.status === 'expired').slice(0, 4)
          )
        }

        if (inspRes.status === 'fulfilled' && inspRes.value.success) {
          const items = inspRes.value.data?.items ?? []
          setUpcomingInspections(items.slice(0, 4))
          setStats(prev => ({ ...prev, pendingInspections: inspRes.value.data?.total ?? items.length }))
        }

        if (custRes.status === 'fulfilled' && custRes.value.success) {
          setStats(prev => ({ ...prev, totalCustomers: custRes.value.data?.total ?? 0 }))
        }

        if (invoiceRes.status === 'fulfilled' && invoiceRes.value.success) {
          const invoices = invoiceRes.value.data?.items ?? []
          const revenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0)
          setStats(prev => ({ ...prev, totalRevenue: revenue }))
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is your company overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Extinguishers"
                value={stats.totalExtinguishers}
                icon={<Package className="h-6 w-6" />}
                description="registered units"
              />
              <StatsCard
                title="Active Customers"
                value={stats.totalCustomers}
                icon={<Users className="h-6 w-6" />}
                description="in your company"
              />
              <StatsCard
                title="Pending Inspections"
                value={stats.pendingInspections}
                icon={<ClipboardCheck className="h-6 w-6" />}
                description="scheduled"
              />
              <StatsCard
                title="Maintenance Alerts"
                value={stats.maintenanceRequired}
                icon={<AlertTriangle className="h-6 w-6" />}
                description="need attention"
                iconClassName="bg-warning/10 text-warning"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
              <CardDescription>Total from paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px] gap-2">
                  <DollarSign className="h-12 w-12 text-primary/30" />
                  <p className="text-4xl font-bold text-foreground">
                    ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Total revenue from paid invoices</p>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link href="/company/payments">View Payments <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extinguisher Status Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Status</CardTitle>
              <CardDescription>Extinguisher status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {statusData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                        <span className="text-xs font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Inspections & Maintenance Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Inspections</CardTitle>
                <CardDescription>Scheduled inspections</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/company/inspections">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : upcomingInspections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming inspections</p>
              ) : (
                <div className="space-y-3">
                  {upcomingInspections.map(inspection => (
                    <div key={inspection.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {inspection.extinguisher?.serialNumber ?? `#${inspection.extinguisherId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inspection.customer?.businessName ?? inspection.location ?? '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(inspection.scheduledDate).toLocaleDateString()}
                        </p>
                        <StatusBadge status={inspection.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Maintenance Alerts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/company/inventory">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : maintenanceAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No maintenance alerts</p>
              ) : (
                <div className="space-y-3">
                  {maintenanceAlerts.map(ext => (
                    <div key={ext.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          ext.status === 'expired' ? 'bg-destructive/10' : 'bg-warning/10'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            ext.status === 'expired' ? 'text-destructive' : 'text-warning'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ext.serialNumber}</p>
                          <p className="text-xs text-muted-foreground">{ext.location}</p>
                        </div>
                      </div>
                      <StatusBadge status={ext.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/company/inventory"><Package className="h-5 w-5" /><span>Add Extinguisher</span></Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/company/inspections"><Calendar className="h-5 w-5" /><span>Schedule Inspection</span></Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/company/customers"><Users className="h-5 w-5" /><span>View Customers</span></Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/company/payments"><DollarSign className="h-5 w-5" /><span>View Payments</span></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
