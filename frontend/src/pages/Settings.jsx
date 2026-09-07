import React, { useState, useEffect, useCallback } from 'react'
import { User, Building2, KeyRound, RefreshCw, Plus, Copy, Trash2, ShieldCheck, Lock } from 'lucide-react'
import { authAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, Badge, Modal, Field, EmptyState, LoadingRows, fetchError, fmtDate, timeAgo, initials } from '../components/ui'

export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [keys, setKeys] = useState(null)
  const [keyOpen, setKeyOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyScopes, setKeyScopes] = useState('read write')
  const [newKey, setNewKey] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toast = useToastStore()

  const loadKeys = useCallback(async () => {
    try { setKeys(await authAPI.apiKeys.list()) }
    catch (e) { toast.error(fetchError(e, 'Could not load API keys.')); setKeys([]) }
  }, [])

  const loadUser = useCallback(async () => {
    try { setUser(await authAPI.me()) }
    catch { try { setUser(JSON.parse(localStorage.getItem('auth_user') || 'null')) } catch { /* ignore */ } }
  }, [])

  useEffect(() => { loadUser(); loadKeys() }, [loadUser, loadKeys])

  const createKey = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const r = await authAPI.apiKeys.create({ name: keyName, scopes: keyScopes.split(/[\s,]+/).filter(Boolean) })
      setNewKey(r)
      setKeyOpen(false); setKeyName(''); setKeyScopes('read write')
      await loadKeys()
    } catch (ex) { setErr(fetchError(ex)) } finally { setBusy(false) }
  }

  const revoke = async (k) => {
    if (!window.confirm(`Revoke API key “${k.name}”? This cannot be undone.`)) return
    try {
      await authAPI.apiKeys.revoke(k.id)
      toast.success(`Key “${k.name}” revoked.`)
      await loadKeys()
    } catch (e) { toast.error(fetchError(e)) }
  }

  const copy = (v) => { navigator.clipboard?.writeText(v); toast.info('Copied to clipboard.') }

  const org = user?.organization

  return (
    <div className="vx-page">
      <PageHeader title="Settings" sub="Workspace profile, and machine access." crumbs={['Settings']} />

      <div className="vx-tabs">
        <button className={`vx-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><User size={14} /> Profile</button>
        <button className={`vx-tab ${tab === 'organization' ? 'active' : ''}`} onClick={() => setTab('organization')}><Building2 size={14} /> Organization</button>
        <button className={`vx-tab ${tab === 'keys' ? 'active' : ''}`} onClick={() => setTab('keys')}><KeyRound size={14} /> API keys</button>
      </div>

      {tab === 'profile' && (
        <div className="grid grid-2" style={{ gap: 14 }}>
          <div className="vx-card">
            <div className="vx-card-head"><span className="vx-card-title">Account</span></div>
            <div className="vx-card-body">
              {user === null ? <LoadingRows rows={3} cols={2} /> : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span className="vx-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{initials(`${user.first_name} ${user.last_name}` || user.email)}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.email}</div>
                      <div className="small muted">{user.email}</div>
                    </div>
                  </div>
                  <dl className="vx-kv">
                    <dt>Role</dt><dd><Badge tone={user.role === 'admin' ? 'purple' : user.role === 'operator' ? 'blue' : 'gray'} dot>{user.role}</Badge></dd>
                    <dt>Member since</dt><dd>{fmtDate(user.created_at)}</dd>
                    <dt>Status</dt><dd><Badge tone={user.is_active ? 'green' : 'red'} dot>{user.is_active ? 'active' : 'inactive'}</Badge></dd>
                    <dt>User ID</dt><dd className="mono xs">{user.id}</dd>
                  </dl>
                </>
              )}
            </div>
          </div>
          <div className="vx-card">
            <div className="vx-card-head"><span className="vx-card-title"><ShieldCheck size={15} /> Access model</span></div>
            <div className="vx-card-body" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
              <p>Vendrix enforces organization-scoped access. Every request must belong to your tenant, and permissions follow your role:</p>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><b>Admin</b> — manage members and API keys, plus all operator powers.</li>
                <li><b>Operator</b> — create products, adjust stock, ingest orders, run syncs.</li>
                <li><b>Viewer</b> — read everything, change nothing.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'organization' && (
        <div className="grid grid-2" style={{ gap: 14 }}>
          <div className="vx-card">
            <div className="vx-card-head"><span className="vx-card-title">Organization</span></div>
            <div className="vx-card-body">
              {org === undefined ? <LoadingRows rows={3} cols={2} /> : org ? (
                <dl className="vx-kv">
                  <dt>Name</dt><dd style={{ fontWeight: 700, fontSize: 15 }}>{org.name}</dd>
                  <dt>Slug</dt><dd className="mono">{org.slug}</dd>
                  <dt>Status</dt><dd><Badge tone={org.is_active ? 'green' : 'red'} dot>{org.is_active ? 'active' : 'inactive'}</Badge></dd>
                  <dt>Organization ID</dt><dd className="mono xs">{org.id}</dd>
                  <dt>Created</dt><dd>{fmtDate(org.created_at)}</dd>
                </dl>
              ) : (
                <EmptyState icon={Building2} title="Organization info unavailable" sub="Sign in again to refresh your session." />
              )}
            </div>
          </div>
          <div className="vx-card">
            <div className="vx-card-head"><span className="vx-card-title"><Lock size={15} /> Data isolation</span></div>
            <div className="vx-card-body" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
              <p>All records — products, stock levels, orders, sync jobs, events and metrics — are keyed by your organization id and scoped on every query. Integration credentials are encrypted with Fernet at rest and never returned by the API.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'keys' && (
        <div className="vx-card" style={{ overflow: 'hidden' }}>
          <div className="vx-card-head">
            <span className="vx-card-title"><KeyRound size={15} /> API keys</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="vx-btn vx-btn-secondary vx-btn-sm" onClick={loadKeys}><RefreshCw size={12} /> Refresh</button>
              <button className="vx-btn vx-btn-primary vx-btn-sm" onClick={() => { setErr(''); setKeyOpen(true) }}><Plus size={13} /> New key</button>
            </div>
          </div>
          {keys === null ? <LoadingRows rows={3} cols={4} /> : !keys.length ? (
            <EmptyState icon={KeyRound} title="No API keys yet"
              sub="Keys let integrations and machines authenticate as your organization (Authorization: Api-Key vx_…)." />
          ) : (
            <div className="vx-table-wrap">
              <table className="vx-table">
                <thead><tr><th>Name</th><th>Prefix</th><th>Scopes</th><th>Last used</th><th>Created</th><th style={{ width: 60 }} /></tr></thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{k.name}</td>
                      <td className="mono">{k.prefix}…</td>
                      <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(k.scopes || []).length ? k.scopes.map((s) => <Badge key={s} tone="gray">{s}</Badge>) : <span className="muted xs">—</span>}</div></td>
                      <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{timeAgo(k.last_used_at)}</td>
                      <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmtDate(k.created_at)}</td>
                      <td><button className="vx-icon-btn sm" title="Revoke" onClick={() => revoke(k)}><Trash2 size={13} style={{ color: 'var(--red)' }} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New key modal */}
      <Modal open={keyOpen} onClose={() => setKeyOpen(false)} title="Create API key"
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setKeyOpen(false)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy || !keyName} onClick={createKey}>{busy ? 'Creating…' : 'Create key'}</button>
          </>
        }>
        {err && <div className="vx-form-error">{err}</div>}
        <Field label="Key name"><input className="vx-input" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. fulfillment-bot" autoFocus /></Field>
        <Field label="Scopes" hint="Space or comma separated — informational for now."><input className="vx-input" value={keyScopes} onChange={(e) => setKeyScopes(e.target.value)} /></Field>
      </Modal>

      {/* Raw key reveal */}
      <Modal open={!!newKey} onClose={() => setNewKey(null)} title="API key created" wide>
        <p className="small" style={{ color: 'var(--text-2)', marginBottom: 10 }}>
          <b>Copy this key now</b> — it is shown only once. Authenticate with the header <code className="mono" style={{ fontSize: 11.5 }}>Authorization: Api-Key &lt;key&gt;</code>.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <code className="mono" style={{
            flex: 1, padding: '10px 12px', background: 'var(--brand-soft)', border: '1px solid var(--brand-border)',
            borderRadius: 8, color: 'var(--brand-700)', fontSize: 12.5, overflowX: 'auto', whiteSpace: 'nowrap',
          }}>{newKey.raw_key}</code>
          <button className="vx-btn vx-btn-secondary" onClick={() => copy(newKey.raw_key)}><Copy size={13} /> Copy</button>
        </div>
        <p className="hint" style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-4)' }}>Prefix {newKey.api_key.prefix}… · created {fmtDate(newKey.api_key.created_at)}</p>
      </Modal>
    </div>
  )
}
