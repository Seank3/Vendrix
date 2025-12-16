import { create } from 'zustand'

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      message: '',
      duration: 5000,
      ...toast
    }

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id)
    }, newToast.duration)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },

  // Convenience methods
  success: (message, options = {}) => {
    get().addToast({ type: 'success', message, ...options })
  },

  error: (message, options = {}) => {
    get().addToast({ type: 'error', message, ...options })
  },

  warning: (message, options = {}) => {
    get().addToast({ type: 'warning', message, ...options })
  },

  info: (message, options = {}) => {
    get().addToast({ type: 'info', message, ...options })
  },

  // Clear all toasts
  clear: () => {
    set({ toasts: [] })
  }
}))
