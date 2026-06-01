'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockCustomers, mockInspectors } from '@/lib/mock-data'
import type { User } from '@/lib/types'
import { 
  MoreHorizontal, 
  Eye,
  UserCog,
  Shield,
  Users as UsersIcon,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function UsersPage() {
  const allUsers = [...mockCustomers, ...mockInspectors]
  const [users, setUsers] = useState(allUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter)

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      company_admin: 'Company Admin',
      customer: 'Customer',
      inspector: 'Inspector',
    }
    return labels[role] || role
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-sm">
          {user.role === 'inspector' && <UserCog className="h-3.5 w-3.5" />}
          {user.role === 'customer' && <UsersIcon className="h-3.5 w-3.5" />}
          {user.role === 'super_admin' && <Shield className="h-3.5 w-3.5" />}
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (user) => user.phone || '-',
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (user) => (
        <StatusBadge status={user.isActive ? 'active' : 'pending'} />
      ),
    },
  ]

  const actions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setSelectedUser(user)
          setIsViewDialogOpen(true)
        }}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
          {user.isActive ? (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <DashboardLayout requiredRole="super_admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage all system users</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'customer').length}
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inspectors</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'inspector').length}
                  </p>
                </div>
                <UserCog className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-success">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="inspector">Inspectors</SelectItem>
                <SelectItem value="company_admin">Company Admins</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredUsers}
              searchKeys={['name', 'email']}
              actions={actions}
              exportable
              onExport={() => console.log('Export users')}
            />
          </CardContent>
        </Card>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{getRoleLabel(selectedUser.role)}</p>
                  <StatusBadge status={selectedUser.isActive ? 'active' : 'pending'} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedUser.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{selectedUser.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-medium">{selectedUser.isVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
