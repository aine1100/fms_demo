'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, Search, Filter, MoreHorizontal, Mail, Shield, CheckCircle, XCircle, Download } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { downloadCsv } from '@/lib/export'

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

export default function CompanyInspectorsPage() {
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchInspectors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.getAllUsers(100, 0)
      if (res.success && res.data) {
        const all = Array.isArray(res.data.items) ? (res.data.items as Inspector[]) : []
        setInspectors(all.filter(user => user && user.role === 'inspector'))
      } else {
        setInspectors([])
        setError(res.message || 'Failed to load inspectors')
      }
    } catch (err: any) {
      setInspectors([])
      setError(err.message || 'Failed to load inspectors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInspectors()
  }, [fetchInspectors])

  const safeInspectors = Array.isArray(inspectors) ? inspectors : []

  const filtered = safeInspectors.filter(inspector => {
    const fullName = `${inspector.firstName} ${inspector.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      inspector.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && inspector.isActive) ||
      (statusFilter === 'inactive' && !inspector.isActive)
    return matchesSearch && matchesStatus
  })

  const activeCount = safeInspectors.filter(inspector => inspector.isActive).length

  const handleExport = () => {
    downloadCsv('company-inspectors', filtered, [
      { header: 'First Name', value: inspector => inspector.firstName },
      { header: 'Last Name', value: inspector => inspector.lastName },
      { header: 'Email', value: inspector => inspector.email },
      { header: 'Status', value: inspector => (inspector.isActive ? 'Active' : 'Inactive') },
      { header: 'Member Since', value: inspector => new Date(inspector.createdAt).toLocaleDateString() },
    ])
  }

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspectors</h1>
            <p className="text-muted-foreground">Inspectors assigned to your company</p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={loading || filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Total Inspectors" value={loading ? '—' : safeInspectors.length.toString()} icon={Users} />
          <StatsCard title="Active" value={loading ? '—' : activeCount.toString()} icon={CheckCircle} description="Currently available" />
          <StatsCard title="Inactive" value={loading ? '—' : (safeInspectors.length - activeCount).toString()} icon={XCircle} description="Not available" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inspector Directory</CardTitle>
          </CardHeader>
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
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
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
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No inspectors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(inspector => (
                        <TableRow key={inspector.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
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
    </DashboardLayout>
  )
}
