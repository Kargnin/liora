import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import type { UserType } from '@/types/user'

interface UseAuthGuardOptions {
  requiredUserType?: UserType
  redirectTo?: string
}

/**
 * Hook to protect routes and ensure user is authenticated with correct user type
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const router = useRouter()
  const { isAuthenticated, user, userType, _hasHydrated } = useAuthStore()
  const { requiredUserType, redirectTo = '/' } = options

  useEffect(() => {
    // Don't redirect until store has hydrated from localStorage
    if (!_hasHydrated) {
      return
    }

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // If specific user type is required and doesn't match, redirect
    if (requiredUserType && userType !== requiredUserType) {
      // Redirect to the correct dashboard for their user type
      router.push(`/${userType}`)
      return
    }
  }, [isAuthenticated, userType, requiredUserType, router, redirectTo, _hasHydrated])

  return {
    isAuthenticated,
    user,
    userType,
    isLoading: !_hasHydrated, // Loading until hydrated
  }
}