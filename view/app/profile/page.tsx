"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Building2, Calendar, Award, Shield, Camera, Save, Clock } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const userProfile = {
    name: "John Smith",
    email: "john.smith@firesafe.com",
    phone: "+1 (555) 987-6543",
    role: "Senior Inspector",
    company: "FireSafe Solutions Inc.",
    address: "456 Inspector Lane, New York, NY 10002",
    joinDate: "January 2022",
    employeeId: "EMP-2024-0042",
    certifications: [
      { name: "NFPA Fire Extinguisher Certification", expiry: "2026-06-15" },
      { name: "Fire Safety Professional", expiry: "2025-03-20" },
    ],
    stats: {
      inspections: 156,
      passRate: 97.2,
      equipmentChecked: 1420,
      customersServed: 45,
    },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl">JS</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-muted-foreground">{userProfile.role}</p>
                  <Badge className="mt-2">{userProfile.company}</Badge>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {userProfile.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProfile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-success/10 p-1.5">
                      <Award className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">Expires: {cert.expiry}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{userProfile.stats.inspections}</p>
                    <p className="text-sm text-muted-foreground">Total Inspections</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">{userProfile.stats.passRate}%</p>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{userProfile.stats.equipmentChecked}</p>
                    <p className="text-sm text-muted-foreground">Equipment Checked</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{userProfile.stats.customersServed}</p>
                    <p className="text-sm text-muted-foreground">Customers Served</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Smith" disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue={userProfile.email} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={userProfile.phone} disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue={userProfile.address} disabled={!isEditing} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input id="employeeId" defaultValue={userProfile.employeeId} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={userProfile.role} disabled />
                  </div>
                </div>
                {isEditing && (
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Completed inspection at ABC Corporation", time: "2 hours ago" },
                    { action: "Submitted report for Metro Mall", time: "Yesterday" },
                    { action: "Updated profile information", time: "2 days ago" },
                    { action: "Completed OSHA training module", time: "1 week ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="rounded-full bg-muted p-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
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
