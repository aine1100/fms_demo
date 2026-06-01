'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Bell, Shield, Save, Loader2, Mail, Phone, MapPin } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store'

export default function CompanySettingsPage() {
  const { user } = useAuthStore()

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    companyPhone: '',
    companyAddress: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    expiryReminders: true,
    inspectionReminders: true,
    weeklyReports: false,
  })

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true)
      try {
        const res = await authApi.getProfile()
        if (res.success && res.data) {
          const d = res.data
          setProfile({
            firstName: d.firstName ?? '',
            lastName: d.lastName ?? '',
            email: d.email ?? '',
            companyName: d.company?.name ?? '',
            companyPhone: d.company?.phone ?? '',
            companyAddress: d.company?.address ?? '',
          })
        }
      } catch (err) {
        // silently fall back to store data
        if (user) {
          setProfile(prev => ({
            ...prev,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            email: user.email ?? '',
          }))
        }
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [user])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      const res = await authApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
      })
      if (res.success) {
        setProfileSuccess(true)
        setTimeout(() => setProfileSuccess(false), 3000)
      } else {
        setProfileError(res.message || 'Update failed')
      }
    } catch (err: any) {
      setProfileError(err.message || 'Update failed')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setPasswordSaving(true)
    try {
      // Password change goes through profile update with password field
      const res = await authApi.updateProfile({ password: passwordForm.newPassword } as any)
      if (res.success) {
        setPasswordSuccess(true)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(res.message || 'Password update failed')
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Password update failed')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your company settings and preferences</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
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

          {/* Company Info Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <>
                    {profileError && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{profileError}</div>
                    )}
                    {profileSuccess && (
                      <div className="p-3 rounded-lg bg-success/10 text-success text-sm">Profile updated successfully</div>
                    )}
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
                        <Label>Company Name</Label>
                        <Input value={profile.companyName} disabled />
                        <p className="text-xs text-muted-foreground">Contact support to change company name</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input className="pl-10" value={profile.companyPhone} disabled />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea className="pl-10" value={profile.companyAddress} disabled />
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
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
                  { key: 'expiryReminders', label: 'Expiry Reminders', desc: 'Get notified before extinguishers expire' },
                  { key: 'inspectionReminders', label: 'Inspection Reminders', desc: 'Get notified about upcoming inspections' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly summary reports' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={checked =>
                        setNotifications(n => ({ ...n, [key]: checked }))
                      }
                    />
                  </div>
                ))}
                <Button className="gap-2">
                  <Save className="h-4 w-4" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-success/10 text-success text-sm">Password updated successfully</div>
                )}
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordSaving || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="gap-2"
                >
                  {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
