import React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToastStore } from '../store/toast'

export { useToastStore }

const TOAST_META = {
  success: { Icon: CheckCircle, tone: 'success' },
  error:   { Icon: AlertCircle, tone: 'error' },
  warning: { Icon: AlertTriangle, tone: 'warning' },
  info:    { Icon: Info, tone: 'info' },
}

const Toast = ({ toast }) => {
  const { removeToast } = useToastStore()
  const { Icon, tone } = TOAST_META[toast.type] || TOAST_META.info
  return (
    <div className={`vx-toast ${tone}`} role="status">
      <Icon size={17} className="icon" />
      <div style={{ minWidth: 0 }}>
        <div className="t-title">{toast.title || (toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Warning' : 'Note')}</div>
        <div className="t-msg">{toast.message}</div>
      </div>
      <button className="close vx-icon-btn sm" onClick={() => removeToast(toast.id)} aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToastStore()
  return (
    <div className="vx-toasts">
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  )
}

export default ToastContainer
