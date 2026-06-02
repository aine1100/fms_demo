'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard } from "@/components/shared/stats-card"
import { useAuth } from '@/hooks/useAuth'
import { customerApi } from '@/lib/api/customer'
import { FireExtinguisher, AlertTriangle, CheckCircle, Clock, Calendar, FileText, Bell, Loader2 } from "lucide-react"

export default function CustomerDashboardIntegrated() {
  const { user, isAuthenticated } = useAuth()
  const [extinguishers, setExtinguishers] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch extinguishers
        const extRes = await customerApi.getMyExtinguishers()
        if (extRes.success) {
          const exts = extRes.data?.items || []
          setExtinguishers(exts)
          
          const active = exts.filter((e: any) => e.status === 'active').length
          const expiring = exts.filter((e: any) => {
            const daysUntilExpiry = Math.floor((new Date(e.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0
          }).length

          setStats({
            total: exts.length,
            active,
            expiringSoon: expiring,
          })
        }

        // Fetch alerts
        const alertRes = await customerApi.getAlerts()
        if (alertRes.success) {
          setAlerts(alertRes.data?.items || [])
        }

        // Fetch inspection history
        const inspecRes = await customerApi.getInspectionHistory(5, 0)
        if (inspecRes.success) {
          setInspections(inspecRes.data?.items || [])
        }

        // Fetch invoices
        const invoiceRes = await customerApi.getInvoices(5, 0)
        if (invoiceRes.success) {
          setInvoices(invoiceRes.data?.items || [])
        }
      } catch (error) {
        console.error('Failed to load customer dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your fire safety overview.</p>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-lg p-4 ${
                  alert.severity === "warning" ? "bg-warning/10 border border-warning/20" : "bg-primary/10 border border-primary/20"
                }`}
              >
                <Bell className={`h-5 w-5 ${alert.severity === "warning" ? "text-warning" : "text-primary"}`} />
                <span className="text-sm font-medium">{alert.message}</span>
                <Button variant="ghost" size="sm" className="ml-auto">View</Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Extinguishers"
            value={stats.total}
            icon={FireExtinguisher}
            description="Across all locations"
          />
          <StatsCard
            title="Active"
            value={stats.active}
            icon={CheckCircle}
            trend={{ value: 2, isPositive: true }}
            description="In compliance"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            icon={AlertTriangle}
            description="Within 30 days"
            className="border-l-4 border-l-warning"
          />
          <StatsCard
            title="Next Inspection"
            value={inspections.length > 0 ? "Soon" : "None"}
            icon={Clock}
            description={inspections.length > 0 ? `${inspections[0].location}` : "Schedule one"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Extinguishers</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {extinguishers.slice(0, 3).map((ext) => (
                  <div key={ext.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{ext.serialNumber}</p>
                      <p className="text-sm text-muted-foreground">{ext.location}</p>
                    </div>
                    <StatusBadge status={ext.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Invoice #{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">${inv.totalAmount}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
