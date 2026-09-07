import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, Plus, Search, Pencil, RefreshCw } from 'lucide-react'
import { productsAPI, inventoryAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, Badge, Modal, Field, EmptyState, LoadingRows, statusTone, fetchError, timeAgo } from '../components/ui'

const emptyForm = { sku: '', name: '', description: '', category: '', status: 'draft' }

export default function Products() {
  const [products, setProducts] = useState(null)
  const [levels, setLevels] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErr, setFormErr] = useState('')
  const toast = useToastStore()
  const [params] = useSearchParams()

  const load = useCallback(async (keep = false) => {
    if (!keep) setProducts(null)
    try {
      const [ps, ls] = await Promise.all([productsAPI.list(), inventoryAPI.list()])
      setLevels(Object.fromEntries((ls || []).map((l) => [l.sku, l])))
      setProducts(ps || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load products.'))
      setProducts([])
    }
  }, [])

  useEffect(() => {
    load(true)
    const q = params.get('q')
    if (q) setSearch(q)
  }, [params])

  const filtered = useMemo(() => {
    let list = products || []
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    if (filter !== 'all') list = list.filter((p) => (filter === 'in_stock' ? (levels[p.sku]?.quantity_available || 0) > 0 : filter === 'low' ? (levels[p.sku]?.quantity_available || 0) > 0 && (levels[p.sku]?.quantity_available || 0) <= 5 : (levels[p.sku]?.quantity_available || 0) <= 0))
    return list
  }, [products, search, filter, levels])

  const openCreate = () => { setForm(emptyForm); setFormErr(''); setCreateOpen(true) }
  const openEdit = (p) => {
    setForm({ sku: p.sku, name: p.name, description: p.description || '', category: p.category || '', status: p.status })
    setFormErr(''); setEditTarget(p)
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setFormErr('')
    try {
      if (editTarget) {
        await productsAPI.update(editTarget.id, { name: form.name, description: form.description, category: form.category, status: form.status })
        toast.success(`Product ${form.sku} updated.`)
      } else {
        await productsAPI.create({ ...form, attributes: {} })
        toast.success(`Product ${form.sku} created.`)
      }
      setCreateOpen(false); setEditTarget(null)
      await load()
    } catch (err) {
      setFormErr(fetchError(err))
    } finally { setBusy(false) }
  }

  const statusBadge = (s) => ({ active: 'green', draft: 'gray', archived: 'gray' }[s] || 'gray')

  return (
    <div className="vx-page">
      <PageHeader
        title="Products"
        sub={products ? `${filtered.length} of ${products.length} products · master catalog` : 'Master catalog'}
        crumbs={['Products']}
        actions={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => load()}><RefreshCw size={13} /> Refresh</button>
            <button className="vx-btn vx-btn-primary" onClick={openCreate}><Plus size={14} /> New product</button>
          </>
        }
      />

      <div className="vx-toolbar">
        <div className="vx-searchbox">
          <Search size={13} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU…" style={{ width: 280 }} />
        </div>
        {[['all', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['in_stock', 'In stock'], ['low', 'Low stock'], ['out', 'Out of stock']].map(([v, l]) => (
          <button key={v} className={`vx-chip ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {products === null ? <LoadingRows rows={6} cols={6} /> : !filtered.length ? (
          <EmptyState icon={Package} title={search ? 'No products match your search' : 'No products yet'}
            sub={search ? 'Try a different name or SKU.' : 'Create your first product to start syncing it to channels.'}
            action={!search && <button className="vx-btn vx-btn-primary vx-btn-sm" onClick={openCreate}><Plus size={13} /> New product</button>} />
        ) : (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead>
                <tr>
                  <th>SKU</th><th>Name</th><th>Category</th><th className="right">On hand</th><th className="right">Available</th><th>Status</th><th>Updated</th><th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const lv = levels[p.sku]
                  const avail = lv?.quantity_available ?? 0
                  return (
                    <tr key={p.id}>
                      <td className="mono" style={{ fontWeight: 600 }}>{p.sku}</td>
                      <td style={{ fontWeight: 500, maxWidth: 280, color: 'var(--text)' }}>
                        <div className="truncate">{p.name}</div>
                        {p.variants?.length > 0 && <div className="xs muted">{p.variants.length} variant(s)</div>}
                      </td>
                      <td>{p.category || <span className="muted">—</span>}</td>
                      <td className="num">{lv?.quantity_on_hand ?? '—'}</td>
                      <td className="num" style={{ fontWeight: avail === 0 ? 700 : 500, color: avail === 0 ? 'var(--red)' : avail <= 5 ? 'var(--amber)' : 'var(--text-2)' }}>{avail}</td>
                      <td><Badge tone={statusBadge(p.status)} dot>{p.status}</Badge></td>
                      <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(p.updated_at)}</td>
                      <td>
                        <button className="vx-icon-btn sm" title="Edit" onClick={() => openEdit(p)}><Pencil size={13} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / edit modal */}
      <Modal open={createOpen || !!editTarget} onClose={() => { setCreateOpen(false); setEditTarget(null) }}
        title={editTarget ? `Edit ${editTarget.sku}` : 'New product'}
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => { setCreateOpen(false); setEditTarget(null) }}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : editTarget ? 'Save changes' : 'Create product'}</button>
          </>
        }>
        {formErr && <div className="vx-form-error">{formErr}</div>}
        <Field label="SKU" hint={editTarget ? 'SKU is the catalog key and cannot be changed here.' : undefined}>
          <input className="vx-input" value={form.sku} disabled={!!editTarget} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        </Field>
        <Field label="Name"><input className="vx-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Category"><input className="vx-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Skincare" /></Field>
          <Field label="Status">
            <select className="vx-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <Field label="Description"><textarea className="vx-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </Modal>
    </div>
  )
}
