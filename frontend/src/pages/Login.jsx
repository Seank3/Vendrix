import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authAPI } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await authAPI.login({ email, password })
      if (r.access) navigate(params.get('next') || '/dashboard')
      else setError('Invalid response from server.')
    } catch (err) {
      const d = err.response?.data
      setError(d?.detail || d?.non_field_errors?.[0] || 'Incorrect email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left panel — branding */}
      <div style={{
        width: '44%', background: 'linear-gradient(160deg, #4338CA 0%, #4F46E5 55%, #6366F1 100%)',
        display: 'none', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 54px', position: 'relative', overflow: 'hidden',
      }} id="vx-login-panel">
        <style>{`@media(min-width:960px){#vx-login-panel{display:flex !important;}}`}</style>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 300px at 85% -10%, rgba(255,255,255,.18), transparent), radial-gradient(500px 320px at -10% 110%, rgba(255,255,255,.10), transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="3" cy="4" r="1.7" fill="white" />
              <circle cx="13" cy="4" r="1.7" fill="white" />
              <circle cx="8" cy="11" r="1.7" fill="white" />
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Vendrix</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>Commerce Infrastructure</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: 'white', lineHeight: 1.25, letterSpacing: '-0.025em', marginBottom: 14 }}>
            The operational backbone for African commerce.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, maxWidth: 380 }}>
            Unified inventory, orders, and channel sync across Shopify, Jumia, Etsy, WhatsApp, and Odoo — in one control center.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Multi-channel order management', 'Real-time inventory sync', 'WhatsApp commerce integration', 'Enterprise RBAC and audit logs'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.82)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', position: 'relative' }}>© 2026 Heras Technology. All rights reserved.</div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 30 }} id="vx-mobile-logo">
            <style>{`@media(min-width:960px){#vx-mobile-logo{display:none !important;}}`}</style>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(79,70,229,.35)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="3" cy="4" r="1.7" fill="white" />
                <circle cx="13" cy="4" r="1.7" fill="white" />
                <circle cx="8" cy="11" r="1.7" fill="white" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Vendrix</span>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--sh-lg)', padding: '28px 26px 24px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 5 }}>Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 22 }}>Access your Vendrix control center</p>

            <form onSubmit={submit}>
              <div className="vx-field">
                <label>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                    className="vx-input" style={{ paddingLeft: 34, height: 38 }} placeholder="you@organization.com" />
                </div>
              </div>

              <div className="vx-field">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="vx-input" style={{ paddingLeft: 34, paddingRight: 38, height: 38 }} placeholder="••••••••" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 3 }}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && <div className="vx-form-error">{error}</div>}

              <button type="submit" disabled={loading} className="vx-btn vx-btn-primary vx-btn-lg"
                style={{ width: '100%', marginTop: 6, opacity: loading ? 0.72 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? (<><span className="vx-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.35)', borderTopColor: '#fff' }} /> Signing in…</>) : (<>Sign in <ArrowRight size={14} /></>)}
              </button>
            </form>
          </div>

          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>
            Vendrix · by Heras Technology
          </p>
        </div>
      </div>
    </div>
  )
}
