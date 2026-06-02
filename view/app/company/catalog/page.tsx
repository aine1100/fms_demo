'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { extinguisherApi, type CatalogItem } from '@/lib/api/extinguisher'
import toast from 'react-hot-toast'
import {
    Plus,
    MoreHorizontal,
    Eye,
    Package,
    Tag,
    Flame,
    Loader2,
    ShoppingBag,
} from 'lucide-react'

const EXT_TYPES = [
    { value: 'water', label: 'Water' },
    { value: 'foam', label: 'Foam' },
    { value: 'co2', label: 'CO2' },
    { value: 'dry_powder', label: 'Dry Powder' },
    { value: 'wet_chemical', label: 'Wet Chemical' },
]

const emptyForm = {
    name: '',
    type: '',
    capacity: '',
    description: '',
    price: '',
    imageUrl: '',
}

export default function CompanyCatalogPage() {
    const [items, setItems] = useState<CatalogItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await extinguisherApi.getCatalog(1, 100)
            if (res.success && res.data) {
                setItems(res.data.items ?? [])
                setTotal(res.data.total ?? 0)
            } else {
                setItems([])
                setTotal(0)
                toast.error(res.message || 'Failed to load catalog')
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load catalog')
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const openAdd = () => {
        setForm(emptyForm)
        setFormError(null)
        setIsAddDialogOpen(true)
    }

    const handleSave = async () => {
        setFormError(null)
        if (!form.name.trim()) { setFormError('Name is required'); return }
        if (!form.type) { setFormError('Type is required'); return }
        if (!form.capacity.trim()) { setFormError('Capacity is required'); return }
        const price = parseFloat(form.price)
        if (isNaN(price) || price < 0) { setFormError('Enter a valid price'); return }

        setSaving(true)
        try {
            const res = await extinguisherApi.addCatalogItem({
                name: form.name.trim(),
                type: form.type,
                capacity: form.capacity.trim(),
                description: form.description.trim() || undefined,
                price,
                imageUrl: form.imageUrl.trim() || undefined,
            })
            if (res.success && res.data) {
                toast.success('Item added to catalog')
                setItems(prev => [res.data!, ...prev])
                setTotal(prev => prev + 1)
                setIsAddDialogOpen(false)
            } else {
                toast.error(res.message || 'Failed to add item')
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to add item')
        } finally {
            setSaving(false)
        }
    }

    const typeColor: Record<string, string> = {
        water: 'bg-blue-100 text-blue-700',
        foam: 'bg-green-100 text-green-700',
        co2: 'bg-gray-100 text-gray-700',
        dry_powder: 'bg-yellow-100 text-yellow-700',
        wet_chemical: 'bg-orange-100 text-orange-700',
    }

    const columns: Column<CatalogItem>[] = [
        {
            key: 'name',
            label: 'Item',
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Flame className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.capacity}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (item) => (
                <Badge className={`capitalize text-xs ${typeColor[item.type] ?? 'bg-muted text-muted-foreground'}`}>
                    {item.type.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (item) => (
                <span className="font-semibold text-success">${Number(item.price).toFixed(2)}</span>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            render: (item) => (
                <span className="text-sm text-muted-foreground line-clamp-1">
                    {item.description || '—'}
                </span>
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (item) => (
                item.isActive
                    ? <Badge className="bg-green-100 text-green-700">Active</Badge>
                    : <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
            ),
        },
        {
            key: 'createdAt',
            label: 'Listed',
            sortable: true,
            render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
    ]

    const actions = (item: CatalogItem) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsViewDialogOpen(true) }}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    const activeCount = items.filter(i => i.isActive).length

    return (
        <DashboardLayout requiredRole="company">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
                        <p className="text-muted-foreground">
                            List your extinguisher products so customers can browse and request them
                        </p>
                    </div>
                    <Button onClick={openAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add to Catalog
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Listings</p>
                                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{total}</p>}
                            </div>
                            <ShoppingBag className="h-8 w-8 text-primary/20" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Listings</p>
                                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-success">{activeCount}</p>}
                            </div>
                            <Package className="h-8 w-8 text-success/20" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Types Listed</p>
                                {loading
                                    ? <Skeleton className="h-8 w-16 mt-1" />
                                    : <p className="text-2xl font-bold">{new Set(items.map(i => i.type)).size}</p>
                                }
                            </div>
                            <Tag className="h-8 w-8 text-primary/20" />
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Catalog Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={items}
                                searchKeys={['name', 'type', 'capacity', 'description']}
                                actions={actions}
                                exportable={false}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Catalog Item</DialogTitle>
                        <DialogDescription>
                            List a new extinguisher product for customers to browse and request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {formError && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
                        )}
                        <div className="space-y-2">
                            <Label>Product Name *</Label>
                            <Input
                                placeholder="e.g. 6kg ABC Dry Powder Extinguisher"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Type *</Label>
                                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        {EXT_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Capacity *</Label>
                                <Input
                                    placeholder="e.g. 6kg or 5L"
                                    value={form.capacity}
                                    onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Price (USD) *</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Briefly describe the product, certifications, use cases..."
                                rows={3}
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input
                                placeholder="https://..."
                                value={form.imageUrl}
                                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !form.name || !form.type || !form.capacity || !form.price}
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add to Catalog
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Catalog Item Details</DialogTitle></DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Flame className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                                    <Badge className={`capitalize text-xs mt-1 ${typeColor[selectedItem.type] ?? ''}`}>
                                        {selectedItem.type.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid gap-2.5 pt-4 border-t text-sm">
                                {[
                                    ['Capacity', selectedItem.capacity],
                                    ['Price', `$${Number(selectedItem.price).toFixed(2)}`],
                                    ['Status', selectedItem.isActive ? 'Active' : 'Inactive'],
                                    ['Listed On', new Date(selectedItem.createdAt).toLocaleDateString()],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                                {selectedItem.description && (
                                    <div className="pt-3 border-t">
                                        <p className="text-muted-foreground text-xs mb-1">Description</p>
                                        <p>{selectedItem.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
