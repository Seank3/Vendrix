import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Authentication store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        localStorage.removeItem('auth_token')
      },

      setUser: (userData) => {
        set({ user: userData })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          // Try to fetch user data, but don't fail if backend is unavailable
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(5000)
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // If token is invalid, clear it and redirect to login
            localStorage.removeItem('auth_token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          // If backend is unavailable, assume user is not authenticated
          // but don't clear token in case backend comes back
          console.warn('Auth check failed, assuming not authenticated:', error.message)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// UI store for preferences
export const useUIStore = create(
  persist(
    (set) => ({
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
      }
    }),
    {
      name: 'ui-storage'
    }
  )
)

// Toast notifications store
export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now()
    const newToast = { id, ...toast }
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeToast(id)
    }, 5000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },

  success: (message) => {
    get().addToast({ type: 'success', message })
  },

  error: (message) => {
    get().addToast({ type: 'error', message })
  },

  info: (message) => {
    get().addToast({ type: 'info', message })
  }
}))
