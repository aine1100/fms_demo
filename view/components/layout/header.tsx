'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore, useNotificationStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const [notifOpen, setNotifOpen] = useState(false)

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
      company: 'Company Admin',
      customer: 'Customer',
      inspector: 'Inspector',
    }
    return labels[role] || role
  }

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300",
        sidebarOpen ? "left-64" : "left-20",
        "lg:left-20",
        sidebarOpen && "lg:left-64"
      )}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              Fire Management System
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto py-1 px-2 text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className={cn(
                        "flex flex-col items-start gap-1 py-3 cursor-pointer",
                        !notif.isRead && "bg-muted/50"
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          notif.type === 'warning' && "bg-warning",
                          notif.type === 'error' && "bg-destructive",
                          notif.type === 'success' && "bg-success",
                          notif.type === 'info' && "bg-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{notif.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-primary">
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user ? getInitials(user.name ?? `${user.firstName} ${user.lastName}`) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.name ?? `${user?.firstName} ${user?.lastName}`}</span>
                  <span className="text-xs text-muted-foreground">
                    {user ? getRoleLabel(user.role) : ''}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name ?? `${user?.firstName} ${user?.lastName}`}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={() => {
                  logout()
                  window.location.href = '/login'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
