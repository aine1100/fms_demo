import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, ProfileResponse, AuthResponse } from '@/lib/api/auth';
import { authClient, customerClient, extinguisherClient, inspectionClient, paymentClient, notificationClient } from '@/lib/api/client';

function setTokenOnAllClients(token: string | null) {
  authClient.setToken(token);
  customerClient.setToken(token);
  extinguisherClient.setToken(token);
  inspectionClient.setToken(token);
  paymentClient.setToken(token);
  notificationClient.setToken(token);
}

interface AuthState {
  user: ProfileResponse | AuthResponse['user'] | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyAccount: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<ProfileResponse>) => Promise<void>;
  setHydrated: () => void;
}

// Custom storage that only works on client side
const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : undefined;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            set({ user, token, refreshToken });
            setTokenOnAllClients(token);
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          if (!response.success) {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyAccount: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyAccount({ email, otp });
          if (!response.success) {
            throw new Error(response.message || 'Verification failed');
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setToken: (token: string, refreshToken: string) => {
        set({ token, refreshToken });
        setTokenOnAllClients(token);
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        setTokenOnAllClients(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('fms-auth');
          localStorage.removeItem('auth-store');
        }
      },

      refreshAccessToken: async () => {
        const state = get();
        if (!state.refreshToken) {
          state.logout();
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken({ refreshToken: state.refreshToken });
          if (response.success && response.data) {
            set({ token: response.data.token });
            setTokenOnAllClients(response.data.token);
          }
        } catch (error) {
          state.logout();
          throw error;
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            set({ user: response.data });
            const { token } = get();
            if (token) setTokenOnAllClients(token);
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: Partial<ProfileResponse>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(data);
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: storage!,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      // Skip hydration on server
      skipHydration: typeof window === 'undefined',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.setHydrated();
            // Restore token to client on hydration
            if (state.token) {
              setTokenOnAllClients(state.token);
            }
          }
        };
      },
    }
  )
);
