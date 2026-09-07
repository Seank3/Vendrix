import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plug, Plus, RefreshCw, ArrowUpRight, Download, Package, RotateCw } from 'lucide-react'
import { integrationsAPI, productsAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, Badge, Modal, Field, EmptyState, LoadingRows, fetchError, timeAgo, statusTone } from '../components/ui'

const PLATFORM_COLORS = {
  shopify: '#95BF47', jumia: '#F68B1F', etsy: '#F1641E', amazon: '#FF9900',
  tiktok_shop: '#010101', whatsapp_catalog: '#25D366', odoo: '#714B67',
}
const PLATFORM_CRED_FIELDS = {
  shopify: [{ key: 'shop_url', label: 'Shop URL', placeholder: 'your-store.myshopify.com', hint: 'Without https://' },
            { key: 'access_token', label: 'Admin API access token', placeholder: 'shpat_…', type: 'password' }],
  jumia: [{ key: 'store_id', label: 'Seller store ID', placeholder: 'VN-12345' },
          { key: 'api_key', label: 'API key', placeholder: '…', type: 'password' }],
  etsy: [{ key: 'api_key', label: 'API key string', placeholder: '…', type: 'password' },
         { key: 'secret', label: 'Shared secret', placeholder: '…', type: 'password' }],
  odoo: [{ key: 'base_url', label: 'Odoo base URL', placeholder: 'https://erp.example.com' },
         { key: 'api_key', label: 'API key', placeholder: '…', type: 'password' }],
  amazon: [{ key: 'seller_id', label: 'Seller ID', placeholder: 'A1B2C3…' },
           { key: 'api_key', label: 'MWS/SP-API key', placeholder: '…', type: 'password' }],
  tiktok_shop: [{ key: 'app_key', label: 'App key', placeholder: '…' },
                { key: 'secret', label: 'App secret', placeholder: '…', type: 'password' }],
  whatsapp_catalog: [{ key: 'phone_number_id', label: 'Phone number ID', placeholder: '…' },
                     { key: 'access_token', label: 'WhatsApp Business API token', placeholder: '…', type: 'password' }],
}
const FALLBACK_FIELDS = [{ key: 'api_key', label: 'API key', placeholder: '…', type: 'password' },
                         { key: 'secret', label: 'Secret', placeholder: '…', type: 'password' }]

