'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCog, 
  FileText, 
  Settings,
  Package,
  Calendar,
  Receipt,
  ClipboardList,
  HelpCircle,
  Flame,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Companies', href: '/admin/companies', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Inspectors', href: '/admin/inspectors', icon: <UserCog className="h-5 w-5" /> },
    { label: 'Reports', href: '/admin/reports', icon: <FileText className="h-5 w-5" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ],
  company: [
    { label: 'Dashboard', href: '/company', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Inventory', href: '/company/inventory', icon: <Package className="h-5 w-5" /> },
    { label: 'Customers', href: '/company/customers', icon: <Users className="h-5 w-5" /> },
    { label: 'Inspections', href: '/company/inspections', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Inspectors', href: '/company/inspectors', icon: <UserCog className="h-5 w-5" /> },
    { label: 'Payments', href: '/company/payments', icon: <Receipt className="h-5 w-5" /> },
    { label: 'Reports', href: '/company/reports', icon: <FileText className="h-5 w-5" /> },
    { label: 'Settings', href: '/company/settings', icon: <Settings className="h-5 w-5" /> },
  ],
  customer: [
    { label: 'Dashboard', href: '/customer', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Equipment', href: '/customer/equipment', icon: <Package className="h-5 w-5" /> },
    { label: 'Inspections', href: '/customer/inspections', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Service Requests', href: '/customer/service-requests', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Invoices', href: '/customer/invoices', icon: <Receipt className="h-5 w-5" /> },
    { label: 'Settings', href: '/customer/settings', icon: <Settings className="h-5 w-5" /> },
  ],
  inspector: [
    { label: 'Dashboard', href: '/inspector', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Inspections', href: '/inspector/inspections', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Schedule', href: '/inspector/schedule', icon: <Calendar className="h-5 w-5" /> },
    { label: 'History', href: '/inspector/history', icon: <FileText className="h-5 w-5" /> },
    { label: 'Knowledge Base', href: '/inspector/knowledge', icon: <HelpCircle className="h-5 w-5" /> },
    { label: 'Settings', href: '/inspector/settings', icon: <Settings className="h-5 w-5" /> },
  ],
}

interface SidebarProps {
  role: UserRole
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ role, isOpen, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const items = navItems[role]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isOpen ? "w-64" : "w-20",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-semibold text-sidebar-foreground text-lg">FMS</span>
            )}
          </Link>
          {isMobile && isOpen && (
            <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={isMobile ? onToggle : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {item.icon}
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full justify-center"
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
