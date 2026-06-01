"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { Search, Calendar, Download, Eye, FileText, CheckCircle, Clock, User } from "lucide-react"

const inspections = [
  { 
    id: "INS-001", 
    date: "2024-01-15", 
    location: "Building A - Floor 1", 
    inspector: "John Smith", 
    status: "completed" as const, 
    findings: "All equipment in good condition",
    equipmentChecked: 8,
    issues: 0
  },
  { 
    id: "INS-002", 
    date: "2024-01-20", 
    location: "Building A - Floor 3", 
    inspector: "Sarah Johnson", 
    status: "scheduled" as const, 
    findings: null,
    equipmentChecked: 0,
    issues: 0
  },
  { 
    id: "INS-003", 
    date: "2024-01-10", 
    location: "Building B - Lobby", 
    inspector: "Mike Brown", 
    status: "completed" as const, 
    findings: "1 extinguisher needs pressure recharge",
    equipmentChecked: 4,
    issues: 1
  },
  { 
    id: "INS-004", 
    date: "2024-01-22", 
    location: "Building B - Floor 1", 
    inspector: "Sarah Johnson", 
    status: "scheduled" as const, 
    findings: null,
    equipmentChecked: 0,
    issues: 0
  },
  { 
    id: "INS-005", 
    date: "2024-01-05", 
    location: "Building C - Basement", 
    inspector: "John Smith", 
    status: "completed" as const, 
    findings: "All equipment passed inspection",
    equipmentChecked: 6,
    issues: 0
  },
]

export default function CustomerInspectionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const completedInspections = inspections.filter(i => i.status === "completed")
  const scheduledInspections = inspections.filter(i => i.status === "scheduled")
  const totalIssues = completedInspections.reduce((sum, i) => sum + i.issues, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspection History</h1>
            <p className="text-muted-foreground">View all past and upcoming inspections</p>
          </div>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Inspection
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{inspections.length}</p>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{completedInspections.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{scheduledInspections.length}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{totalIssues}</p>
                <p className="text-sm text-muted-foreground">Issues Found</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Inspections</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInspections.map((inspection) => (
                <div key={inspection.id} className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 ${
                        inspection.status === "completed" ? "bg-success/10" : "bg-primary/10"
                      }`}>
                        {inspection.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <Clock className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{inspection.id}</p>
                          <StatusBadge 
                            status={inspection.status === "completed" ? "active" : "pending"} 
                            label={inspection.status} 
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{inspection.location}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {inspection.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {inspection.inspector}
                          </span>
                        </div>
                        {inspection.findings && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Findings:</span> {inspection.findings}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {inspection.status === "completed" && (
                        <div className="text-right text-sm">
                          <p><span className="text-muted-foreground">Equipment Checked:</span> {inspection.equipmentChecked}</p>
                          <p><span className="text-muted-foreground">Issues:</span> <span className={inspection.issues > 0 ? "text-warning font-medium" : "text-success"}>{inspection.issues}</span></p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        {inspection.status === "completed" && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredInspections.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No inspections found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
