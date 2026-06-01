import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, Notification } from './types'
import { authApi } from './api/auth'
import { authClient, customerClient, extinguisherClient, inspectionClient, paymentClient, notificationClient } from './api/client'

// Helper: push token to every service client at once
function setTokenOnAllClients(token: string | null) {
  authClient.setToken(token)
  customerClient.setToken(token)
  extinguisherClient.setToken(token)
  inspectionClient.setToken(token)
  paymentClient.setToken(token)
  notificationClient.setToken(token)
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, role: UserRole, extra?: Record<string, string>) => Promise<boolean>
  logout: () => void
  verifyOtp: (otp: string, email?: string) => Promise<boolean>
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (otp: string, newPassword: string, email?: string) => Promise<boolean>
  clearError: () => void
  // Internal helpers
  _pendingEmail: string | null
  _setPendingEmail: (email: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _pendingEmail: null,

      _setPendingEmail: (email: string) => set({ _pendingEmail: email }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          if (response.success && response.data) {
            const { user: apiUser, token, refreshToken } = response.data
            // Normalise user shape to match our User type
            const user: User = {
              id: apiUser.id,
              email: apiUser.email,
              firstName: apiUser.firstName,
              lastName: apiUser.lastName,
              name: `${apiUser.firstName} ${apiUser.lastName}`,
              role: apiUser.role as UserRole,
              companyId: apiUser.companyId,
              isActive: apiUser.isActive,
              createdAt: new Date().toISOString(),
            }
            set({ user, token, refreshToken, isAuthenticated: true })
            setTokenOnAllClients(token)
            return true
          }
          set({ error: response.message || 'Login failed' })
          return false
        } catch (error: any) {
          set({ error: error.message || 'Login failed' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (email, password, name, role, extra = {}) => {
        set({ isLoading: true, error: null })
        try {
          // Split name into firstName / lastName
          const parts = name.trim().split(' ')
          const firstName = parts[0] || name
          const lastName = parts.slice(1).join(' ') || parts[0] || ''

          const response = await authApi.register({
            firstName,
            lastName,
            email,
            password,
            role: role as 'customer' | 'company' | 'super_admin',
            ...extra,
          })
          if (response.success) {
            // Clear any stale session and store email for the verify-otp page
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              _pendingEmail: email,
            })
            setTokenOnAllClients(null)
            return true
          }
          set({ error: response.message || 'Registration failed' })
          return false
        } catch (error: any) {
          set({ error: error.message || 'Registration failed' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, error: null })
        setTokenOnAllClients(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-store');
          localStorage.removeItem('fms-auth')
        }
      },

      verifyOtp: async (otp: string, email?: string) => {
        set({ isLoading: true, error: null })
        try {
          const targetEmail = email || get()._pendingEmail || get().user?.email || ''
          const response = await authApi.verifyAccount({ email: targetEmail, otp })
          if (response.success) {
            set({ isLoading: false })
            return true
          }
          set({ error: response.message || 'Invalid OTP', isLoading: false })
          return false
        } catch (error: any) {
          set({ error: error.message || 'Verification failed', isLoading: false })
          return false
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.requestPasswordReset({ email })
          if (response.success) {
            set({ _pendingEmail: email, isLoading: false })
            return true
          }
          set({ error: response.message || 'Email not found', isLoading: false })
          return false
        } catch (error: any) {
          set({ error: error.message || 'Request failed', isLoading: false })
          return false
        }
      },

      resetPassword: async (otp: string, newPassword: string, email?: string) => {
        set({ isLoading: true, error: null })
        try {
          const targetEmail = email || get()._pendingEmail || ''
          const response = await authApi.resetPassword({ email: targetEmail, otp, newPassword })
          if (response.success) {
            set({ isLoading: false })
            return true
          }
          set({ error: response.message || 'Reset failed', isLoading: false })
          return false
        } catch (error: any) {
          set({ error: error.message || 'Reset failed', isLoading: false })
          return false
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fms-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        _pendingEmail: state._pendingEmail,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore token to ALL service clients after hydration
        if (state?.token) {
          setTokenOnAllClients(state.token)
        }
      },
    }
  )
)

// ─── Notification Store (unchanged) ──────────────────────────────────────────

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))
