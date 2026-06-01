"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { FireExtinguisher, Search, Filter, MapPin, Calendar, Eye, QrCode, Download } from "lucide-react"

const equipment = [
  { id: "EXT-001", type: "ABC Dry Chemical", location: "Building A - Floor 1", lastInspection: "2024-01-10", nextInspection: "2024-07-10", expiryDate: "2025-01-10", status: "active" as const },
  { id: "EXT-002", type: "CO2", location: "Building A - Floor 2", lastInspection: "2024-01-08", nextInspection: "2024-07-08", expiryDate: "2024-02-15", status: "expiring" as const },
  { id: "EXT-003", type: "Water", location: "Building A - Floor 3", lastInspection: "2024-01-05", nextInspection: "2024-07-05", expiryDate: "2025-03-20", status: "active" as const },
  { id: "EXT-004", type: "ABC Dry Chemical", location: "Building B - Lobby", lastInspection: "2023-12-20", nextInspection: "2024-06-20", expiryDate: "2024-01-20", status: "expired" as const },
  { id: "EXT-005", type: "Foam", location: "Building B - Floor 1", lastInspection: "2024-01-12", nextInspection: "2024-07-12", expiryDate: "2025-06-15", status: "active" as const },
  { id: "EXT-006", type: "ABC Dry Chemical", location: "Building C - Basement", lastInspection: "2024-01-11", nextInspection: "2024-07-11", expiryDate: "2024-02-28", status: "expiring" as const },
]

export default function CustomerEquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState<typeof equipment[0] | null>(null)

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesLocation = locationFilter === "all" || item.location.includes(locationFilter)
    return matchesSearch && matchesStatus && matchesLocation
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Equipment</h1>
            <p className="text-muted-foreground">View and track all your fire safety equipment</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export List
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{equipment.length}</p>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{equipment.filter(e => e.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{equipment.filter(e => e.status === "expiring").length}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{equipment.filter(e => e.status === "expired").length}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Equipment List</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring">Expiring</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-40">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Building A">Building A</SelectItem>
                    <SelectItem value="Building B">Building B</SelectItem>
                    <SelectItem value="Building C">Building C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        item.status === "active" ? "bg-success/10" :
                        item.status === "expiring" ? "bg-warning/10" :
                        "bg-destructive/10"
                      }`}>
                        <FireExtinguisher className={`h-5 w-5 ${
                          item.status === "active" ? "text-success" :
                          item.status === "expiring" ? "text-warning" :
                          "text-destructive"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{item.id}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Next: {item.nextInspection}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setSelectedEquipment(item)}>
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Equipment Details - {item.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <div className="rounded-full bg-primary/10 p-6">
                              <FireExtinguisher className="h-12 w-12 text-primary" />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Type</p>
                              <p className="font-medium">{item.type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <StatusBadge status={item.status} />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-medium">{item.location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Expiry Date</p>
                              <p className="font-medium">{item.expiryDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Last Inspection</p>
                              <p className="font-medium">{item.lastInspection}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Next Inspection</p>
                              <p className="font-medium">{item.nextInspection}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">Request Service</Button>
                            <Button variant="outline" className="flex-1">View History</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="gap-1">
                      <QrCode className="h-4 w-4" />
                      QR
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEquipment.length === 0 && (
              <div className="py-12 text-center">
                <FireExtinguisher className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No equipment found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
