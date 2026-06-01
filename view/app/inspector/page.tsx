"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard } from "@/components/shared/stats-card"
import { ClipboardCheck, Calendar, Clock, MapPin, CheckCircle, AlertTriangle, Navigation } from "lucide-react"

const todaysTasks = [
  { id: 1, customer: "ABC Corporation", location: "Building A - Floor 1", time: "09:00 AM", equipment: 8, status: "pending" as const },
  { id: 2, customer: "XYZ Industries", location: "Main Office", time: "11:30 AM", equipment: 5, status: "pending" as const },
  { id: 3, customer: "Tech Solutions", location: "Warehouse B", time: "02:00 PM", equipment: 12, status: "pending" as const },
]

const recentInspections = [
  { id: "INS-045", customer: "Metro Mall", date: "2024-01-14", equipment: 24, passed: 23, failed: 1 },
  { id: "INS-044", customer: "City Hospital", date: "2024-01-13", equipment: 45, passed: 45, failed: 0 },
  { id: "INS-043", customer: "Central Bank", date: "2024-01-12", equipment: 16, passed: 15, failed: 1 },
]

export default function InspectorDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your schedule for today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Today&apos;s Tasks"
            value="3"
            icon={ClipboardCheck}
            description="Inspections scheduled"
          />
          <StatsCard
            title="This Week"
            value="12"
            icon={Calendar}
            trend={{ value: 3, isPositive: true }}
            description="Total inspections"
          />
          <StatsCard
            title="Completed"
            value="156"
            icon={CheckCircle}
            description="This month"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Pass Rate"
            value="97.2%"
            icon={AlertTriangle}
            trend={{ value: 1.5, isPositive: true }}
            description="Equipment passed"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <Button size="sm" variant="outline">View Full Schedule</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <div key={task.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{task.customer}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {task.location}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.time}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <ClipboardCheck className="h-3 w-3" />
                              {task.equipment} items
                            </span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={task.status} label="Scheduled" />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="flex-1">Start Inspection</Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Navigation className="h-4 w-4" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Inspections</CardTitle>
              <Button size="sm" variant="outline">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{inspection.id}</p>
                        {inspection.failed === 0 ? (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">All Passed</span>
                        ) : (
                          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">{inspection.failed} Failed</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{inspection.customer}</p>
                      <p className="text-xs text-muted-foreground">{inspection.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">{inspection.passed}</p>
                      <p className="text-xs text-muted-foreground">of {inspection.equipment} passed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <ClipboardCheck className="h-6 w-6" />
                <span>New Inspection</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Calendar className="h-6 w-6" />
                <span>My Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <AlertTriangle className="h-6 w-6" />
                <span>Report Issue</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <CheckCircle className="h-6 w-6" />
                <span>View History</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
