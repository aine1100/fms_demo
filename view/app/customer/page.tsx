"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard } from "@/components/shared/stats-card"
import { FireExtinguisher, AlertTriangle, CheckCircle, Clock, Calendar, FileText, Bell } from "lucide-react"

const recentActivity = [
  { id: 1, action: "Inspection completed", location: "Building A - Floor 2", date: "2024-01-15", type: "inspection" },
  { id: 2, action: "Extinguisher replaced", location: "Building B - Lobby", date: "2024-01-14", type: "replacement" },
  { id: 3, action: "Maintenance scheduled", location: "Building A - Floor 1", date: "2024-01-13", type: "maintenance" },
  { id: 4, action: "Certificate renewed", location: "All Buildings", date: "2024-01-12", type: "certificate" },
]

const upcomingInspections = [
  { id: 1, location: "Building A - Floor 3", date: "2024-01-20", inspector: "John Smith" },
  { id: 2, location: "Building B - Floor 1", date: "2024-01-22", inspector: "Sarah Johnson" },
  { id: 3, location: "Building C - Basement", date: "2024-01-25", inspector: "Mike Brown" },
]

const alerts = [
  { id: 1, message: "3 extinguishers expiring within 30 days", severity: "warning" },
  { id: 2, message: "Annual inspection due for Building A", severity: "info" },
]

export default function CustomerDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your fire safety overview.</p>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 rounded-lg p-4 ${
                  alert.severity === "warning" ? "bg-warning/10 border border-warning/20" : "bg-primary/10 border border-primary/20"
                }`}
              >
                <Bell className={`h-5 w-5 ${alert.severity === "warning" ? "text-warning" : "text-primary"}`} />
                <span className="text-sm font-medium">{alert.message}</span>
                <Button variant="ghost" size="sm" className="ml-auto">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Extinguishers"
            value="24"
            icon={FireExtinguisher}
            description="Across all locations"
          />
          <StatsCard
            title="Active"
            value="21"
            icon={CheckCircle}
            trend={{ value: 2, isPositive: true }}
            description="In compliance"
            className="border-l-4 border-l-success"
          />
          <StatsCard
            title="Expiring Soon"
            value="3"
            icon={AlertTriangle}
            description="Within 30 days"
            className="border-l-4 border-l-warning"
          />
          <StatsCard
            title="Next Inspection"
            value="5 days"
            icon={Clock}
            description="Building A - Floor 3"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`mt-1 rounded-full p-2 ${
                      activity.type === "inspection" ? "bg-success/10" :
                      activity.type === "replacement" ? "bg-primary/10" :
                      activity.type === "maintenance" ? "bg-warning/10" :
                      "bg-muted"
                    }`}>
                      {activity.type === "inspection" ? <CheckCircle className="h-4 w-4 text-success" /> :
                       activity.type === "replacement" ? <FireExtinguisher className="h-4 w-4 text-primary" /> :
                       activity.type === "maintenance" ? <Clock className="h-4 w-4 text-warning" /> :
                       <FileText className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.location}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Inspections</CardTitle>
              <Button variant="ghost" size="sm">Schedule New</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{inspection.location}</p>
                      <p className="text-sm text-muted-foreground">Inspector: {inspection.inspector}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{inspection.date}</p>
                      <StatusBadge status="active" label="Scheduled" />
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
                <FileText className="h-6 w-6" />
                <span>Request Service</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Calendar className="h-6 w-6" />
                <span>Schedule Inspection</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <FireExtinguisher className="h-6 w-6" />
                <span>View Equipment</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Bell className="h-6 w-6" />
                <span>Manage Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
