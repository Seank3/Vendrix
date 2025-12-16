import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'dark',

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      reset: () => {
        set({
          sidebarCollapsed: false,
          theme: 'dark'
        })
      }
    }),
    {
      name: 'ui-storage',
      version: 1,
    }
  )
)