export default function Integrations() {
  const [integrations, setIntegrations] = useState(null)
  const [platforms, setPlatforms] = useState([])
  const [jobs, setJobs] = useState([])
  const [products, setProducts] = useState([])
  const [connectOpen, setConnectOpen] = useState(false)
  const [form, setForm] = useState({ platform: 'shopify', name: '', credentials: {} })
  const [credFields, setCredFields] = useState(PLATFORM_CRED_FIELDS.shopify)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pushTarget, setPushTarget] = useState(null)
  const [pushSku, setPushSku] = useState('')
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      const [ints, plats, js] = await Promise.all([
        integrationsAPI.list(),
        integrationsAPI.platforms().catch(() => []),
        integrationsAPI.syncJobs().catch(() => []),
      ])
      setIntegrations(ints || [])
      setPlatforms(plats || [])
      setJobs(js || [])
    } catch (e) {
      toast.error(fetchError(e, 'Could not load integrations.'))
      setIntegrations([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openConnect = (platform, prefillName = '') => {
    const fields = PLATFORM_CRED_FIELDS[platform] || FALLBACK_FIELDS
    setCredFields(fields)
    setForm({ platform, name: prefillName || `${platform} store`, credentials: Object.fromEntries(fields.map((f) => [f.key, ''])) })
    setErr(''); setConnectOpen(true)
  }

  const connect = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      await integrationsAPI.create({ platform: form.platform, name: form.name, credentials: form.credentials })
      toast.success(`${form.name} connected.`)
      setConnectOpen(false)
      await load()
    } catch (ex) {
      setErr(fetchError(ex))
    } finally { setBusy(false) }
  }

  const pushProduct = async () => {
    const product = products.find((p) => p.sku === pushSku)
    if (!pushTarget || !product) return
    setBusy(true)
    try {
      await integrationsAPI.pushProduct(pushTarget.id, product.id)
      toast.success(`Pushed ${product.sku} → ${pushTarget.name}.`)
      setPushTarget(null)
      await load()
    } catch (ex) {
      toast.error(fetchError(ex, 'Push failed.'))
    } finally { setBusy(false) }
  }

  const fetchOrders = async (intg) => {
    setBusy(true)
    try {
      await integrationsAPI.fetchOrders(intg.id)
      toast.success(`Order fetch queued for ${intg.name}.`)
      await load()
    } catch (ex) {
      toast.error(fetchError(ex, 'Fetch failed.'))
    } finally { setBusy(false) }
  }

  const connected = useMemo(() => (integrations || []).filter((i) => i.status === 'connected'), [integrations])
  const jobTone = { pending: 'gray', running: 'blue', completed: 'green', failed: 'red', retrying: 'amber' }

  return (
    <div className="vx-page">
      <PageHeader title="Integrations" sub={`${connected.length} channel${connected.length === 1 ? '' : 's'} connected · every connector is pluggable`}
        crumbs={['Integrations']}
        actions={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>
            <button className="vx-btn vx-btn-primary" onClick={() => openConnect('shopify')}><Plus size={14} /> Connect channel</button>
          </>
        } />

      {/* Kanban — connected/pending channels */}
      {integrations === null ? (
        <div className="vx-kanban">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="vx-skel" style={{ height: 170, borderRadius: 12 }} />)}</div>
      ) : !integrations.length ? (
        <div className="vx-card"><EmptyState icon={Plug} title="No channels connected"
          sub="Connect Shopify, Jumia, Etsy, TikTok Shop, WhatsApp or Odoo. Development connectors simulate responses; live ones speak to the real APIs."
          action={<button className="vx-btn vx-btn-primary vx-btn-sm" onClick={() => openConnect('shopify')}><Plus size={13} /> Connect channel</button>} /></div>
      ) : (
        <div className="vx-kanban">
          {integrations.map((intg) => (
            <div className="vx-kanban-card" key={intg.id}>
              <div className="vx-kanban-head">
                <span className="vx-logo-tile" style={{ background: PLATFORM_COLORS[intg.platform] || 'linear-gradient(135deg,#6366F1,#4338CA)' }}>
                  {intg.platform[0].toUpperCase()}
                </span>
                <Badge tone={statusTone(intg.status)} dot>{intg.status}</Badge>
              </div>
              <div className="vx-kanban-body">
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 2 }}>{intg.name}</div>
                <div className="small muted" style={{ textTransform: 'capitalize' }}>{intg.platform.replace('_', ' ')}</div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div className="small text-3">Last sync <span className="fw-600" style={{ color: 'var(--text-2)' }}>{timeAgo(intg.last_sync_at)}</span></div>
                  {intg.last_error ? (
                    <div className="small" style={{ color: 'var(--red)', maxHeight: 54, overflow: 'hidden' }}>{intg.last_error}</div>
                  ) : (
                    <div className="small text-3">Config <span className="fw-600" style={{ color: 'var(--text-2)' }}>{Object.keys(intg.config || {}).length ? Object.keys(intg.config).length + ' keys' : 'default'}</span></div>
                  )}
                </div>
              </div>
              <div className="vx-kanban-foot">
                {intg.status === 'connected' ? (
                  <>
                    <button className="vx-btn vx-btn-secondary vx-btn-sm" disabled={busy} onClick={() => { productsAPI.list().then(setProducts).catch(() => setProducts([])); setPushTarget(intg); setPushSku('') }}>
                      <Package size={12} /> Push product
                    </button>
                    <button className="vx-btn vx-btn-secondary vx-btn-sm" disabled={busy} onClick={() => fetchOrders(intg)}>
                      <Download size={12} /> Fetch orders
                    </button>
                  </>
                ) : (
                  <button className="vx-btn vx-btn-primary vx-btn-sm" onClick={() => openConnect(intg.platform, intg.name)}>
                    <RotateCw size={12} /> Reconnect
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Available platforms */}
          {platforms.filter((p) => !integrations.some((i) => i.platform === p.id)).map((p) => (
            <div className="vx-kanban-card" key={p.id} style={{ borderStyle: 'dashed', boxShadow: 'none', background: 'var(--surface-2)' }}>
              <div className="vx-kanban-head">
                <span className="vx-logo-tile" style={{ background: PLATFORM_COLORS[p.id] || 'linear-gradient(135deg,#98A2B3,#667085)', opacity: 0.75 }}>
                  {p.id[0].toUpperCase()}
                </span>
                <span className="vx-badge vx-badge-gray">not connected</span>
              </div>
              <div className="vx-kanban-body">
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: 'var(--text-2)' }}>{p.name}</div>
                <div className="small muted">Available connector</div>
              </div>
              <div className="vx-kanban-foot">
                <button className="vx-btn vx-btn-secondary vx-btn-sm" onClick={() => openConnect(p.id)}><Plus size={12} /> Connect</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync jobs */}
      <div className="vx-card" style={{ overflow: 'hidden', marginTop: 18 }}>
        <div className="vx-card-head">
          <span className="vx-card-title"><RotateCw size={15} /> Sync jobs</span>
          <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>Activity stream <ArrowUpRight size={12} /></Link>
        </div>
        {jobs.length ? (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead><tr><th>Job</th><th>Channel</th><th>Type</th><th>Status</th><th className="right">Retries</th><th>Started</th><th>Finished</th></tr></thead>
              <tbody>
                {jobs.slice(0, 12).map((j) => (
                  <tr key={j.id}>
                    <td className="mono muted xs">{String(j.id).slice(0, 8)}</td>
                    <td><Badge tone="gray">{j.platform}</Badge></td>
                    <td style={{ fontWeight: 500 }}>{j.job_type.replace('_', ' ')}</td>
                    <td><Badge tone={jobTone[j.status] || 'gray'} dot>{j.status}</Badge></td>
                    <td className="num">{j.retry_count}</td>
                    <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(j.started_at)}</td>
                    <td style={{ fontSize: 12 }}>
                      {j.status === 'failed' ? <span style={{ color: 'var(--red)' }}>{j.error_message?.slice(0, 40) || 'failed'}</span> : <span style={{ color: 'var(--text-4)' }}>{timeAgo(j.completed_at)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : integrations === null ? <LoadingRows rows={3} cols={5} /> : (
          <EmptyState icon={RotateCw} title="No sync jobs yet" sub="Push a product or fetch orders to create one." />
        )}
      </div>

      {/* Connect modal */}
      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title="Connect a channel"
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setConnectOpen(false)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy} onClick={connect}>{busy ? 'Connecting…' : 'Connect'}</button>
          </>
        }>
        {err && <div className="vx-form-error">{err}</div>}
        <Field label="Platform">
          <select className="vx-select" value={form.platform}
            onChange={(e) => { const p = e.target.value; const f = PLATFORM_CRED_FIELDS[p] || FALLBACK_FIELDS; setCredFields(f); setForm({ platform: p, name: `${p} store`, credentials: Object.fromEntries(f.map((x) => [x.key, ''])) }) }}>
            {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Display name"><input className="vx-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <div className="vx-divider" />
        <div className="xs muted fw-600" style={{ marginBottom: 8 }}>CREDENTIALS — ENCRYPTED AT REST (FERNET)</div>
        {credFields.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            <input className="vx-input" type={f.type || 'text'} value={form.credentials[f.key] || ''}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, credentials: { ...form.credentials, [f.key]: e.target.value } })} />
          </Field>
        ))}
        <p className="hint" style={{ fontSize: 11.5, color: 'var(--text-4)' }}>
          Development connectors authenticate successfully with any values; live connectors validate against the platform.
        </p>
      </Modal>

      {/* Push product modal */}
      <Modal open={!!pushTarget} onClose={() => setPushTarget(null)} title={`Push product → ${pushTarget?.name || ''}`}
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setPushTarget(null)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy || !pushSku} onClick={pushProduct}>{busy ? 'Pushing…' : 'Push to channel'}</button>
          </>
        }>
        <Field label="Product" hint="Select from your master catalog.">
          <select className="vx-select" value={pushSku} onChange={(e) => setPushSku(e.target.value)}>
            <option value="">— choose a product —</option>
            {products.map((p) => <option key={p.id} value={p.sku}>{p.sku} · {p.name}</option>)}
          </select>
        </Field>
        <p className="hint" style={{ fontSize: 11.5, color: 'var(--text-4)' }}>Creates a sync job; external IDs are stored in the mapping table.</p>
      </Modal>
    </div>
  )
}
