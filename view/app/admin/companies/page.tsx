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
import { mockCompanies } from '@/lib/mock-data'
import type { Company } from '@/lib/types'
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(mockCompanies)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleToggleStatus = (id: string) => {
    setCompanies(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
  }

  const handleDelete = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id))
    setIsDeleteDialogOpen(false)
    setSelectedCompany(null)
  }

  const columns: Column<Company>[] = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (company) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{company.name}</p>
            <p className="text-xs text-muted-foreground">{company.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
    },
    {
      key: 'totalExtinguishers',
      label: 'Extinguishers',
      sortable: true,
      render: (company) => (
        <span className="font-medium">{company.totalExtinguishers}</span>
      ),
    },
    {
      key: 'activeInspectors',
      label: 'Inspectors',
      sortable: true,
    },
    {
      key: 'pendingInspections',
      label: 'Pending',
      sortable: true,
      render: (company) => (
        <span className={company.pendingInspections > 10 ? 'text-warning font-medium' : ''}>
          {company.pendingInspections}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (company) => (
        <StatusBadge status={company.isActive ? 'active' : 'pending'} />
      ),
    },
  ]

  const actions = (company: Company) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setSelectedCompany(company)
          setIsViewDialogOpen(true)
        }}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setSelectedCompany(company)
          setIsAddDialogOpen(true)
        }}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleStatus(company.id)}>
          {company.isActive ? (
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
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => {
            setSelectedCompany(company)
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
            <h1 className="text-2xl font-bold text-foreground">Companies</h1>
            <p className="text-muted-foreground">Manage all registered companies</p>
          </div>
          <Button onClick={() => {
            setSelectedCompany(null)
            setIsAddDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-success">
                    {companies.filter(c => c.isActive).length}
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
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-warning">
                    {companies.filter(c => !c.isActive).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={companies}
              searchKeys={['name', 'email', 'phone']}
              actions={actions}
              exportable
              onExport={() => console.log('Export companies')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Company Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            <DialogDescription>
              {selectedCompany ? 'Update company information' : 'Fill in the details to add a new company'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name" 
                placeholder="Enter company name"
                defaultValue={selectedCompany?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="company@example.com"
                defaultValue={selectedCompany?.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 123-4567"
                defaultValue={selectedCompany?.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Enter full address"
                defaultValue={selectedCompany?.address}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              {selectedCompany ? 'Save Changes' : 'Add Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Company Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                  <StatusBadge status={selectedCompany.isActive ? 'active' : 'pending'} />
                </div>
              </div>
              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedCompany.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedCompany.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedCompany.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extinguishers</span>
                  <span className="font-medium">{selectedCompany.totalExtinguishers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inspectors</span>
                  <span className="font-medium">{selectedCompany.activeInspectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium">{selectedCompany.createdAt}</span>
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
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCompany?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCompany && handleDelete(selectedCompany.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
