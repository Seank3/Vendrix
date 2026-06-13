import React, { useState } from 'react'
import { User, Bell, Shield, Save, Zap, Key, Globe } from 'lucide-react'

const Section = ({ icon: Icon, title, children, delay = 0 }) => (
  <div className="vx-card animate-fade-up" style={{ padding: '1.75rem', animationDelay: `${delay}ms` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(61,142,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#60a5fa" />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{title}</span>
    </div>
    {children}
  </div>
)

const ToggleRow = ({ label, sub, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(30,42,58,0.5)' }}>
    <div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
    <label className="vx-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="vx-toggle-slider" />
    </label>
  </div>
)

const Settings = () => {
  const [profile, setProfile]   = useState({ name: 'Admin User', email: 'admin@vendrix.app', company: 'Vendrix Ltd' })
  const [notifs, setNotifs]     = useState({ emailOrders: true, emailUpdates: false, push: true, weeklyReport: true })
  const [saved, setSaved]       = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Settings</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Profile */}
        <Section icon={User} title="Profile" delay={0}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Company', key: 'company', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>{field.label}</label>
                <input
                  type={field.type}
                  value={profile[field.key]}
                  onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="vx-input"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" delay={60}>
          <div>
            <ToggleRow label="Order notifications" sub="Email me when a new order is placed" checked={notifs.emailOrders} onChange={e => setNotifs(p => ({ ...p, emailOrders: e.target.checked }))} />
            <ToggleRow label="Platform updates" sub="Receive emails about new features" checked={notifs.emailUpdates} onChange={e => setNotifs(p => ({ ...p, emailUpdates: e.target.checked }))} />
            <ToggleRow label="Push notifications" sub="Browser push alerts for activity" checked={notifs.push} onChange={e => setNotifs(p => ({ ...p, push: e.target.checked }))} />
            <ToggleRow label="Weekly summary" sub="A digest of your store's performance" checked={notifs.weeklyReport} onChange={e => setNotifs(p => ({ ...p, weeklyReport: e.target.checked }))} />
          </div>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security" delay={120}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>Current Password</label>
              <input type="password" className="vx-input" placeholder="••••••••" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>New Password</label>
                <input type="password" className="vx-input" placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>Confirm Password</label>
                <input type="password" className="vx-input" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>Session Timeout</label>
              <select style={{ background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.6rem 0.85rem', fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="0">Never</option>
              </select>
            </div>
          </div>
        </Section>

        {/* API */}
        <Section icon={Key} title="API Access" delay={180}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>API Key</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem',
                background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)',
                borderRadius: 8, padding: '0.65rem 1rem', color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}>
                vx_live_••••••••••••••••••••••••
              </div>
            </div>
            <button className="vx-btn-ghost" style={{ marginTop: 20 }}>
              <Zap size={14} />
              Regenerate
            </button>
          </div>
        </Section>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="vx-btn-ghost">Discard changes</button>
          <button className="vx-btn-primary" onClick={handleSave}>
            {saved ? (
              <><span>✓</span> Saved!</>
            ) : (
              <><Save size={15} /> Save changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
