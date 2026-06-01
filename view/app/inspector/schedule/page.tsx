"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, ClipboardCheck, Navigation, User } from "lucide-react"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const currentWeek = [
  { day: "Mon", date: 15, inspections: 3 },
  { day: "Tue", date: 16, inspections: 2 },
  { day: "Wed", date: 17, inspections: 4 },
  { day: "Thu", date: 18, inspections: 1 },
  { day: "Fri", date: 19, inspections: 3 },
  { day: "Sat", date: 20, inspections: 0 },
  { day: "Sun", date: 21, inspections: 0 },
]

const scheduleData = [
  { id: 1, customer: "ABC Corporation", location: "Building A - Floor 1", time: "09:00 AM", date: "2024-01-15", equipment: 8, status: "completed" as const, contact: "John Doe" },
  { id: 2, customer: "XYZ Industries", location: "Main Office", time: "11:30 AM", date: "2024-01-15", equipment: 5, status: "in-progress" as const, contact: "Jane Smith" },
  { id: 3, customer: "Tech Solutions", location: "Warehouse B", time: "02:00 PM", date: "2024-01-15", equipment: 12, status: "pending" as const, contact: "Mike Johnson" },
  { id: 4, customer: "Metro Mall", location: "Ground Floor", time: "09:30 AM", date: "2024-01-16", equipment: 24, status: "pending" as const, contact: "Sarah Wilson" },
  { id: 5, customer: "City Hospital", location: "Emergency Wing", time: "01:00 PM", date: "2024-01-16", equipment: 18, status: "pending" as const, contact: "Dr. Brown" },
]

export default function InspectorSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(15)
  const [viewMode, setViewMode] = useState("day")

  const filteredSchedule = scheduleData.filter(item => {
    const itemDate = new Date(item.date).getDate()
    return itemDate === selectedDate
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
            <p className="text-muted-foreground">View and manage your inspection schedule</p>
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>January 2024</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">Today</Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {currentWeek.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center rounded-lg p-3 transition-colors ${
                    selectedDate === day.date
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-medium">{day.day}</span>
                  <span className="text-lg font-bold">{day.date}</span>
                  {day.inspections > 0 && (
                    <span className={`mt-1 text-xs ${selectedDate === day.date ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {day.inspections} tasks
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Inspections for January {selectedDate}, 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSchedule.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSchedule.map((task) => (
                      <div key={task.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.customer}</p>
                              <StatusBadge 
                                status={task.status === "completed" ? "active" : task.status === "in-progress" ? "pending" : "expiring"} 
                                label={task.status.replace("-", " ")} 
                              />
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {task.location}
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {task.time}
                              </p>
                              <p className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Contact: {task.contact}
                              </p>
                              <p className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" />
                                {task.equipment} equipment to inspect
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {task.status === "pending" && (
                            <Button size="sm" className="flex-1">Start Inspection</Button>
                          )}
                          {task.status === "in-progress" && (
                            <Button size="sm" className="flex-1">Continue</Button>
                          )}
                          {task.status === "completed" && (
                            <Button size="sm" variant="outline" className="flex-1">View Report</Button>
                          )}
                          <Button size="sm" variant="outline" className="gap-1">
                            <Navigation className="h-4 w-4" />
                            Navigate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No inspections scheduled</p>
                    <p className="text-sm text-muted-foreground">You have no tasks for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Week Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Inspections</span>
                    <span className="font-medium">13</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-success">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-primary">5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Equipment to Check</span>
                    <span className="font-medium">89</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. per Day</span>
                    <span className="font-medium">2.6</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduleData.slice(3, 5).map((task) => (
                    <div key={task.id} className="rounded-lg bg-muted/50 p-3">
                      <p className="font-medium text-sm">{task.customer}</p>
                      <p className="text-xs text-muted-foreground">{task.date} at {task.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
