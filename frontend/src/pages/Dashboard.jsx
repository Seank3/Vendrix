import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart, Package, Plug, Activity, ArrowUpRight, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Zap, Layers,
} from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, StatCard, Badge, EmptyState, LoadingRows, timeAgo, money, statusTone } from '../components/ui'

const EVENT_META = {
  'product.created':   { icon: Package,   tone: 'blue',   label: 'Product created' },
  'product.updated':   { icon: Package,   tone: 'blue',   label: 'Product updated' },
  'inventory.updated': { icon: Layers,    tone: 'amber',  label: 'Inventory updated' },
  'inventory.reserved':{ icon: Layers,    tone: 'amber',  label: 'Stock reserved' },
  'inventory.released':{ icon: Layers,    tone: 'amber',  label: 'Stock released' },
  'order.received':    { icon: ShoppingCart, tone: 'green', label: 'Order received' },
  'order.processing':  { icon: ShoppingCart, tone: 'blue',  label: 'Order processing' },
  'order.fulfilled':   { icon: CheckCircle, tone: 'green', label: 'Order fulfilled' },
  'order.cancelled':   { icon: XCircle,   tone: 'red',    label: 'Order cancelled' },
  'sync.started':      { icon: RefreshCw, tone: 'blue',   label: 'Sync started' },
  'sync.completed':    { icon: CheckCircle, tone: 'green', label: 'Sync completed' },
  'sync.failed':       { icon: AlertTriangle, tone: 'red', label: 'Sync failed' },
  'integration.connected':   { icon: Zap, tone: 'green', label: 'Integration connected' },
  'integration.disconnected':{ icon: Zap, tone: 'red',   label: 'Integration disconnected' },
}
const eventMeta = (t) => EVENT_META[t] || { icon: Activity, tone: 'gray', label: t }

const PLATFORM_COLORS = {
  shopify: '#95BF47', jumia: '#F68B1F', etsy: '#F1641E', amazon: '#FF9900',
  tiktok_shop: '#010101', whatsapp_catalog: '#25D366', odoo: '#714B67',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToastStore()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await dashboardAPI.getOverview())
    } catch (e) {
      toast.error('Could not load dashboard data.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const m = data?.metrics || {}

  return (
    <div className="vx-page">
      <PageHeader
        title="Dashboard"
        sub="System status and activity across all connected channels."
        crumbs={[]}
        actions={
          <button className="vx-btn vx-btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'vx-spin' : ''} /> Refresh
          </button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-4" style={{ gap: 14, marginBottom: 18 }}>
        <StatCard icon={ShoppingCart} label="Orders today" value={loading ? '…' : m.orders_today} sub="across all channels" tone="blue" />
        <StatCard icon={Package} label="Products" value={loading ? '…' : m.products_synced} sub="in master catalog" tone="brand" />
        <StatCard icon={Plug} label="Integrations" value={loading ? '…' : `${m.active_integrations ?? '—'}/${m.integrations_total ?? '—'}`} sub="connected channels" tone="green" />
        <StatCard icon={Activity} label="Inventory health" value={loading ? '…' : `${m.inventory_health ?? 0}%`} sub={m.low_stock ? `${m.low_stock} SKUs low stock` : 'all SKUs healthy'} tone={m.low_stock ? 'amber' : 'green'} />
      </div>

      {/* Activity + Integration health */}
      <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: 14, marginBottom: 18 }} id="vx-mid-grid">
        <style>{`@media(max-width:980px){#vx-mid-grid{grid-template-columns:1fr !important;}}`}</style>

        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div className="vx-card-head">
            <span className="vx-card-title"><Activity size={15} /> Recent activity</span>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <LoadingRows rows={5} cols={3} />
          ) : !data?.events?.length ? (
            <EmptyState icon={Activity} title="No activity yet" sub="Events will appear here as your channels sync." />
          ) : (
            data.events.map((ev, i) => {
              const meta = eventMeta(ev.event_type)
              const Icon = meta.icon
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px',
                  borderBottom: i < data.events.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--surface-3)', color: 'var(--text-3)' }}>
                    <Icon size={14} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{meta.label}</span>
                      <Badge tone={meta.tone} dot>{ev.event_type.split('.')[0]}</Badge>
                    </div>
                    <div className="truncate" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      <span className="mono" style={{ fontSize: 11 }}>{ev.resource_id}</span>
                      {ev.payload?.error ? ` · ${ev.payload.error}` : ev.payload?.channel ? ` · ${ev.payload.channel}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0 }}>{timeAgo(ev.created_at)}</span>
                </div>
              )
            })
          )}
        </div>

        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div className="vx-card-head">
            <span className="vx-card-title"><Plug size={15} /> Integration health</span>
            <Link to="/integrations" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <LoadingRows rows={4} cols={3} />
          ) : !data?.integrations?.length ? (
            <EmptyState icon={Plug} title="No integrations yet" sub="Connect Shopify, Jumia, Etsy and more to get started."
              action={<Link to="/integrations" className="vx-btn vx-btn-primary vx-btn-sm" style={{ marginTop: 4 }}>Connect a channel</Link>} />
          ) : (
            data.integrations.map((intg, i) => (
              <div key={intg.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < data.integrations.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span className="vx-logo-tile" style={{ background: PLATFORM_COLORS[intg.platform] || 'linear-gradient(135deg,#6366F1,#4338CA)', fontSize: 15 }}>
                  {intg.platform[0].toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 1 }}>{intg.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Last sync {timeAgo(intg.last_sync_at)} · {intg.platform.replace('_', ' ')}</div>
                </div>
                {intg.last_error && <Badge tone="red" dot>error</Badge>}
                <Badge tone={statusTone(intg.status)} dot>{intg.status}</Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="vx-card" style={{ overflow: 'hidden' }}>
        <div className="vx-card-head">
          <span className="vx-card-title"><ShoppingCart size={15} /> Recent orders</span>
          <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>
            All orders <ArrowUpRight size={12} />
          </Link>
        </div>
        {loading ? (
          <LoadingRows rows={4} cols={6} />
        ) : !data?.orders?.length ? (
          <EmptyState icon={ShoppingCart} title="No orders yet" sub="Orders ingested from connected channels will appear here." />
        ) : (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead>
                <tr>
                  <th>Order</th><th>Channel</th><th>Customer</th><th className="right">Items</th><th className="right">Total</th><th>Status</th><th>Received</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/orders`} className="mono" style={{ fontWeight: 600, color: 'var(--brand)' }}>#{o.external_id}</Link></td>
                    <td><Badge tone="gray">{o.channel}</Badge></td>
                    <td>{o.customer?.name || o.customer?.email || '—'}</td>
                    <td className="num">{o.line_items?.reduce((s, l) => s + l.quantity, 0) || 0}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{money(o.total, o.currency)}</td>
                    <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                    <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
