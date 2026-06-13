import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Package, ArrowUpDown } from 'lucide-react'
import { getRecentOrders, IS_DEMO } from '../data/demoData'
import { projectsAPI } from '../services/api'

const Skeleton = ({ w = '100%', h = 16, style = {} }) => (
  <div className="vx-skeleton" style={{ width: w, height: h, ...style }} />
)

const statusBadge = (status) => {
  const map = {
    completed:   'vx-badge vx-badge-success',
    pending:     'vx-badge vx-badge-warning',
    in_progress: 'vx-badge vx-badge-info',
    cancelled:   'vx-badge vx-badge-danger',
  }
  return map[status?.toLowerCase()] || 'vx-badge vx-badge-muted'
}

const Orders = () => {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectsAPI.getProjects()
        const raw = data.results || data || []
        setOrders(raw.map(o => ({
          id: o.order_id || `#${o.id}`,
          customer: o.customer_name || 'N/A',
          platform: o.platform || 'Shopify',
          status: o.status,
          amount: o.total_amount || 0,
          date: o.created_at,
        })))
      } catch {
        if (IS_DEMO) {
          await new Promise(r => setTimeout(r, 500))
          setOrders(getRecentOrders().map(o => ({
            id: o.id, customer: o.customer,
            platform: 'Shopify', status: o.status,
            amount: o.amount, date: o.date, product: o.product,
          })))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q || o.id?.toLowerCase().includes(q) || o.customer?.toLowerCase().includes(q) || o.product?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Orders</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage and track all your orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="vx-input"
              placeholder="Search orders…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: 220 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            style={{
              background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)',
              borderRadius: 8, color: 'var(--text-primary)', padding: '0.55rem 0.85rem',
              fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="vx-card animate-fade-up" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vx-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Platform</th>
                <th>Product</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j}><Skeleton h={14} w="75%" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Package size={36} style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }} />
                    No orders found
                  </td>
                </tr>
              ) : filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{order.id}</td>
                  <td style={{ fontWeight: 500 }}>{order.customer}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span className="vx-badge vx-badge-muted">{order.platform}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{order.product || '—'}</td>
                  <td><span className={statusBadge(order.status)}>{order.status?.replace('_', ' ')}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>${Number(order.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
