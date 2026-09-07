import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BarChart2, ShoppingCart, AlertTriangle, Activity, RefreshCw, Package } from 'lucide-react'
import { analyticsAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, StatCard, Badge, EmptyState, LoadingRows, fetchError, timeAgo, statusTone } from '../components/ui'

const DAYS_OPTIONS = [7, 14, 30, 90]

export default function Analytics() {
  const [days, setDays] = useState(30)
  const [overview, setOverview] = useState(null)
  const [byChannel, setByChannel] = useState(null)
  const [skuPerf, setSkuPerf] = useState(null)
  const [failures, setFailures] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToastStore()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ov, bc, sp, sf] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.ordersByChannel(days),
        analyticsAPI.skuPerformance(days),
        analyticsAPI.syncFailures(),
      ])
      setOverview(ov)
      setByChannel(bc || [])
      setSkuPerf(sp || [])
      setFailures(sf || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load analytics.'))
    } finally { setLoading(false) }
  }, [days])

  useEffect(() => { load() }, [load])

  const chart = useMemo(() => {
    // group raw snapshots by channel, then by day
    const byDay = {}
    ;(byChannel || []).forEach((s) => {
      byDay[s.period_start] = byDay[s.period_start] || {}
      byDay[s.period_start][s.channel] = s.count
    })
    const daysArr = Object.keys(byDay).sort()
    const channels = [...new Set((byChannel || []).map((s) => s.channel))]
    const totals = daysArr.map((d) => Object.values(byDay[d]).reduce((a, b) => a + b, 0))
    const max = Math.max(1, ...totals)
    return {
      labels: daysArr.map((d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      totals,
      max,
      channels,
      series: channels.map((c) => ({
        channel: c,
        values: daysArr.map((d) => byDay[d][c] || 0),
      })),
    }
  }, [byChannel])

  const topSku = useMemo(() => [...(skuPerf || [])].sort((a, b) => b.total_qty - a.total_qty).slice(0, 8), [skuPerf])

  return (
    <div className="vx-page">
      <PageHeader title="Analytics" sub="Orders, inventory and sync health over time."
        crumbs={['Analytics']}
        actions={
          <>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-3)', borderRadius: 8, padding: 3 }}>
              {DAYS_OPTIONS.map((d) => (
                <button key={d} className={`vx-chip ${days === d ? 'active' : ''}`} style={{ border: 'none', height: 26, padding: '0 9px', fontSize: 11.5, background: days === d ? 'var(--surface)' : 'transparent' }}
                  onClick={() => setDays(d)}>{d}d</button>
              ))}
            </div>
            <button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} className={loading ? 'vx-spin' : ''} /> Refresh</button>
          </>
        } />

      <div className="grid grid-4" style={{ gap: 14, marginBottom: 16 }}>
        <StatCard icon={ShoppingCart} label="Orders today" value={overview?.orders_today ?? '…'} sub="all channels" tone="blue" />
        <StatCard icon={ShoppingCart} label="Orders (7 days)" value={overview?.orders_week ?? '…'} sub="rolling week" tone="brand" />
        <StatCard icon={AlertTriangle} label="Unresolved sync failures" value={overview?.sync_failures_unresolved ?? '…'} sub="need attention" tone={(overview?.sync_failures_unresolved || 0) > 0 ? 'red' : 'green'} />
        <StatCard icon={Activity} label="Events today" value={overview?.events_today ?? '…'} sub="domain events" tone="purple" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.25fr 1fr', gap: 14 }} id="vx-analytics-grid">
        <style>{`@media(max-width:980px){#vx-analytics-grid{grid-template-columns:1fr !important;}}`}</style>

        {/* Orders by channel */}
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div className="vx-card-head">
            <span className="vx-card-title"><BarChart2 size={15} /> Orders by channel — last {days} days</span>
          </div>
          <div className="vx-card-body">
            {loading ? <div className="vx-bars">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="vx-skel" style={{ flex: 1, height: '100%' }} />)}</div>
              : !chart.labels.length ? <EmptyState icon={BarChart2} title="No order data yet" sub="Orders ingested from channels will chart here." />
              : (
                <>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                    {chart.channels.map((c) => (
                      <span key={c} className="small fw-600" style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="vx-dot vx-dot-brand" style={{ background: 'var(--brand)' }} /> {c}
                      </span>
                    ))}
                  </div>
                  <div className="vx-bars">
                    {chart.totals.map((t, i) => (
                      <div key={i} className="vx-bar" style={{ height: `${Math.max(3, (t / chart.max) * 100)}%` }}>
                        <span className="tip">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span className="xs muted">{chart.labels[0]}</span>
                    <span className="xs muted">{chart.labels[Math.floor(chart.labels.length / 2)]}</span>
                    <span className="xs muted">{chart.labels[chart.labels.length - 1]}</span>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* SKU performance */}
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div className="vx-card-head"><span className="vx-card-title"><Package size={15} /> Units sold by SKU — {days}d</span></div>
          {loading ? <LoadingRows rows={5} cols={2} /> : !topSku.length ? (
            <EmptyState icon={Package} title="No sales data" sub="Units sold appear here as orders are ingested." />
          ) : (
            <div style={{ padding: '6px 16px 12px' }}>
              {topSku.map((s, i) => {
                const max = topSku[0].total_qty || 1
                return (
                  <div key={s.sku} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                    <span className="mono xs" style={{ width: 22, color: 'var(--text-4)' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="small fw-600 truncate">{s.sku}</div>
                      <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(s.total_qty / max) * 100}%`, background: 'var(--brand)', borderRadius: 3 }} />
                      </div>
                    </div>
                    <span className="num fw-600" style={{ fontSize: 13 }}>{s.total_qty}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sync failures */}
      <div className="vx-card" style={{ overflow: 'hidden', marginTop: 14 }}>
        <div className="vx-card-head"><span className="vx-card-title"><AlertTriangle size={15} /> Sync failures</span></div>
        {loading ? <LoadingRows rows={3} cols={4} /> : !failures?.length ? (
          <EmptyState icon={AlertTriangle} title="No sync failures" sub="Every sync job is healthy. ✨" />
        ) : (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead><tr><th>Platform</th><th>Job type</th><th>Error</th><th className="right">Retries</th><th>Status</th><th>When</th></tr></thead>
              <tbody>
                {failures.slice(0, 10).map((f) => (
                  <tr key={f.id}>
                    <td><Badge tone="gray">{f.platform}</Badge></td>
                    <td style={{ fontWeight: 500 }}>{f.job_type.replace('_', ' ')}</td>
                    <td className="truncate" style={{ maxWidth: 320, color: 'var(--red)' }}>{f.error_message}</td>
                    <td className="num">{f.retry_count}</td>
                    <td><Badge tone={statusTone(f.resolved ? 'resolved' : 'failed')} dot>{f.resolved ? 'resolved' : 'unresolved'}</Badge></td>
                    <td style={{ color: 'var(--text-4)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(f.created_at)}</td>
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
