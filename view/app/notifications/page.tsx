"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, AlertTriangle, Info, Clock, X, Settings, Check } from "lucide-react"

const notifications = [
  { id: 1, type: "warning", title: "Equipment Expiring Soon", message: "3 fire extinguishers at Building A will expire within 30 days", time: "5 min ago", read: false },
  { id: 2, type: "info", title: "Inspection Scheduled", message: "New inspection scheduled for Building B on Jan 20, 2024", time: "1 hour ago", read: false },
  { id: 3, type: "success", title: "Inspection Completed", message: "Monthly inspection for ABC Corporation completed successfully", time: "2 hours ago", read: false },
  { id: 4, type: "warning", title: "Service Request Pending", message: "Service request SR-003 requires your attention", time: "3 hours ago", read: true },
  { id: 5, type: "info", title: "New Customer Added", message: "Tech Solutions has been added to your customer list", time: "Yesterday", read: true },
  { id: 6, type: "success", title: "Report Generated", message: "Monthly compliance report is ready for download", time: "Yesterday", read: true },
  { id: 7, type: "warning", title: "Certificate Expiring", message: "Your NFPA certification expires in 60 days", time: "2 days ago", read: true },
]

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [filter, setFilter] = useState("all")

  const unreadCount = notificationList.filter(n => !n.read).length

  const filteredNotifications = notificationList.filter(n => {
    if (filter === "unread") return !n.read
    if (filter === "warning") return n.type === "warning"
    if (filter === "info") return n.type === "info"
    if (filter === "success") return n.type === "success"
    return true
  })

  const markAsRead = (id: number) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationList(notificationList.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "info":
        return <Info className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                <Check className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {notificationList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <Card>
              <CardContent className="p-0">
                {filteredNotifications.length > 0 ? (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className={`rounded-full p-2 ${
                          notification.type === "warning" ? "bg-warning/10" :
                          notification.type === "success" ? "bg-success/10" :
                          "bg-primary/10"
                        }`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {filter === "unread" ? "You&apos;ve read all your notifications" : "No notifications in this category"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
