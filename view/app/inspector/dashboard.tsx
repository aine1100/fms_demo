'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard } from "@/components/shared/stats-card"
import { useAuth } from '@/hooks/useAuth'
import { inspectionApi } from '@/lib/api/inspection'
import { CheckCircle, Clock, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import Link from 'next/link'

export default function InspectorDashboardIntegrated() {
  const { user, isAuthenticated } = useAuth()
  const [inspections, setInspections] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCompleted: 0,
    scheduled: 0,
    inProgress: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch inspections for this inspector
        const inspecRes = await inspectionApi.getInspectionsByInspector(user.id, 100, 0)
        if (inspecRes.success) {
          const items = inspecRes.data?.items || []
          setInspections(items)

          const completed = items.filter((i: any) => i.status === 'completed').length
          const scheduled = items.filter((i: any) => i.status === 'scheduled').length
          const inProgress = items.filter((i: any) => i.status === 'in_progress').length
          const completionRate = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

          setStats({
            totalCompleted: completed,
            scheduled,
            inProgress,
            completionRate,
          })
        }
      } catch (error) {
        console.error('Failed to load inspector dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user?.id])

  if (loading) {
    return (
      <DashboardLayout requiredRole="inspector">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="inspector">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspector Dashboard</h1>
          <p className="text-muted-foreground">Your inspection queue and performance metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Completed"
            value={stats.totalCompleted}
            icon={CheckCircle}
            description="Inspections finished"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Scheduled"
            value={stats.scheduled}
            icon={Clock}
            description="Awaiting your action"
            className="border-l-4 border-l-warning"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={AlertCircle}
            description="Currently working on"
            className="border-l-4 border-l-primary"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            description="Performance metric"
            className="border-l-4 border-l-success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Inspections Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Queue</CardTitle>
              <Button size="sm">Refresh</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections
                  .filter(i => i.status === 'scheduled' || i.status === 'in_progress')
                  .slice(0, 5)
                  .map((insp) => (
                    <div key={insp.id} className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">Inspection #{insp.id}</p>
                          <p className="text-sm text-muted-foreground">{insp.location}</p>
                        </div>
                        <StatusBadge status={insp.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Scheduled: {new Date(insp.scheduledDate).toLocaleDateString()}
                      </p>
                      <Link href={`/inspector/inspections/${insp.id}`}>
                        <Button size="sm" className="w-full">Start Inspection</Button>
                      </Link>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Completions</CardTitle>
              <Link href="/inspector/history">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections
                  .filter(i => i.status === 'completed')
                  .slice(0, 5)
                  .map((insp) => (
                    <div key={insp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Inspection #{insp.id}</p>
                        <p className="text-sm text-muted-foreground">{insp.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(insp.completedDate).toLocaleDateString()}
                        </p>
                        <StatusBadge status={insp.result || 'passed'} />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/inspector/inspections">
                <Button variant="outline" className="w-full">View Queue</Button>
              </Link>
              <Link href="/inspector/inspections/new">
                <Button className="w-full">Start New Inspection</Button>
              </Link>
              <Link href="/inspector/reports">
                <Button variant="outline" className="w-full">View Reports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
