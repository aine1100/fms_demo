'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    if (mounted && user && requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(user.role)) {
        // Redirect to appropriate dashboard
        const dashboardRoutes: Record<UserRole, string> = {
          super_admin: '/admin',
          company: '/company',
          customer: '/customer',
          inspector: '/inspector',
        }
        router.push(dashboardRoutes[user.role])
      }
    }
  }, [mounted, user, requiredRole, router])

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        role={user.role} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={false}
      />
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen}
      />
      <main 
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20",
          "pl-0"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
