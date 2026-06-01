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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockInspectors, mockCompanies } from '@/lib/mock-data'
import type { User } from '@/lib/types'
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  UserCog,
  Star,
  CheckCircle
} from 'lucide-react'

export default function InspectorsPage() {
  const [inspectors, setInspectors] = useState(mockInspectors)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedInspector, setSelectedInspector] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = (id: string) => {
    setInspectors(prev => prev.filter(i => i.id !== id))
    setIsDeleteDialogOpen(false)
    setSelectedInspector(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Inspector',
      sortable: true,
      render: (inspector) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(inspector.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{inspector.name}</p>
            <p className="text-xs text-muted-foreground">{inspector.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (inspector) => inspector.phone || '-',
    },
    {
      key: 'companyId',
      label: 'Assigned Company',
      render: (inspector) => {
        const company = mockCompanies.find(c => c.id === inspector.companyId)
        return company?.name || 'Unassigned'
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (inspector) => (
        <StatusBadge status={inspector.isActive ? 'active' : 'pending'} />
      ),
    },
  ]

  const actions = (inspector: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setSelectedInspector(inspector)
          setIsViewDialogOpen(true)
        }}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setSelectedInspector(inspector)
          setIsAddDialogOpen(true)
        }}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => {
            setSelectedInspector(inspector)
            setIsDeleteDialogOpen(true)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <DashboardLayout requiredRole="super_admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspectors</h1>
            <p className="text-muted-foreground">Manage all system inspectors</p>
          </div>
          <Button onClick={() => {
            setSelectedInspector(null)
            setIsAddDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Inspector
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Inspectors</p>
                  <p className="text-2xl font-bold">{inspectors.length}</p>
                </div>
                <UserCog className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-success">
                    {inspectors.filter(i => i.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  <p className="text-2xl font-bold text-warning">4.8</p>
                </div>
                <Star className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Inspectors</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={inspectors}
              searchKeys={['name', 'email']}
              actions={actions}
              exportable
              onExport={() => console.log('Export inspectors')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Inspector Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedInspector ? 'Edit Inspector' : 'Add New Inspector'}</DialogTitle>
            <DialogDescription>
              {selectedInspector ? 'Update inspector information' : 'Fill in the details to add a new inspector'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter full name"
                defaultValue={selectedInspector?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="inspector@example.com"
                defaultValue={selectedInspector?.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 123-4567"
                defaultValue={selectedInspector?.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Assign to Company</Label>
              <Select defaultValue={selectedInspector?.companyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {mockCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              {selectedInspector ? 'Save Changes' : 'Add Inspector'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Inspector Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inspector Details</DialogTitle>
          </DialogHeader>
          {selectedInspector && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedInspector.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedInspector.name}</h3>
                  <p className="text-sm text-muted-foreground">Inspector</p>
                  <StatusBadge status={selectedInspector.isActive ? 'active' : 'pending'} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedInspector.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedInspector.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">
                    {mockCompanies.find(c => c.id === selectedInspector.companyId)?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{selectedInspector.createdAt}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Inspections</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-success">98%</p>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-warning">4.9</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Inspector</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedInspector?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedInspector && handleDelete(selectedInspector.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
