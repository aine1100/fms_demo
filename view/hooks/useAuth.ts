import { useAuthStore } from '@/lib/store/auth';
import { useEffect } from 'react';

export function useAuth() {
  const { user, token, isLoading, error, isHydrated, setHydrated, ...actions } = useAuthStore();

  useEffect(() => {
    // Set hydrated flag when component mounts (client-side only)
    setHydrated();

    // Listen for unauthorized events to trigger logout
    const handleUnauthorized = () => {
      actions.logout();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unauthorized', handleUnauthorized);
      return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }
  }, [setHydrated, actions]);

  return {
    user,
    token,
    isLoading,
    error,
    isHydrated,
    isAuthenticated: isHydrated && !!token && !!user,
    ...actions,
  };
}
