import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Users, Calendar } from 'lucide-react'
import { getAnalyticsData, IS_DEMO } from '../data/demoData'
import { analyticsAPI } from '../services/api'

const Skeleton = ({ w = '100%', h = 16, style = {} }) => (
  <div className="vx-skeleton" style={{ width: w, height: h, ...style }} />
)

const MetricCard = ({ title, value, sub, icon: Icon, color, delay = 0 }) => {
  const colors = {
    blue:   { bg: 'rgba(61,142,240,0.1)',  fg: '#60a5fa' },
    green:  { bg: 'rgba(16,185,129,0.1)', fg: '#34d399' },
    purple: { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
    amber:  { bg: 'rgba(245,158,11,0.1)', fg: '#fbbf24' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="vx-card vx-card-hover animate-fade-up" style={{ padding: '1.35rem', animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={c.fg} />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>{title}</span>
      </div>
      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

const BarChartViz = ({ data = [], labels = [], color = '#3d8ef0' }) => {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, padding: '0 4px' }}>
      {data.slice(-20).map((v, i) => {
        const label = labels.slice(-20)[i] || ''
        const h = (v / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
            title={`${label}: ${v}`}
          >
            <div style={{
              width: '100%', height: `${h}%`, minHeight: 3,
              background: i === data.slice(-20).length - 1
                ? color
                : `rgba(61,142,240,${0.2 + (i / data.slice(-20).length) * 0.5})`,
              borderRadius: '3px 3px 0 0',
              transition: `height 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 20}ms`,
              cursor: 'default',
            }} />
          </div>
        )
      })}
    </div>
  )
}

const Analytics = () => {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange]   = useState('30d')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const d = await analyticsAPI.getOverview(range)
        setData(d)
      } catch {
        if (IS_DEMO) {
          await new Promise(r => setTimeout(r, 500))
          setData(getAnalyticsData())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Analytics</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Track performance and business insights</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            style={{
              background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)',
              borderRadius: 8, color: 'var(--text-primary)', padding: '0.45rem 0.85rem',
              fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <MetricCard title="Total Revenue" value={loading ? '…' : `$${(data?.summary?.totalRevenue || 0).toLocaleString()}`} sub="Selected period" icon={TrendingUp} color="blue" delay={0} />
        <MetricCard title="Total Orders"  value={loading ? '…' : (data?.summary?.totalOrders || 0).toLocaleString()} sub="Orders processed" icon={ShoppingBag} color="green" delay={60} />
        <MetricCard title="Avg Order Value" value={loading ? '…' : `$${data?.summary?.averageOrderValue || 0}`} sub="Per transaction" icon={BarChart3} color="purple" delay={120} />
        <MetricCard title="Conversion Rate" value={loading ? '…' : data?.summary?.conversionRate || '0%'} sub="Visitor to buyer" icon={Users} color="amber" delay={180} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="vx-card animate-fade-up" style={{ padding: '1.5rem', animationDelay: '220ms' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Revenue Trend</div>
          {loading
            ? <Skeleton h={180} />
            : <BarChartViz data={data?.chartData?.revenue || []} labels={data?.chartData?.labels || []} color="#3d8ef0" />
          }
        </div>

        <div className="vx-card animate-fade-up" style={{ padding: '1.5rem', animationDelay: '280ms' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Daily Orders</div>
          {loading
            ? <Skeleton h={180} />
            : <BarChartViz data={data?.chartData?.projects || []} labels={data?.chartData?.labels || []} color="#34d399" />
          }
        </div>
      </div>

      {/* Top products */}
      <div className="vx-card animate-fade-up" style={{ animationDelay: '340ms', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Top Products</span>
        </div>
        {loading ? (
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} h={20} />)}
          </div>
        ) : (
          <table className="vx-table">
            <thead><tr><th>#</th><th>Product</th><th>Sales</th><th style={{ textAlign: 'right' }}>Revenue</th></tr></thead>
            <tbody>
              {(data?.topProducts || []).map((p, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem' }}>0{i+1}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.sales?.toLocaleString()} units</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>${p.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Analytics
