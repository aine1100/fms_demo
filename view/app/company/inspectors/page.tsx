'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { authApi } from '@/lib/api/auth'

interface Inspector {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  companyId?: number
  createdAt: string
}

interface CreateInspectorForm {
  firstName: string
  lastName: string
  email: string
  password: string
}

const emptyForm: CreateInspectorForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

export default function CompanyInspectorsPage() {
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [form, setForm] = useState<CreateInspectorForm>(emptyForm)

  const fetchInspectors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.getAllUsers(100, 0)
      if (res.success && res.data) {
        const all = Array.isArray(res.data.items) ? (res.data.items as Inspector[]) : []
        setInspectors(all.filter(u => u && u.role === 'inspector'))
      } else {
        setError(res.message || 'Failed to load inspectors')
        setInspectors([])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inspectors')
      setInspectors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInspectors() }, [fetchInspectors])

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) return
    setSaving(true)
    setError(null)
    try {
      const res = await authApi.createInspector(form)
      if (res.success && res.data) {
        setInspectors(prev => [...prev, res.data as Inspector])
        setIsAddDialogOpen(false)
        setForm(emptyForm)
      } else {
        setError(res.message || 'Failed to create inspector')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create inspector')
    } finally {
      setSaving(false)
    }
  }

  const safeInspectors = Array.isArray(inspectors) ? inspectors : []

  const filtered = safeInspectors.filter(ins => {
    const fullName = `${ins.firstName} ${ins.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      ins.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ins.isActive) ||
      (statusFilter === 'inactive' && !ins.isActive)
    return matchesSearch && matchesStatus
  })

  const activeCount = safeInspectors.filter(i => i.isActive).length

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspector Management</h1>
            <p className="text-muted-foreground">Manage your inspection team</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setError(null); setIsAddDialogOpen(true) }}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Inspector
          </Button>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Inspectors"
            value={loading ? '—' : inspectors.length.toString()}
            icon={Users}
          />
          <StatsCard
            title="Active"
            value={loading ? '—' : activeCount.toString()}
            icon={CheckCircle}
            description="Currently available"
          />
          <StatsCard
            title="Inactive"
            value={loading ? '—' : (inspectors.length - activeCount).toString()}
            icon={XCircle}
            description="Not available"
          />
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Inspector Directory</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search inspectors..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Member Since</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No inspectors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(inspector => (
                        <TableRow key={inspector.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                                {inspector.firstName[0]}{inspector.lastName[0]}
                              </div>
                              <span className="font-medium">{inspector.firstName} {inspector.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {inspector.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(inspector.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {inspector.isActive ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle className="mr-1 h-3 w-3" /> Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                                <XCircle className="mr-1 h-3 w-3" /> Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" /> View Profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Inspector Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Inspector</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  placeholder="John"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="inspector@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password *</Label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !form.firstName || !form.lastName || !form.email || form.password.length < 6}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
