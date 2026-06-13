import React, { useState, useEffect } from 'react'
import { Search, UserPlus, Users as UsersIcon } from 'lucide-react'
import { getRecentUsers, getUserStats, IS_DEMO } from '../data/demoData'
import { usersAPI } from '../services/api'

const Skeleton = ({ w = '100%', h = 16, style = {} }) => (
  <div className="vx-skeleton" style={{ width: w, height: h, ...style }} />
)

const statusBadge = (status) => {
  if (status?.toLowerCase() === 'active') return 'vx-badge vx-badge-success'
  if (status?.toLowerCase() === 'inactive') return 'vx-badge vx-badge-danger'
  return 'vx-badge vx-badge-muted'
}

const roleBadge = (role) => {
  if (role?.toLowerCase() === 'admin') return 'vx-badge vx-badge-danger'
  if (role?.toLowerCase() === 'manager' || role?.toLowerCase() === 'business account') return 'vx-badge vx-badge-info'
  return 'vx-badge vx-badge-muted'
}

const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'

const avatarColors = ['#3d8ef0', '#34d399', '#c084fc', '#fbbf24', '#f87171']

const Users = () => {
  const [users, setUsers]     = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await usersAPI.getUsers()
        setUsers(data.results || data || [])
      } catch {
        if (IS_DEMO) {
          await new Promise(r => setTimeout(r, 450))
          setUsers(getRecentUsers())
          setStats(getUserStats())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Users</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage accounts and permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="vx-input"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: 220 }}
            />
          </div>
          <button className="vx-btn-primary">
            <UserPlus size={15} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Users', value: stats.total, color: '#60a5fa' },
            { label: 'Active', value: stats.active, color: '#34d399' },
            { label: 'Inactive', value: stats.inactive, color: '#f87171' },
            { label: 'New This Month', value: stats.newThisMonth, color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="vx-card animate-fade-up" style={{ padding: '1rem 1.25rem', animationDelay: `${i * 50}ms` }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.45rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="vx-card animate-fade-up" style={{ overflow: 'hidden', animationDelay: '200ms' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vx-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Skeleton w={32} h={32} style={{ borderRadius: '50%', flexShrink: 0 }} /><Skeleton w="60%" h={14} /></div></td>
                    {[1,2,3,4].map(j => <td key={j}><Skeleton h={14} w="70%" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <UsersIcon size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                    No users found
                  </td>
                </tr>
              ) : filtered.map((user, idx) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: avatarColors[idx % avatarColors.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                      }}>{initials(user.name)}</div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem' }}>{user.email}</td>
                  <td><span className={roleBadge(user.role)}>{user.role || 'User'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td><span className={statusBadge(user.status)}>{user.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users
