"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { Search, Calendar, Download, Eye, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const inspectionHistory = [
  { 
    id: "INS-050", 
    customer: "ABC Corporation", 
    location: "Building A", 
    date: "2024-01-15", 
    equipment: 8, 
    passed: 7, 
    failed: 1, 
    status: "completed" as const 
  },
  { 
    id: "INS-049", 
    customer: "XYZ Industries", 
    location: "Main Office", 
    date: "2024-01-14", 
    equipment: 5, 
    passed: 5, 
    failed: 0, 
    status: "completed" as const 
  },
  { 
    id: "INS-048", 
    customer: "Tech Solutions", 
    location: "Warehouse B", 
    date: "2024-01-13", 
    equipment: 12, 
    passed: 11, 
    failed: 1, 
    status: "completed" as const 
  },
  { 
    id: "INS-047", 
    customer: "Metro Mall", 
    location: "Ground Floor", 
    date: "2024-01-12", 
    equipment: 24, 
    passed: 24, 
    failed: 0, 
    status: "completed" as const 
  },
  { 
    id: "INS-046", 
    customer: "City Hospital", 
    location: "Emergency Wing", 
    date: "2024-01-11", 
    equipment: 18, 
    passed: 16, 
    failed: 2, 
    status: "completed" as const 
  },
  { 
    id: "INS-045", 
    customer: "Central Bank", 
    location: "HQ Building", 
    date: "2024-01-10", 
    equipment: 16, 
    passed: 16, 
    failed: 0, 
    status: "completed" as const 
  },
]

export default function InspectorHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredHistory = inspectionHistory.filter((inspection) => {
    const matchesSearch = inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalInspections = inspectionHistory.length
  const totalEquipment = inspectionHistory.reduce((sum, i) => sum + i.equipment, 0)
  const totalPassed = inspectionHistory.reduce((sum, i) => sum + i.passed, 0)
  const totalFailed = inspectionHistory.reduce((sum, i) => sum + i.failed, 0)
  const passRate = ((totalPassed / totalEquipment) * 100).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspection History</h1>
            <p className="text-muted-foreground">View all your completed inspections</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export History
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalInspections}</p>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{totalEquipment}</p>
                <p className="text-sm text-muted-foreground">Equipment Checked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{passRate}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{totalFailed}</p>
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
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHistory.map((inspection) => (
                <div key={inspection.id} className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 ${
                        inspection.failed === 0 ? "bg-success/10" : "bg-warning/10"
                      }`}>
                        {inspection.failed === 0 ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{inspection.id}</p>
                          {inspection.failed === 0 ? (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">All Passed</span>
                          ) : (
                            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">{inspection.failed} Failed</span>
                          )}
                        </div>
                        <p className="text-sm font-medium">{inspection.customer}</p>
                        <p className="text-sm text-muted-foreground">{inspection.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {inspection.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{inspection.equipment}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-success">{inspection.passed}</p>
                          <p className="text-xs text-muted-foreground">Passed</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-medium ${inspection.failed > 0 ? "text-warning" : "text-muted-foreground"}`}>{inspection.failed}</p>
                          <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
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
