'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { mockCompanies, mockInspections } from '@/lib/mock-data'
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

const monthlyData = [
  { month: 'Jan', inspections: 120, companies: 45 },
  { month: 'Feb', inspections: 145, companies: 52 },
  { month: 'Mar', inspections: 160, companies: 58 },
  { month: 'Apr', inspections: 180, companies: 65 },
  { month: 'May', inspections: 210, companies: 72 },
  { month: 'Jun', inspections: 195, companies: 78 },
]

const complianceData = [
  { name: 'Compliant', value: 85 },
  { name: 'Non-Compliant', value: 10 },
  { name: 'Pending', value: 5 },
]

export default function AdminDashboard() {
  const pendingApprovals = mockCompanies.filter(c => !c.isActive).length
  const activeInspectors = 15
  const pendingInspections = mockInspections.filter(i => i.status === 'scheduled').length
  const overdueCount = 23

  return (
    <DashboardLayout requiredRole="super_admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is an overview of the system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Companies"
            value={mockCompanies.length}
            icon={<Building2 className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Active Inspectors"
            value={activeInspectors}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 5, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Pending Inspections"
            value={pendingInspections}
            icon={<ClipboardCheck className="h-6 w-6" />}
            trend={{ value: 8, isPositive: false }}
            description="vs last month"
          />
          <StatsCard
            title="Overdue Items"
            value={overdueCount}
            icon={<AlertTriangle className="h-6 w-6" />}
            trend={{ value: 3, isPositive: false }}
            description="needs attention"
            iconClassName="bg-destructive/10 text-destructive"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inspections Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inspections Trend</CardTitle>
              <CardDescription>Monthly inspection completions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inspections" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Growth</CardTitle>
              <CardDescription>New company registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="companies" 
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Pending Approvals */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Company Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <CardDescription>Companies awaiting approval</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/companies">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCompanies.slice(0, 4).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={company.isActive ? 'active' : 'pending'} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Overview</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                    <span className="font-medium text-sm">System Status</span>
                  </div>
                  <span className="text-sm text-success">Operational</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">840</p>
                    <p className="text-xs text-muted-foreground">Total Extinguishers</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">98.5%</p>
                    <p className="text-xs text-muted-foreground">Compliance Rate</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">$24.5K</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-muted-foreground">Monthly growth</span>
                  </div>
                  <span className="text-sm font-medium text-success">+12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
