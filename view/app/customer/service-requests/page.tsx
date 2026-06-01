"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { Plus, Search, Calendar, Clock, MapPin, User, FileText, CheckCircle, AlertCircle, XCircle } from "lucide-react"

const serviceRequests = [
  { id: "SR-001", type: "Inspection", location: "Building A - Floor 1", status: "completed" as const, date: "2024-01-15", description: "Routine monthly inspection" },
  { id: "SR-002", type: "Repair", location: "Building B - Lobby", status: "in-progress" as const, date: "2024-01-14", description: "Pressure gauge replacement" },
  { id: "SR-003", type: "Replacement", location: "Building A - Floor 2", status: "pending" as const, date: "2024-01-13", description: "Expired extinguisher replacement" },
  { id: "SR-004", type: "Emergency", location: "Building C - Basement", status: "completed" as const, date: "2024-01-10", description: "Emergency service call" },
  { id: "SR-005", type: "Maintenance", location: "Building B - Floor 1", status: "cancelled" as const, date: "2024-01-08", description: "Scheduled maintenance" },
]

const requestTypes = [
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Repair" },
  { value: "replacement", label: "Replacement" },
  { value: "maintenance", label: "Maintenance" },
  { value: "emergency", label: "Emergency Service" },
]

export default function CustomerServiceRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    type: "",
    location: "",
    description: "",
    preferredDate: "",
  })

  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-primary" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-warning" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const handleSubmitRequest = () => {
    // In a real app, this would submit to an API
    setIsDialogOpen(false)
    setNewRequest({ type: "", location: "", description: "", preferredDate: "" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
            <p className="text-muted-foreground">Track and manage your service requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Service Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Request Type</Label>
                  <Select value={newRequest.type} onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={newRequest.location} onValueChange={(value) => setNewRequest({ ...newRequest, location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="building-a">Building A</SelectItem>
                      <SelectItem value="building-b">Building B</SelectItem>
                      <SelectItem value="building-c">Building C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={newRequest.preferredDate}
                    onChange={(e) => setNewRequest({ ...newRequest, preferredDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your request..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSubmitRequest}>
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{serviceRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{serviceRequests.filter(r => r.status === "pending").length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{serviceRequests.filter(r => r.status === "in-progress").length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{serviceRequests.filter(r => r.status === "completed").length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Request History</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.id}</p>
                        <StatusBadge 
                          status={request.status === "completed" ? "active" : request.status === "in-progress" ? "pending" : request.status === "pending" ? "expiring" : "inactive"} 
                          label={request.status.replace("-", " ")} 
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{request.type} - {request.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {request.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {request.status === "pending" && (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No requests found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or create a new request</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
