import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Warehouse, Layers, ArrowDownUp, AlertTriangle, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { inventoryAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, StatCard, Badge, Modal, Field, EmptyState, LoadingRows, fetchError, timeAgo } from '../components/ui'

const ENTRY_TONE = {
  adjustment: 'amber', reservation: 'blue', release: 'green', sync: 'purple',
  order_fulfillment: 'teal', initial: 'gray',
}

export default function Inventory() {
  const [levels, setLevels] = useState(null)
  const [ledger, setLedger] = useState([])
  const [tab, setTab] = useState('levels')
  const [adjustSku, setAdjustSku] = useState(null)
  const [form, setForm] = useState({ quantity_delta: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      const [lvs, lg] = await Promise.all([inventoryAPI.list(), inventoryAPI.ledger()])
      setLevels(lvs || [])
      setLedger(lg || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load inventory.'))
      setLevels([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totals = useMemo(() => {
    const l = levels || []
    return {
      skus: l.length,
      onHand: l.reduce((s, x) => s + x.quantity_on_hand, 0),
      reserved: l.reduce((s, x) => s + x.quantity_reserved, 0),
      low: l.filter((x) => x.quantity_available > 0 && x.quantity_available <= 5).length,
      out: l.filter((x) => x.quantity_available <= 0).length,
    }
  }, [levels])

  const openAdjust = (sku) => {
    setAdjustSku(sku); setForm({ quantity_delta: '', notes: '' }); setErr('')
  }

  const submitAdjust = async (e) => {
    e.preventDefault()
    const delta = parseInt(form.quantity_delta, 10)
    if (!Number.isFinite(delta) || delta === 0) { setErr('Enter a non-zero quantity delta (e.g. +10 or -3).'); return }
    setBusy(true); setErr('')
    try {
      const r = await inventoryAPI.adjust({ sku: adjustSku, quantity_delta: delta, notes: form.notes })
      toast.success(`${adjustSku}: ${delta > 0 ? '+' : ''}${delta} → ${r.level.quantity_on_hand} on hand.`)
      setAdjustSku(null)
      await load()
    } catch (ex) {
      setErr(fetchError(ex))
    } finally { setBusy(false) }
  }

  return (
    <div className="vx-page">
      <PageHeader title="Inventory" sub="Stock positions and the append-only ledger behind them."
        crumbs={['Inventory']}
        actions={<button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>} />

      <div className="grid grid-4" style={{ gap: 14, marginBottom: 16 }}>
        <StatCard icon={Layers} label="SKUs tracked" value={levels ? totals.skus : '…'} sub="active inventory levels" />
        <StatCard icon={Warehouse} label="Units on hand" value={levels ? totals.onHand.toLocaleString() : '…'} sub={`${totals.reserved.toLocaleString()} reserved`} tone="blue" />
        <StatCard icon={AlertTriangle} label="Low stock" value={levels ? totals.low : '…'} sub="≤ 5 units available" tone={totals.low ? 'amber' : 'green'} />
        <StatCard icon={ArrowDownUp} label="Out of stock" value={levels ? totals.out : '…'} sub="nothing available" tone={totals.out ? 'red' : 'green'} />
      </div>

      <div className="vx-tabs">
        <button className={`vx-tab ${tab === 'levels' ? 'active' : ''}`} onClick={() => setTab('levels')}><Warehouse size={14} /> Stock levels</button>
        <button className={`vx-tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}><SlidersHorizontal size={14} /> Ledger ({ledger.length})</button>
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {levels === null ? <LoadingRows rows={6} cols={5} /> : tab === 'levels' ? (
          !levels.length ? (
            <EmptyState icon={Warehouse} title="No stock levels yet" sub="Adjust stock for a SKU to create its first level." />
          ) : (
            <div className="vx-table-wrap">
              <table className="vx-table">
                <thead>
                  <tr><th>SKU</th><th className="right">On hand</th><th className="right">Reserved</th><th className="right">Available</th><th>Position</th><th>Updated</th><th style={{ width: 44 }} /></tr>
                </thead>
                <tbody>
                  {levels.map((l) => {
                    const avail = l.quantity_available
                    const pos = avail <= 0 ? 'out' : avail <= 5 ? 'low' : 'ok'
                    return (
                      <tr key={l.sku}>
                        <td className="mono" style={{ fontWeight: 600 }}>{l.sku}</td>
                        <td className="num">{l.quantity_on_hand}</td>
                        <td className="num" style={{ color: l.quantity_reserved ? 'var(--blue)' : 'var(--text-4)' }}>{l.quantity_reserved}</td>
                        <td className="num" style={{ fontWeight: 700, color: pos === 'out' ? 'var(--red)' : pos === 'low' ? 'var(--amber)' : 'var(--text)' }}>{avail}</td>
                        <td>
                          {pos === 'ok' ? <Badge tone="green" dot>In stock</Badge> : pos === 'low' ? <Badge tone="amber" dot>Low stock</Badge> : <Badge tone="red" dot>Out of stock</Badge>}
                        </td>
                        <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(l.updated_at)}</td>
                        <td>
                          <button className="vx-btn vx-btn-secondary vx-btn-sm" onClick={() => openAdjust(l.sku)}><ArrowDownUp size={12} /> Adjust</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          !ledger.length ? (
            <EmptyState icon={SlidersHorizontal} title="Ledger is empty" sub="Every stock movement will be recorded here." />
          ) : (
            <div className="vx-table-wrap">
              <table className="vx-table">
                <thead>
                  <tr><th>Entry</th><th>SKU</th><th>Type</th><th className="right">Delta</th><th className="right">After</th><th>Channel</th><th>Reference</th><th>Notes</th><th>When</th></tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.id}>
                      <td className="mono muted xs">{String(e.id).slice(0, 8)}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{e.sku}</td>
                      <td><Badge tone={ENTRY_TONE[e.entry_type] || 'gray'}>{e.entry_type.replace('_', ' ')}</Badge></td>
                      <td className="num" style={{ fontWeight: 600, color: e.quantity_delta >= 0 ? 'var(--green)' : 'var(--red)' }}>{e.quantity_delta > 0 ? '+' : ''}{e.quantity_delta}</td>
                      <td className="num">{e.quantity_after}</td>
                      <td>{e.channel || '—'}</td>
                      <td className="xs">{e.reference_type || '—'}{e.reference_id ? ` ${String(e.reference_id).slice(0, 8)}` : ''}</td>
                      <td className="truncate" style={{ maxWidth: 180, fontSize: 12 }}>{e.notes || ''}</td>
                      <td style={{ color: 'var(--text-4)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <Modal open={!!adjustSku} onClose={() => setAdjustSku(null)} title={`Adjust stock — ${adjustSku}`}
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setAdjustSku(null)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy} onClick={submitAdjust}>{busy ? 'Saving…' : 'Apply adjustment'}</button>
          </>
        }>
        {err && <div className="vx-form-error">{err}</div>}
        <Field label="Quantity delta" hint="Positive adds stock, negative removes it. The ledger never allows negative on-hand.">
          <input className="vx-input" type="number" value={form.quantity_delta} onChange={(e) => setForm({ ...form, quantity_delta: e.target.value })} placeholder="e.g. 10 or -3" autoFocus />
        </Field>
        <Field label="Notes"><input className="vx-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Supplier delivery" /></Field>
      </Modal>
    </div>
  )
}
