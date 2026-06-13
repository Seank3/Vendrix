import React, { useState, useEffect } from 'react'
import { Package, Plug, Warehouse, ShoppingCart, RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const DEMO = {
  metrics: { products_synced: 1284, active_integrations: 4, inventory_health: 94, orders_today: 37 },
  activity: [
    { id: 1, type: 'Order Received',      source: 'Jumia',    time: '2 min ago',  status: 'success', detail: 'ORD-00892 · $124.00' },
    { id: 2, type: 'Inventory Updated',   source: 'Shopify',  time: '8 min ago',  status: 'success', detail: 'SKU-4421 · stock adjusted' },
    { id: 3, type: 'Integration Synced',  source: 'WhatsApp', time: '14 min ago', status: 'success', detail: '12 orders ingested' },
    { id: 4, type: 'Product Published',   source: 'Odoo',     time: '31 min ago', status: 'success', detail: 'Summer Collection (18 items)' },
    { id: 5, type: 'Sync Error',          source: 'Jumia',    time: '1 hr ago',   status: 'error',   detail: 'Rate limit hit · retrying' },
    { id: 6, type: 'Order Received',      source: 'WhatsApp', time: '1 hr ago',   status: 'success', detail: 'ORD-00891 · $56.00' },
  ],
  integrations: [
    { name: 'Shopify',   logo: '🛒', status: 'healthy', last_sync: '2 min ago',  orders: 847,  uptime: '99.9%' },
    { name: 'Jumia',     logo: '🌍', status: 'healthy', last_sync: '8 min ago',  orders: 1203, uptime: '99.4%' },
    { name: 'WhatsApp',  logo: '💬', status: 'warning', last_sync: '14 min ago', orders: 412,  uptime: '97.1%' },
    { name: 'Odoo ERP',  logo: '🔧', status: 'healthy', last_sync: '1 hr ago',   orders: null, uptime: '100%' },
  ],
  sync_jobs: [
    { id: 'JOB-001', label: 'Jumia → Inventory', status: 'running',   started: '1 min ago',   progress: 67 },
    { id: 'JOB-002', label: 'Shopify orders',     status: 'completed', started: '8 min ago',   progress: 100 },
    { id: 'JOB-003', label: 'WhatsApp ingestion', status: 'pending',   started: '—',           progress: 0 },
    { id: 'JOB-004', label: 'Odoo product sync',  status: 'failed',    started: '32 min ago',  progress: 41 },
    { id: 'JOB-005', label: 'Price reconciliation', status: 'completed', started: '1 hr ago',  progress: 100 },
  ]
}

const MetricCard = ({ icon: Icon, label, value, sub, color = 'var(--indigo)', loading }) => (
  <div className="vx-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} color={color} strokeWidth={1.8} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
      {loading
        ? <div className="vx-skel" style={{ width: 80, height: 22, marginBottom: 4 }} />
        : <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      }
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
    </div>
  </div>
)

const statusDot = (s) => ({ healthy: 'vx-dot-green', warning: 'vx-dot-amber', error: 'vx-dot-red', success: 'vx-dot-green' }[s] || 'vx-dot-gray')
const statusBadge = (s) => ({ healthy: 'vx-badge-green', warning: 'vx-badge-amber', error: 'vx-badge-red', success: 'vx-badge-green' }[s] || 'vx-badge-gray')
const jobBadge = (s) => ({ running: 'vx-badge-blue', completed: 'vx-badge-green', pending: 'vx-badge-gray', failed: 'vx-badge-red' }[s] || 'vx-badge-gray')
const jobIcon = (s) => {
  const props = { size: 12 }
  if (s === 'running')   return <RefreshCw {...props} style={{ animation: 'spin 1.2s linear infinite' }} />
  if (s === 'completed') return <CheckCircle {...props} />
  if (s === 'failed')    return <XCircle {...props} />
  return <Clock {...props} />
}

const SectionHeader = ({ title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
    {action && <a href={action.href} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--indigo)', fontWeight: 500 }}>{action.label} <ArrowUpRight size={12} /></a>}
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try { const d = await dashboardAPI.getMetrics(); setData(d) }
      catch { await new Promise(r => setTimeout(r, 700)); setData(DEMO) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const d = data || DEMO

  return (
    <div className="vx-page">
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Operational Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>System status and activity across all connected channels.</p>
      </div>

      {/* Section 1: Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard icon={Package}      label="Products Synced"      value={d.metrics?.products_synced?.toLocaleString()}      sub="Across all channels"         color="var(--indigo)" loading={loading} />
        <MetricCard icon={Plug}         label="Active Integrations"  value={d.metrics?.active_integrations}                   sub="4 channels connected"        color="#059669"       loading={loading} />
        <MetricCard icon={Warehouse}    label="Inventory Health"     value={`${d.metrics?.inventory_health}%`}                sub="Items correctly stocked"     color="#D97706"       loading={loading} />
        <MetricCard icon={ShoppingCart} label="Orders Today"         value={d.metrics?.orders_today}                          sub="Across all channels"         color="#2563EB"       loading={loading} />
      </div>

      {/* Section 2+3: Activity + Integration Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16, marginBottom: 24 }} id="vx-mid-grid">
        <style>{`@media(max-width:900px){#vx-mid-grid{grid-template-columns:1fr !important;}}`}</style>

        {/* Activity feed */}
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <SectionHeader title="Recent Activity" action={{ label: 'View events', href: '/events' }} />
          </div>
          <div>
            {(d.activity || []).map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '11px 16px',
                borderBottom: i < d.activity.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span className={`vx-dot ${statusDot(item.status)}`} style={{ marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.type}</span>
                    <span className="vx-badge vx-badge-gray" style={{ fontSize: 10.5 }}>{item.source}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.detail}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration health */}
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <SectionHeader title="Integration Health" action={{ label: 'Manage', href: '/integrations' }} />
          </div>
          <div>
            {(d.integrations || []).map((intg, i) => (
              <div key={intg.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i < d.integrations.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{intg.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{intg.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Last sync {intg.last_sync} · {intg.uptime} uptime</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span className={`vx-badge ${statusBadge(intg.status)}`} style={{ textTransform: 'capitalize' }}>
                    <span className={`vx-dot ${statusDot(intg.status)}`} style={{ width: 5, height: 5 }} />
                    {intg.status}
                  </span>
                  {intg.orders && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{intg.orders.toLocaleString()} orders</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Sync jobs */}
      <div className="vx-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <SectionHeader title="Sync Queue" />
        </div>
        <table className="vx-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Task</th>
              <th>Status</th>
              <th>Started</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {(d.sync_jobs || []).map(job => (
              <tr key={job.id}>
                <td className="mono">{job.id}</td>
                <td style={{ fontWeight: 500 }}>{job.label}</td>
                <td>
                  <span className={`vx-badge ${jobBadge(job.status)}`} style={{ gap: 4 }}>
                    {jobIcon(job.status)}
                    <span style={{ textTransform: 'capitalize' }}>{job.status}</span>
                  </span>
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 12.5 }}>{job.started}</td>
                <td style={{ width: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bg-muted)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${job.progress}%`,
                        background: job.status === 'failed' ? 'var(--red)' : job.status === 'completed' ? 'var(--green)' : 'var(--indigo)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', minWidth: 28 }}>{job.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
