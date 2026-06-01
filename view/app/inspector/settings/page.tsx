"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, Award, Save, Mail, Phone, MapPin, Camera } from "lucide-react"

export default function InspectorSettingsPage() {
  const [notifications, setNotifications] = useState({
    newAssignments: true,
    scheduleChanges: true,
    reminders: true,
    completionConfirmation: true,
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certifications</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" className="pl-10" defaultValue="john.smith@firesafe.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone" className="pl-10" defaultValue="+1 (555) 987-6543" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" className="pl-10" defaultValue="456 Inspector Lane, New York, NY 10002" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" defaultValue="EMP-2024-0042" disabled />
                </div>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Certifications</CardTitle>
                <Button size="sm">Add Certification</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Fire Extinguisher Inspection Certification", issuer: "NFPA", date: "2023-06-15", expiry: "2026-06-15", status: "active" },
                  { name: "Fire Safety Professional", issuer: "National Fire Academy", date: "2022-03-20", expiry: "2025-03-20", status: "active" },
                  { name: "OSHA Safety Training", issuer: "OSHA", date: "2023-09-10", expiry: "2024-09-10", status: "expiring" },
                ].map((cert, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-2 ${
                        cert.status === "active" ? "bg-success/10" : "bg-warning/10"
                      }`}>
                        <Award className={`h-5 w-5 ${
                          cert.status === "active" ? "text-success" : "text-warning"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                        <p className="text-xs text-muted-foreground">
                          Valid: {cert.date} - {cert.expiry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cert.status === "active" ? (
                        <span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">Active</span>
                      ) : (
                        <span className="rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">Expiring Soon</span>
                      )}
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Assignments</Label>
                    <p className="text-sm text-muted-foreground">Get notified when assigned new inspections</p>
                  </div>
                  <Switch
                    checked={notifications.newAssignments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newAssignments: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Schedule Changes</Label>
                    <p className="text-sm text-muted-foreground">Get notified about schedule modifications</p>
                  </div>
                  <Switch
                    checked={notifications.scheduleChanges}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, scheduleChanges: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Receive reminders before scheduled inspections</p>
                  </div>
                  <Switch
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Completion Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Get confirmation when reports are submitted</p>
                  </div>
                  <Switch
                    checked={notifications.completionConfirmation}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, completionConfirmation: checked })}
                  />
                </div>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button className="gap-2">
                  <Shield className="h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
