import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authAPI } from '../services/api'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await authAPI.login({ email, password })
      if (r.token) { localStorage.setItem('auth_token', r.token); navigate('/dashboard') }
      else setError('Invalid response from server.')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Incorrect email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      {/* Left panel — branding */}
      <div style={{
        width: '42%', background: 'var(--indigo)',
        display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px',
      }} id="vx-login-panel">
        <style>{`@media(min-width:960px){#vx-login-panel{display:flex !important;}}`}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="3" cy="4" r="1.7" fill="white"/>
              <circle cx="13" cy="4" r="1.7" fill="white"/>
              <circle cx="8" cy="11" r="1.7" fill="white"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Vendrix</span>
        </div>

        {/* Center copy */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Commerce Infrastructure</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 16 }}>
            The operational backbone for African commerce.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 360 }}>
            Unified inventory, orders, and channel sync across Shopify, Jumia, WhatsApp, and Odoo — in one control center.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Multi-channel order management', 'Real-time inventory sync', 'WhatsApp commerce integration', 'Enterprise RBAC and audit logs'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© 2026 Heras Technology. All rights reserved.</div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }} id="vx-mobile-logo">
            <style>{`@media(min-width:960px){#vx-mobile-logo{display:none !important;}}`}</style>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="3" cy="4" r="1.7" fill="white"/>
                <circle cx="13" cy="4" r="1.7" fill="white"/>
                <circle cx="8" cy="11" r="1.7" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Vendrix</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Sign in</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', marginBottom: 28 }}>Access your Vendrix control center</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="vx-input" style={{ paddingLeft: 32 }} placeholder="you@organization.com" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="vx-input" style={{ paddingLeft: 32, paddingRight: 36 }} placeholder="••••••••" />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 3 }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '9px 12px', marginBottom: 14, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 6, fontSize: 13, color: 'var(--red)' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="vx-btn vx-btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 38, fontSize: 14, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Vendrix · by Heras Technology
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
