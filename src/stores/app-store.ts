import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, User } from '@/types'

interface AppState {
  user: User | null
  isAuthenticated: boolean
  notifications: Notification[]
  setUser: (user: User) => void
  logout: () => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      notifications: [],
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ user: null, isAuthenticated: false, notifications: [] }),
      
      addNotification: (notification) => 
        set((state) => ({ 
          notifications: [...state.notifications, notification] 
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      
      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'liora-app-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)