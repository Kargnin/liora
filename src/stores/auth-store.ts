import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserType } from '@/types/user'
import { AuthService } from '@/services/auth-service'

interface AuthState {
  // Authentication state
  isAuthenticated: boolean
  user: User | null
  userType: UserType | null
  _hasHydrated: boolean
  
  // Actions
  login: (name: string, userType: UserType) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      userType: null,
      _hasHydrated: false,

      // Actions
      login: async (name: string, userType: UserType) => {
        try {
          const user = await AuthService.login({ name, userType })
          
          set({
            isAuthenticated: true,
            user,
            userType,
          })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },

      logout: async () => {
        try {
          await AuthService.logout()
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            userType: null,
          })
        }
      },

      setUser: (user: User) => {
        set({
          user,
          userType: user.type,
          isAuthenticated: true,
        })
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          set({ user: updatedUser })
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated })
      },
    }),
    {
      name: 'liora-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        userType: state.userType,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)