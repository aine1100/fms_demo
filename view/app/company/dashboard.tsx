'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard } from "@/components/shared/stats-card"
import { useAuth } from '@/hooks/useAuth'
import { extinguisherApi } from '@/lib/api/extinguisher'
import { inspectionApi } from '@/lib/api/inspection'
import { paymentApi } from '@/lib/api/payment'
import { Package, CheckCircle, AlertTriangle, DollarSign, Loader2 } from "lucide-react"
import Link from 'next/link'

export default function CompanyDashboardIntegrated() {
  const { user, isAuthenticated } = useAuth()
  const [inventory, setInventory] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalInventory: 0,
    activeCount: 0,
    expiredCount: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch inventory
        const invRes = await extinguisherApi.getExtinguishers(1, 100)
        if (invRes.success) {
          const items = invRes.data?.items ?? []
          setInventory(items)
          
          const active = items.filter((i: any) => i.status === 'active').length
          const expired = items.filter((i: any) => i.status === 'expired').length

          setStats(prev => ({
            ...prev,
            totalInventory: invRes.data?.total ?? items.length,
            activeCount: active,
            expiredCount: expired,
          }))
        }

        // Fetch inspections
        const inspecRes = await inspectionApi.getInspections(50, 0)
        if (inspecRes.success) {
          setInspections(inspecRes.data?.items || [])
        }

        // Fetch invoices and calculate revenue
        const invoiceRes = await paymentApi.getInvoices(1, 100, { status: 'paid' })
        if (invoiceRes.success) {
          setInvoices(invoiceRes.data?.items || [])
          const totalRevenue = (invoiceRes.data?.items || []).reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || 0), 0)
          setStats(prev => ({
            ...prev,
            totalRevenue,
          }))
        }
      } catch (error) {
        console.error('Failed to load company dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  if (loading) {
    return (
      <DashboardLayout requiredRole="company">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory, inspections, and revenue</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Inventory"
            value={stats.totalInventory}
            icon={Package}
            description="Registered extinguishers"
          />
          <StatsCard
            title="Active"
            value={stats.activeCount}
            icon={CheckCircle}
            trend={{ value: 5, isPositive: true }}
            description="In service"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Expired"
            value={stats.expiredCount}
            icon={AlertTriangle}
            description="Need attention"
            className="border-l-4 border-l-destructive"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            description="From payments"
            className="border-l-4 border-l-success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory Overview</CardTitle>
              <Link href="/company/inventory">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.serialNumber}</p>
                      <p className="text-sm text-muted-foreground">{item.type} - {item.capacity}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Inspections</CardTitle>
              <Link href="/company/inspections">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.slice(0, 5).map((insp) => (
                  <div key={insp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Inspection #{insp.id}</p>
                      <p className="text-sm text-muted-foreground">{insp.location}</p>
                    </div>
                    <StatusBadge status={insp.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Revenue</CardTitle>
            <Link href="/company/payments">
              <Button variant="outline" size="sm">All Payments</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.slice(0, 5).map((inv) => (
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
    </DashboardLayout>
  )
}
