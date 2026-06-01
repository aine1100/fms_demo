'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api/auth'
import { inspectionApi } from '@/lib/api/inspection'
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeInspectors: 0,
    pendingInspections: 0,
    overdueItems: 0,
  })
  const [companies, setCompanies] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch companies
        const companiesRes = await authApi.getAllCompanies(100, 0)
        if (companiesRes.success) {
          setCompanies(companiesRes.data?.items || [])
          setStats(prev => ({
            ...prev,
            totalCompanies: companiesRes.data?.total || 0,
            activeInspectors: companiesRes.data?.items?.length || 0, // placeholder
          }))
        }

        // Fetch inspections
        const inspectionsRes = await inspectionApi.getInspections(100, 0)
        if (inspectionsRes.success) {
          setInspections(inspectionsRes.data?.items || [])
          const pending = inspectionsRes.data?.items?.filter((i: any) => i.status === 'scheduled').length || 0
          const overdue = inspectionsRes.data?.items?.filter((i: any) => new Date(i.completedDate) < new Date() && i.status !== 'completed').length || 0
          setStats(prev => ({
            ...prev,
            pendingInspections: pending,
            overdueItems: overdue,
          }))
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  if (loading) {
    return (
      <DashboardLayout requiredRole="super_admin">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="super_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
            description="Active companies"
          />
          <StatsCard
            title="Pending Approvals"
            value={companies.filter(c => !c.isActive).length}
            icon={Users}
            trend={{ value: companies.filter(c => !c.isActive).length > 5 ? -5 : 2, isPositive: companies.filter(c => !c.isActive).length <= 5 }}
            description="Awaiting review"
          />
          <StatsCard
            title="Pending Inspections"
            value={stats.pendingInspections}
            icon={ClipboardCheck}
            trend={{ value: 8, isPositive: false }}
            description="Scheduled soon"
          />
          <StatsCard
            title="Overdue Items"
            value={stats.overdueItems}
            icon={AlertTriangle}
            trend={{ value: 3, isPositive: false }}
            description="Needs attention"
            className="border-l-4 border-l-destructive"
          />
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Companies</CardTitle>
              <CardDescription>Recent company registrations</CardDescription>
            </div>
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={company.isActive ? 'active' : 'inactive'} />
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inspections */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inspections</CardTitle>
            <CardDescription>Latest inspection activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspections.slice(0, 5).map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">Inspection #{inspection.id}</p>
                    <p className="text-sm text-muted-foreground">{inspection.location || 'N/A'}</p>
                  </div>
                  <StatusBadge status={inspection.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
