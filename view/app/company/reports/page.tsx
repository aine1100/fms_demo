'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { Download, FileText, Loader2 } from 'lucide-react'
import { inspectionApi } from '@/lib/api/inspection'
import { extinguisherApi } from '@/lib/api/extinguisher'
import { customerApi } from '@/lib/api/customer'
import { paymentApi } from '@/lib/api/payment'

interface SummaryStats {
  totalInspections: number
  completedInspections: number
  totalEquipment: number
  activeEquipment: number
  expiredEquipment: number
  maintenanceEquipment: number
  totalCustomers: number
  totalRevenue: number
}

export default function CompanyReportsPage() {
  const [stats, setStats] = useState<SummaryStats>({
    totalInspections: 0,
    completedInspections: 0,
    totalEquipment: 0,
    activeEquipment: 0,
    expiredEquipment: 0,
    maintenanceEquipment: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [equipmentStatusData, setEquipmentStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [inspectionStatusData, setInspectionStatusData] = useState<{ name: string; completed: number; pending: number }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    try {
      const [inspRes, extRes, custRes, invoiceRes] = await Promise.allSettled([
        inspectionApi.getInspections(1, 200),
        extinguisherApi.getExtinguishers(1, 200),
        customerApi.getCustomers(1, 1),
        paymentApi.getInvoices(1, 200, { status: 'paid' }),
      ])

      if (inspRes.status === 'fulfilled' && inspRes.value.success) {
        const items = inspRes.value.data?.items ?? []
        const completed = items.filter(i => i.status === 'completed').length
        const pending = items.filter(i => i.status === 'scheduled').length

        setStats(prev => ({
          ...prev,
          totalInspections: inspRes.value.data?.total ?? items.length,
          completedInspections: completed,
        }))

        // Group by month for bar chart
        const monthMap: Record<string, { completed: number; pending: number }> = {}
        items.forEach(i => {
          const month = new Date(i.scheduledDate).toLocaleString('default', { month: 'short' })
          if (!monthMap[month]) monthMap[month] = { completed: 0, pending: 0 }
          if (i.status === 'completed') monthMap[month].completed++
          else if (i.status === 'scheduled') monthMap[month].pending++
        })
        setInspectionStatusData(
          Object.entries(monthMap).map(([month, v]) => ({ name: month, ...v }))
        )
      }

      if (extRes.status === 'fulfilled' && extRes.value.success) {
        const items = extRes.value.data?.items ?? []
        const active = items.filter(e => e.status === 'active').length
        const expired = items.filter(e => e.status === 'expired').length
        const maintenance = items.filter(e => e.status === 'maintenance').length
        const decommissioned = items.filter(e => e.status === 'decommissioned').length

        setStats(prev => ({
          ...prev,
          totalEquipment: extRes.value.data?.total ?? items.length,
          activeEquipment: active,
          expiredEquipment: expired,
          maintenanceEquipment: maintenance,
        }))
        setEquipmentStatusData([
          { name: 'Active', value: active, color: '#22c55e' },
          { name: 'Expiring/Maintenance', value: maintenance, color: '#f59e0b' },
          { name: 'Expired', value: expired, color: '#ef4444' },
          { name: 'Decommissioned', value: decommissioned, color: '#6b7280' },
        ].filter(d => d.value > 0))
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
      console.error('Reports load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReportData() }, [fetchReportData])

  const complianceRate = stats.totalEquipment > 0
    ? ((stats.activeEquipment / stats.totalEquipment) * 100).toFixed(1)
    : '0.0'

  const summaryCards = [
    { label: 'Total Inspections', value: stats.totalInspections.toString() },
    { label: 'Compliance Rate', value: `${complianceRate}%` },
    { label: 'Equipment Registered', value: stats.totalEquipment.toString() },
    { label: 'Active Customers', value: stats.totalCustomers.toString() },
  ]

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analytics and insights for your fire safety operations</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchReportData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(({ label, value }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inspections Bar Chart */}
          <Card>
            <CardHeader><CardTitle>Inspections by Month</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-80 w-full" />
              ) : inspectionStatusData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
                  No inspection data available
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectionStatusData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Scheduled" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Status Pie */}
          <Card>
            <CardHeader><CardTitle>Equipment Status Distribution</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-80 w-full" />
              ) : equipmentStatusData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
                  No equipment data available
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={equipmentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {equipmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card>
          <CardHeader><CardTitle>Revenue Summary</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue (Paid Invoices)</p>
                  <p className="text-3xl font-bold text-success">
                    ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Reports */}
        <Card>
          <CardHeader><CardTitle>Available Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Inspection Summary', description: 'Overview of all inspection activities' },
                { title: 'Equipment Inventory', description: 'Complete list of all equipment' },
                { title: 'Compliance Report', description: 'Regulatory compliance status' },
                { title: 'Customer Activity', description: 'Customer engagement metrics' },
                { title: 'Financial Summary', description: 'Revenue and billing overview' },
                { title: 'Inspector Performance', description: 'Inspector productivity metrics' },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <Button variant="link" className="h-auto p-0 mt-1 text-primary text-sm">
                      Generate Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
