import React from 'react'
import { create } from 'zustand'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now() + Math.random()
    const t = { id, type: 'info', message: '', duration: 4500, ...toast }
    set(s => ({ toasts: [...s.toasts, t] }))
    setTimeout(() => get().removeToast(id), t.duration)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  success: (message, opts = {}) => get().addToast({ type: 'success', message, ...opts }),
  error:   (message, opts = {}) => get().addToast({ type: 'error',   message, ...opts }),
  warning: (message, opts = {}) => get().addToast({ type: 'warning', message, ...opts }),
  info:    (message, opts = {}) => get().addToast({ type: 'info',    message, ...opts }),
}))

const TOAST_STYLES = {
  success: { bg: 'var(--green-bg)',  border: 'var(--green-border)',  color: 'var(--green)',  Icon: CheckCircle },
  error:   { bg: 'var(--red-bg)',    border: 'var(--red-border)',    color: 'var(--red)',    Icon: AlertCircle },
  warning: { bg: 'var(--amber-bg)',  border: 'var(--amber-border)',  color: 'var(--amber)',  Icon: AlertTriangle },
  info:    { bg: 'var(--blue-bg)',   border: 'var(--blue-border)',   color: 'var(--blue)',   Icon: Info },
}

const Toast = ({ toast }) => {
  const { removeToast } = useToastStore()
  const { bg, border, color, Icon } = TOAST_STYLES[toast.type] || TOAST_STYLES.info
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: 8, minWidth: 280, maxWidth: 380,
      background: bg, border: `1px solid ${border}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      animation: 'vx-fadein 0.2s ease',
      fontFamily: 'var(--font-ui)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{toast.message}</span>
      </div>
      <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 3, marginLeft: 10 }}>
        <X size={14} />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToastStore()
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  )
}

export default ToastContainer
