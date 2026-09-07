import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Activity, Package, Layers, ShoppingCart, RefreshCw, Zap,
  CheckCircle, AlertTriangle, XCircle, Download,
} from 'lucide-react'
import { eventsAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, Badge, EmptyState, LoadingRows, fetchError, timeAgo, fmtDate } from '../components/ui'

const EVENT_META = {
  'product.created':   { icon: Package, tone: 'blue', label: 'Product created' },
  'product.updated':   { icon: Package, tone: 'blue', label: 'Product updated' },
  'inventory.updated': { icon: Layers, tone: 'amber', label: 'Inventory updated' },
  'inventory.reserved':{ icon: Layers, tone: 'amber', label: 'Stock reserved' },
  'inventory.released':{ icon: Layers, tone: 'amber', label: 'Stock released' },
  'order.received':    { icon: ShoppingCart, tone: 'green', label: 'Order received' },
  'order.processing':  { icon: ShoppingCart, tone: 'blue', label: 'Order processing' },
  'order.fulfilled':   { icon: CheckCircle, tone: 'green', label: 'Order fulfilled' },
  'order.cancelled':   { icon: XCircle, tone: 'red', label: 'Order cancelled' },
  'sync.started':      { icon: RefreshCw, tone: 'blue', label: 'Sync started' },
  'sync.completed':    { icon: CheckCircle, tone: 'green', label: 'Sync completed' },
  'sync.failed':       { icon: AlertTriangle, tone: 'red', label: 'Sync failed' },
  'integration.connected':   { icon: Zap, tone: 'green', label: 'Integration connected' },
  'integration.disconnected':{ icon: Zap, tone: 'red', label: 'Integration disconnected' },
}
const meta = (t) => EVENT_META[t] || { icon: Activity, tone: 'gray', label: t }

export default function Events() {
  const [events, setEvents] = useState(null)
  const [filter, setFilter] = useState('all')
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      const evs = await eventsAPI.list({ page_size: 100 })
      setEvents(evs || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load events.'))
      setEvents([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const types = useMemo(() => [...new Set((events || []).map((e) => e.event_type))].sort(), [events])
  const filtered = useMemo(
    () => (events || []).filter((e) => filter === 'all' || e.event_type === filter),
    [events, filter]
  )

  const exportCsv = () => {
    const rows = [['id', 'event_type', 'resource_type', 'resource_id', 'actor_id', 'created_at']]
      .concat(filtered.map((e) => [e.id, e.event_type, e.resource_type, e.resource_id, e.actor_id, e.created_at]))
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'vendrix-events.csv'
    a.click()
  }

  return (
    <div className="vx-page">
      <PageHeader title="Events" sub="The persistent domain-event log — every state change is recorded."
        crumbs={['Events']}
        actions={
          <button className="vx-btn vx-btn-secondary" onClick={exportCsv} disabled={!filtered.length}>
            <Download size={13} /> Export CSV
          </button>
        } />

      <div className="vx-toolbar">
        <button className={`vx-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span className="count">{(events || []).length}</span>
        </button>
        {types.slice(0, 10).map((t) => (
          <button key={t} className={`vx-chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(filter === t ? 'all' : t)}>{t}</button>
        ))}
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {events === null ? <LoadingRows rows={8} cols={3} /> : !filtered.length ? (
          <EmptyState icon={Activity} title="No events" sub={filter === 'all' ? 'Nothing recorded yet.' : 'No events of this type yet.'} />
        ) : (
          <div>
            {filtered.slice(0, 60).map((ev, i) => {
              const m = meta(ev.event_type)
              const Icon = m.icon
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 16px',
                  borderBottom: i < Math.min(filtered.length, 60) - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--surface-3)', color: 'var(--text-3)' }}>
                    <Icon size={14} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
                      <Badge tone={m.tone}>{ev.event_type}</Badge>
                      {ev.processed && <Badge tone="gray">processed</Badge>}
                    </div>
                    <div className="mono xs muted" style={{ marginTop: 2 }}>
                      {ev.resource_type}/{ev.resource_id}
                      {ev.actor_id ? ` · actor ${String(ev.actor_id).slice(0, 8)}` : ''}
                    </div>
                    {ev.payload && Object.keys(ev.payload).length > 0 && (
                      <pre className="xs" style={{
                        margin: '6px 0 0', padding: '8px 10px', background: 'var(--surface-2)',
                        border: '1px solid var(--border)', borderRadius: 8, overflowX: 'auto',
                        color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11,
                      }}>{JSON.stringify(ev.payload, null, 1)}</pre>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{timeAgo(ev.created_at)}</div>
                    <div className="xs muted">{fmtDate(ev.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
