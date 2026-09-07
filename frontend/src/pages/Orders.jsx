import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ShoppingCart, Plus, RefreshCw, Search } from 'lucide-react'
import { ordersAPI, integrationsAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, Badge, Modal, Field, EmptyState, LoadingRows, fetchError, money, timeAgo, statusTone } from '../components/ui'

const STATUSES = ['received', 'processing', 'fulfilled', 'cancelled']

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [integrations, setIntegrations] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [channel, setChannel] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ channel: 'shopify', external_id: '', customer_name: '', sku: '', quantity: 1, unit_price: '' })
  const [err, setErr] = useState('')
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      const [os, is] = await Promise.all([ordersAPI.list(), integrationsAPI.list().catch(() => [])])
      setOrders(os || [])
      setIntegrations(is || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load orders.'))
      setOrders([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const channels = useMemo(() => [...new Set((orders || []).map((o) => o.channel))], [orders])
  const counts = useMemo(() => {
    const c = { all: (orders || []).length }
    STATUSES.forEach((s) => { c[s] = (orders || []).filter((o) => o.status === s).length })
    return c
  }, [orders])

  const filtered = useMemo(() => {
    let list = orders || []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((o) => (o.external_id + ' ' + (o.customer?.name || '') + ' ' + (o.customer?.email || '')).toLowerCase().includes(q))
    if (status !== 'all') list = list.filter((o) => o.status === status)
    if (channel !== 'all') list = list.filter((o) => o.channel === channel)
    return list
  }, [orders, search, status, channel])

  const changeStatus = async (o, newStatus) => {
    if (o.status === newStatus) return
    setBusyId(o.id)
    try {
      await ordersAPI.updateStatus(o.id, newStatus)
      toast.success(`Order #${o.external_id} → ${newStatus}.`)
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: newStatus } : x)))
    } catch (e) {
      toast.error(fetchError(e, 'Could not update order status.'))
    } finally { setBusyId(null) }
  }

  const createOrder = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const line_items = [{
        sku: form.sku, name: form.sku, quantity: parseInt(form.quantity, 10) || 1,
        unit_price: form.unit_price || '0',
      }]
      const integ = integrations.find((i) => i.platform === form.channel)
      await ordersAPI.create({
        channel: form.channel,
        external_id: form.external_id,
        customer: { name: form.customer_name, email: '' },
        line_items,
        integration_id: integ?.id || null,
      })
      toast.success(`Order #${form.external_id} ingested.`)
      setCreateOpen(false)
      setForm({ channel: 'shopify', external_id: '', customer_name: '', sku: '', quantity: 1, unit_price: '' })
      await load()
    } catch (ex) {
      setErr(fetchError(ex))
    }
  }

  return (
    <div className="vx-page">
      <PageHeader title="Orders" sub="Normalized orders from every connected channel."
        crumbs={['Orders']}
        actions={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>
            <button className="vx-btn vx-btn-primary" onClick={() => { setErr(''); setCreateOpen(true) }}><Plus size={14} /> Manual order</button>
          </>
        } />

      <div className="vx-toolbar">
        <div className="vx-searchbox">
          <Search size={13} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order # or customer…" style={{ width: 260 }} />
        </div>
        {channels.map((c) => (
          <button key={c} className={`vx-chip ${channel === c ? 'active' : ''}`} onClick={() => setChannel(channel === c ? 'all' : c)}>{c}</button>
        ))}
        <div style={{ flex: 1 }} />
        {STATUSES.map((s) => (
          <button key={s} className={`vx-chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(status === s ? 'all' : s)}>
            {s} <span className="count">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {orders === null ? <LoadingRows rows={6} cols={7} /> : !filtered.length ? (
          <EmptyState icon={ShoppingCart} title={search || status !== 'all' || channel !== 'all' ? 'No orders match your filters' : 'No orders yet'}
            sub={search || status !== 'all' || channel !== 'all' ? 'Try clearing the filters.' : 'Fetch orders from a connected channel or create a manual order.'} />
        ) : (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead>
                <tr><th>Order</th><th>Channel</th><th>Customer</th><th className="right">Items</th><th className="right">Total</th><th>Status</th><th>Received</th><th>Move to</th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{o.external_id}</td>
                    <td><Badge tone="gray">{o.channel}</Badge></td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{o.customer?.name || '—'}</div>
                      {o.customer?.email && <div className="xs muted">{o.customer.email}</div>}
                    </td>
                    <td className="num">{o.line_items?.reduce((s, l) => s + l.quantity, 0) || 0}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{money(o.total, o.currency)}</td>
                    <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                    <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(o.created_at)}</td>
                    <td>
                      <select className="vx-select" style={{ height: 30, fontSize: 12.5, width: 130, paddingRight: 26 }}
                        value={o.status} disabled={busyId === o.id}
                        onChange={(e) => changeStatus(o, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Ingest manual order"
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" onClick={createOrder}>Create order</button>
          </>
        }>
        {err && <div className="vx-form-error">{err}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Channel">
            <select className="vx-select" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {[...new Set([...channels, 'shopify', 'jumia', 'etsy', 'amazon'])].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="External ID"><input className="vx-input" value={form.external_id} onChange={(e) => setForm({ ...form, external_id: e.target.value })} placeholder="e.g. ORD-2201" required /></Field>
        </div>
        <Field label="Customer name"><input className="vx-input" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></Field>
        <div className="vx-divider" />
        <div className="xs muted fw-600" style={{ marginBottom: 8 }}>LINE ITEM</div>
        <Field label="SKU"><input className="vx-input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SHEA-500" required /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Quantity"><input className="vx-input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="Unit price"><input className="vx-input" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="12.50" /></Field>
        </div>
        <p className="hint" style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Stock is reserved automatically when the order is ingested.</p>
      </Modal>
    </div>
  )
}
