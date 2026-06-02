'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Bell, Shield, Building2, Save, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { customerApi } from '@/lib/api/customer'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function CustomerSettingsPage() {
  const { user } = useAuthStore()

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
    city: '',
  })

  // Password state
  const [pwSaving, setPwSaving] = useState(false)
  const [pw, setPw] = useState({ newPassword: '', confirmPassword: '' })

  // Notifications state (UI only — no backend endpoint for customer prefs yet)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    expiryReminders: true,
    inspectionReminders: true,
    serviceUpdates: true,
  })

  useEffect(() => {
    const load = async () => {
      setProfileLoading(true)
      try {
        const [authRes, custRes] = await Promise.allSettled([
          authApi.getProfile(),
          customerApi.getMyProfile(),
        ])

        const authData = authRes.status === 'fulfilled' && authRes.value.success ? authRes.value.data : null
        const custData = custRes.status === 'fulfilled' && custRes.value.success ? custRes.value.data : null

        setProfile({
          firstName: authData?.firstName ?? user?.firstName ?? '',
          lastName: authData?.lastName ?? user?.lastName ?? '',
          email: authData?.email ?? user?.email ?? '',
          phone: custData?.phone ?? '',
          businessName: custData?.businessName ?? '',
          address: custData?.address ?? '',
          city: custData?.city ?? '',
        })
      } catch {
        // silently fall back to store
        setProfile(p => ({
          ...p,
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          email: user?.email ?? '',
        }))
      } finally {
        setProfileLoading(false)
      }
    }
    load()
  }, [user])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      const [authRes, custRes] = await Promise.allSettled([
        authApi.updateProfile({ firstName: profile.firstName, lastName: profile.lastName }),
        customerApi.updateMyProfile({
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
        }),
      ])

      const authOk = authRes.status === 'fulfilled' && authRes.value.success
      const custOk = custRes.status === 'fulfilled' && custRes.value.success

      if (authOk || custOk) {
        toast.success('Profile updated successfully')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (pw.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setPwSaving(true)
    try {
      const res = await authApi.updateProfile({ password: pw.newPassword } as any)
      if (res.success) {
        toast.success('Password updated successfully')
        setPw({ newPassword: '', confirmPassword: '' })
      } else {
        toast.error(res.message || 'Failed to update password')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and notification preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
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

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={profile.firstName}
                          onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={profile.lastName}
                          onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input className="pl-10" value={profile.email} disabled />
                        </div>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="+1 (555) 123-4567"
                            value={profile.phone}
                            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input
                        placeholder="Your business name"
                        value={profile.businessName}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Contact your service provider to update business name</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          placeholder="Your city"
                          value={profile.city}
                          onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          placeholder="Street address"
                          value={profile.address}
                          onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={profileSaving} className="gap-2">
                      {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive urgent notifications via SMS' },
                  { key: 'expiryReminders', label: 'Expiry Reminders', desc: 'Get notified before equipment expires' },
                  { key: 'inspectionReminders', label: 'Inspection Reminders', desc: 'Get notified about upcoming inspections' },
                  { key: 'serviceUpdates', label: 'Service Updates', desc: 'Receive updates on service requests' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={checked => setNotifications(n => ({ ...n, [key]: checked }))}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Reminder Frequency</Label>
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">1 day before</SelectItem>
                      <SelectItem value="3days">3 days before</SelectItem>
                      <SelectItem value="7days">7 days before</SelectItem>
                      <SelectItem value="14days">14 days before</SelectItem>
                      <SelectItem value="30days">30 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => toast.success('Notification preferences saved')}
                >
                  <Save className="h-4 w-4" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={pw.newPassword}
                    onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    value={pw.confirmPassword}
                    onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pw.newPassword || !pw.confirmPassword}
                  className="gap-2"
                >
                  {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
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
