import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Users as UsersIcon, UserPlus, RefreshCw, Shield } from 'lucide-react'
import { authAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, StatCard, Badge, Modal, Field, EmptyState, LoadingRows, fetchError, fmtDate, initials } from '../components/ui'

const ROLE_TONE = { admin: 'purple', operator: 'blue', viewer: 'gray' }
const EMPTY_FORM = { email: '', password: '', first_name: '', last_name: '', role: 'viewer' }

export default function Users() {
  const [users, setUsers] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      setUsers(await authAPI.users.list())
    } catch (e) {
      toast.error(fetchError(e, 'Could not load team members.'))
      setUsers([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const u = users || []
    return {
      total: u.length,
      admins: u.filter((x) => x.role === 'admin').length,
      operators: u.filter((x) => x.role === 'operator').length,
    }
  }, [users])

  const invite = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      await authAPI.users.create({ ...form, first_name: form.first_name, last_name: form.last_name })
      toast.success(`${form.email} invited as ${form.role}.`)
      setInviteOpen(false); setForm(EMPTY_FORM)
      await load()
    } catch (ex) {
      setErr(fetchError(ex))
    } finally { setBusy(false) }
  }

  return (
    <div className="vx-page">
      <PageHeader title="Team" sub="Organization members and their access roles."
        crumbs={['Team']}
        actions={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>
            <button className="vx-btn vx-btn-primary" onClick={() => { setForm(EMPTY_FORM); setErr(''); setInviteOpen(true) }}><UserPlus size={14} /> Invite member</button>
          </>
        } />

      <div className="grid grid-3" style={{ gap: 14, marginBottom: 16 }}>
        <StatCard icon={UsersIcon} label="Members" value={users ? counts.total : '…'} sub="in this organization" />
        <StatCard icon={Shield} label="Admins" value={users ? counts.admins : '…'} sub="full control" tone="purple" />
        <StatCard icon={UsersIcon} label="Operators" value={users ? counts.operators : '…'} sub="write access" tone="blue" />
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        {users === null ? <LoadingRows rows={5} cols={5} /> : !users.length ? (
          <EmptyState icon={UsersIcon} title="No members yet" sub="Invite your first team member to collaborate." />
        ) : (
          <div className="vx-table-wrap">
            <table className="vx-table">
              <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="vx-avatar">{initials(`${u.first_name} ${u.last_name}` || u.email)}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.email}</div>
                          {u.first_name || u.last_name ? <div className="xs muted">{u.email}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td><Badge tone={ROLE_TONE[u.role] || 'gray'} dot>{u.role}</Badge></td>
                    <td><Badge tone={u.is_active ? 'green' : 'red'} dot>{u.is_active ? 'active' : 'inactive'}</Badge></td>
                    <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a team member"
        footer={
          <>
            <button className="vx-btn vx-btn-secondary" onClick={() => setInviteOpen(false)}>Cancel</button>
            <button className="vx-btn vx-btn-primary" disabled={busy || !form.email || !form.password} onClick={invite}>{busy ? 'Inviting…' : 'Send invite'}</button>
          </>
        }>
        {err && <div className="vx-form-error">{err}</div>}
        <Field label="Email"><input className="vx-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="colleague@company.com" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="First name"><input className="vx-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
          <Field label="Last name"><input className="vx-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
        </div>
        <Field label="Temporary password" hint="Share it securely — there is no email delivery in dev yet.">
          <input className="vx-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min. 8 characters" />
        </Field>
        <Field label="Role">
          <select className="vx-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="viewer">Viewer — read only</option>
            <option value="operator">Operator — manage catalog, stock, orders</option>
            <option value="admin">Admin — full control</option>
          </select>
        </Field>
      </Modal>
    </div>
  )
}
