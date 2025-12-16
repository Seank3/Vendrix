import React from 'react'
import { create } from 'zustand'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

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

const Toast = ({ toast }) => {
  const { removeToast } = useToastStore()

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const styles = {
    success: 'bg-green-900/20 border-green-800 text-green-400',
    error: 'bg-red-900/20 border-red-800 text-red-400',
    warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
    info: 'bg-blue-900/20 border-blue-800 text-blue-400',
  }

  const IconComponent = icons[toast.type]

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${styles[toast.type]} min-w-80 max-w-sm`}>
      <div className="flex items-center gap-3">
        <IconComponent size={20} />
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-4 text-current opacity-70 hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer