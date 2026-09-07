import React, { useEffect } from 'react'
import { X } from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────── */

export const fetchError = (err, fallback = 'Something went wrong. Please try again.') => {
  const d = err?.response?.data
  if (!d) return err?.message === 'Network Error' ? 'Cannot reach the server. Is the backend running?' : fallback
  if (typeof d === 'string') return d
  if (d.detail) return d.detail
  const first = Object.values(d)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  if (Array.isArray(d)) return d.length ? String(d[0]) : fallback
  return fallback
}

export const timeAgo = (iso) => {
  if (!iso) return 'never'
  const then = new Date(iso).getTime()
  const s = Math.max(1, Math.round((Date.now() - then) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
export const money = (v, cur = 'USD') => {
  const n = Number(v)
  return Number.isFinite(n) ? `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}` : '—'
}
export const initials = (name = '') => {
  const p = name.split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?'
}

/** Status -> badge variant mapping */
export const statusTone = (s) => {
  const map = {
    connected: 'green', active: 'green', completed: 'green', fulfilled: 'green', resolved: 'green', synced: 'green', healthy: 'green', success: 'green',
    processing: 'blue', running: 'blue', pending: 'gray', received: 'blue',
    warning: 'amber', low_stock: 'amber', retrying: 'amber', draft: 'gray',
    error: 'red', failed: 'red', cancelled: 'red', out_of_stock: 'red', disconnected: 'red', archived: 'gray',
    disabled: 'gray',
  }
  return map[s] || 'gray'
}

/* ─── components ──────────────────────────────────────────── */

export const Modal = ({ open, onClose, title, children, footer, wide }) => {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="vx-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`vx-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <div className="vx-modal-head">
          <div className="vx-modal-title">{title}</div>
          <button className="vx-icon-btn sm" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="vx-modal-body">{children}</div>
        {footer && <div className="vx-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export const PageHeader = ({ title, sub, actions, crumbs }) => (
  <div className="vx-page-header">
    <div>
      {crumbs && (
        <div className="vx-crumbs mb-16" style={{ marginBottom: 8 }}>
          <a href="/dashboard">Home</a>
          {crumbs.map((c) => (
            <React.Fragment key={c}>
              <span className="sep">›</span>
              <span className="current">{c}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <h1 className="vx-page-title">{title}</h1>
      {sub && <p className="vx-page-sub">{sub}</p>}
    </div>
    {actions && <div className="vx-page-actions">{actions}</div>}
  </div>
)

export const StatCard = ({ icon: Icon, label, value, sub, tone = 'brand', delta, deltaDir }) => (
  <div className="vx-kpi">
    <div className="kpi-top">
      <div className="kpi-label">{label}</div>
      <div className="kpi-icon" style={{
        background: tone === 'green' ? 'var(--green-soft)' : tone === 'amber' ? 'var(--amber-soft)' : tone === 'red' ? 'var(--red-soft)' : tone === 'blue' ? 'var(--blue-soft)' : 'var(--brand-soft)',
        color: tone === 'green' ? 'var(--green)' : tone === 'amber' ? 'var(--amber)' : tone === 'red' ? 'var(--red)' : tone === 'blue' ? 'var(--blue)' : 'var(--brand)',
      }}>
        <Icon size={17} strokeWidth={2} />
      </div>
    </div>
    <div className="kpi-value">{value === undefined || value === null ? '—' : value}</div>
    <div className="kpi-sub">
      {delta && <span className={`kpi-delta ${deltaDir === 'down' ? 'down' : 'up'}`}>{delta}</span>}
      <span>{sub}</span>
    </div>
  </div>
)

export const Badge = ({ tone = 'gray', dot, children }) => (
  <span className={`vx-badge vx-badge-${tone}`}>
    {dot && <span className={`vx-dot vx-dot-${tone === 'gray' ? 'gray' : tone}`} />}
    {children}
  </span>
)

export const EmptyState = ({ icon: Icon, title, sub, action }) => (
  <div className="vx-empty">
    <div className="ring">{Icon && <Icon size={22} />}</div>
    <div className="t1">{title}</div>
    {sub && <div className="t2">{sub}</div>}
    {action}
  </div>
)

export const Spinner = () => <span className="vx-spinner" aria-label="loading" />

export const LoadingRows = ({ rows = 5, cols = 5 }) => (
  <div style={{ padding: '4px 16px 16px' }}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'flex', gap: 18, padding: '10px 0', borderBottom: r < rows - 1 ? '1px solid var(--border)' : 'none' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="vx-skel" style={{ height: 13, flex: c === 0 ? 1.4 : 1 }} />
        ))}
      </div>
    ))}
  </div>
)

export const Field = ({ label, hint, error, children }) => (
  <div className="vx-field">
    {label && <label>{label}</label>}
    {children}
    {hint && <span className="hint">{hint}</span>}
    {error && <span className="hint" style={{ color: 'var(--red)' }}>{error}</span>}
  </div>
)
