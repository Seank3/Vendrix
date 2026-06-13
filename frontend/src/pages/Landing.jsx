import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw, Globe, Shield, ChevronRight, Menu, X } from 'lucide-react'

const useInView = (threshold = 0.15) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const useCountUp = (target, duration = 1200, start = false) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf, startTime
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [start, target])
  return val
}

const FadeUp = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(22px)',
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      ...style,
    }}>{children}</div>
  )
}

const BRAND_ICONS = {
  Shopify: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#96BF48"><path d="M15.337 2.085c-.01-.05-.05-.08-.1-.085-.05-.005-1.13-.025-1.13-.025s-.9-.88-1-.98c-.1-.1-.295-.07-.37-.05l-.51.16A5.6 5.6 0 0 0 11.7 0a.14.14 0 0 0-.125.075c-.78 2.39-1.64 3.5-2.44 4.21-.8.71-1.73.98-2.44 1.08L6.5 5.5l-.875 13.38L17.5 21 19 5.42s-3.653-.56-3.663-3.335zM12 1.42c.21.42.36.96.36 1.705 0 .055-.005.11-.005.165-.5.155-.98.345-1.48.5.375-1.065.81-1.93 1.125-2.37zM10.765.995c-.27.37-.63 1.01-.965 1.955a11.24 11.24 0 0 0-.77.24c.32-1.15.925-1.885 1.735-2.195zM11.98 15.5l-2.85-.71-.38-3.71 1.19-.345.35 2.51 1.69.42V15.5z"/></svg>
  ),
  Jumia: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#F46A00"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
  ),
  WhatsApp: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
  ),
  Odoo: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#714B67"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>
  ),
  WooCommerce: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#7F54B3"><path d="M3.693 0C1.66 0 0 1.66 0 3.693v13.467C0 19.19 1.66 21 3.693 21H9.5l2.5 3 2.5-3h5.807C22.34 21 24 19.19 24 17.16V3.693C24 1.66 22.34 0 20.307 0zm2.132 5.532c.422 0 .73.168.93.503.17.29.25.673.25 1.15 0 .718-.175 1.432-.526 2.14-.35.71-.784 1.064-1.3 1.064-.41 0-.714-.165-.91-.495-.168-.283-.25-.665-.25-1.145 0-.73.175-1.455.523-2.17.35-.716.783-1.047 1.283-1.047zm10.5 0c.42 0 .73.168.928.503.17.29.25.673.25 1.15 0 .718-.175 1.432-.525 2.14-.35.71-.785 1.064-1.3 1.064-.41 0-.715-.165-.91-.495-.168-.283-.25-.665-.25-1.145 0-.73.175-1.455.523-2.17.35-.716.784-1.047 1.284-1.047zM9.2 5.63c.556 0 .97.254 1.24.762.234.434.35.98.35 1.64 0 .867-.188 1.642-.566 2.322-.377.68-.848 1.02-1.413 1.02-.546 0-.957-.254-1.23-.76-.23-.435-.343-.98-.343-1.637 0-.87.187-1.647.562-2.33.375-.682.845-1.017 1.4-1.017z"/></svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1E2235"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  ),
  Takealot: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#0077C8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  Flutterwave: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#F5A623"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 13.5h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V5.5h7V7.5z"/></svg>
  ),
}

const SOCIAL_ICONS = {
  LinkedIn: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
  ),
}

const INTEGRATIONS = [
  { name: 'Shopify',     color: '#96BF48', bg: '#96BF4812' },
  { name: 'Jumia',       color: '#F46A00', bg: '#F46A0012' },
  { name: 'WhatsApp',    color: '#25D366', bg: '#25D36612' },
  { name: 'Odoo',        color: '#714B67', bg: '#714B6712' },
  { name: 'WooCommerce', color: '#7F54B3', bg: '#7F54B312' },
  { name: 'TikTok',      color: '#1E2235', bg: '#1E223512' },
  { name: 'Takealot',    color: '#0077C8', bg: '#0077C812' },
  { name: 'Flutterwave', color: '#F5A623', bg: '#F5A62312' },
]

const PILLARS = [
  { icon: RefreshCw, title: 'Unified Sync', desc: 'Products, inventory, and orders stay consistent across every channel in real time. No manual reconciliation. No overselling.' },
  { icon: Globe, title: 'Channel Distribution', desc: 'Publish once, sell everywhere. Push listings to Shopify, Jumia, WhatsApp, and WooCommerce from a single control center.' },
  { icon: Shield, title: 'Enterprise Control', desc: 'Role-based access, full audit logs, multi-tenant organizations, and webhook infrastructure built for large operations.' },
]

const ENTERPRISE_FEATURES = [
  ['RBAC', 'Granular roles and permissions across every organization.'],
  ['Audit Logs', 'Every action timestamped and attributed to a user.'],
  ['Multi-tenant', 'Manage multiple organizations from one account.'],
  ['Public API', 'REST API and webhooks for custom integrations.'],
  ['Offline Sync', 'Queue operations locally and sync when reconnected.'],
  ['Multi-currency', 'UGX, KES, NGN, ZAR — all in one dashboard.'],
]

const StatCard = ({ value, suffix = '', label, start }) => {
  const count = useCountUp(value, 1400, start)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginTop: 7 }}>{label}</div>
    </div>
  )
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [statsRef, statsVisible] = useInView(0.3)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const S = { fontFamily: "'Inter', system-ui, sans-serif" }

  return (
    <div style={{ background: '#FAFAFA', color: '#1E2235', ...S, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 58,
        background: scrolled ? 'rgba(250,250,250,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent',
        transition: 'background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 29, height: 29, borderRadius: 7, background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="3" cy="4" r="1.7" fill="white"/>
                <circle cx="13" cy="4" r="1.7" fill="white"/>
                <circle cx="8" cy="11" r="1.7" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Vendrix</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} id="vxl-nav">
            <style>{`@media(max-width:680px){#vxl-nav{display:none !important;}}`}</style>
            {['Platform', 'Integrations', 'Enterprise'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13.5, color: '#718096', fontWeight: 500, transition: 'color 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#1E2235'}
                onMouseLeave={e => e.target.style.color = '#718096'}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 6,
              background: '#4F46E5', color: 'white',
              fontSize: 13, fontWeight: 500,
              transition: 'background 0.15s, transform 0.15s',
              boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3730A3'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'none' }}>
              Sign in <ArrowRight size={13} />
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} id="vxl-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#4A5568', display: 'none' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <style>{`@media(max-width:680px){#vxl-mob{display:block !important;}}`}</style>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '12px 28px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            {['Platform', 'Integrations', 'Enterprise'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 0', fontSize: 14, color: '#4A5568', borderBottom: '1px solid #F4F5F7', cursor: 'pointer' }}>{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 130, paddingBottom: 80, textAlign: 'center', maxWidth: 1100, margin: '0 auto', padding: '130px 28px 80px' }}>
        <FadeUp delay={0}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '4px 14px', borderRadius: 999,
            background: '#EEF2FF', border: '1px solid #C7D2FE',
            fontSize: 12, fontWeight: 600, color: '#4F46E5',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5', display: 'inline-block', animation: 'vxpulse 2s ease-in-out infinite' }} />
            Commerce Infrastructure for Africa
          </div>
        </FadeUp>

        <FadeUp delay={80}>
          <h1 style={{ fontSize: 'clamp(38px,6vw,66px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.035em', color: '#1E2235', maxWidth: 780, margin: '0 auto 22px' }}>
            One control center.<br />
            <span style={{ color: '#4F46E5' }}>Every channel.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={160}>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: '#718096', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 38px' }}>
            Vendrix is the operational backbone for African commerce — syncing products, inventory, and orders across Shopify, Jumia, WhatsApp, and Odoo from a single enterprise control center.
          </p>
        </FadeUp>

        <FadeUp delay={240}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 64 }}>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 26px', borderRadius: 7,
              background: '#4F46E5', color: 'white',
              fontSize: 14, fontWeight: 600,
              boxShadow: '0 4px 18px rgba(79,70,229,0.3)',
              transition: 'all 0.18s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3730A3'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(79,70,229,0.3)' }}>
              Request Access <ArrowRight size={15} />
            </Link>
            <a href="#platform" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 22px', borderRadius: 7,
              background: '#FFFFFF', color: '#4A5568',
              fontSize: 14, fontWeight: 500,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.18s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.color = '#1E2235' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.color = '#4A5568' }}>
              See how it works <ChevronRight size={14} />
            </a>
          </div>
        </FadeUp>

        {/* Dashboard mockup */}
        <FadeUp delay={320}>
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.04)',
            maxWidth: 880, margin: '0 auto',
            transform: 'perspective(1200px) rotateX(2deg)',
            transition: 'transform 0.4s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'perspective(1200px) rotateX(0deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'perspective(1200px) rotateX(2deg)'}>
            <div style={{ background: '#F4F5F7', borderBottom: '1px solid #E2E8F0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FECACA' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDE68A' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#A7F3D0' }} />
              <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: '#94A3B8', marginLeft: 8, border: '1px solid #E2E8F0' }}>
                vendrix.ddns.net/dashboard
              </div>
            </div>
            <div style={{ display: 'flex', height: 300 }}>
              <div style={{ width: 152, background: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '12px 8px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="3" cy="4" r="1.7" fill="white"/><circle cx="13" cy="4" r="1.7" fill="white"/><circle cx="8" cy="11" r="1.7" fill="white"/></svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Vendrix</span>
                </div>
                {[['Dashboard', true], ['Products', false], ['Inventory', false], ['Orders', false], ['Integrations', false], ['Analytics', false]].map(([item, active]) => (
                  <div key={item} style={{ padding: '5px 9px', borderRadius: 5, fontSize: 10.5, marginBottom: 1, background: active ? '#EEF2FF' : 'transparent', color: active ? '#4F46E5' : '#94A3B8', fontWeight: active ? 500 : 400, borderLeft: active ? '2.5px solid #4F46E5' : '2.5px solid transparent' }}>{item}</div>
                ))}
              </div>
              <div style={{ flex: 1, padding: '14px 16px', background: '#FAFAFA', overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1E2235', marginBottom: 12 }}>Operational Overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                  {[['1,284', 'Products'], ['4', 'Channels'], ['94%', 'Health'], ['37', 'Orders Today']].map(([v, l]) => (
                    <div key={l} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 8.5, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#1E2235' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 7, overflow: 'hidden' }}>
                  <div style={{ padding: '7px 12px', borderBottom: '1px solid #E2E8F0', fontSize: 10.5, fontWeight: 600, color: '#1E2235' }}>Integration Health</div>
                  {[['Shopify', '🛒', 'Healthy', '#ECFDF5', '#059669'], ['Jumia', '🌍', 'Healthy', '#ECFDF5', '#059669'], ['WhatsApp', '💬', 'Warning', '#FFFBEB', '#D97706'], ['Odoo ERP', '🔧', 'Healthy', '#ECFDF5', '#059669']].map(([name, logo, status, bg, col]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid #F4F5F7' }}>
                      <span style={{ fontSize: 13 }}>{logo}</span>
                      <span style={{ fontSize: 10.5, flex: 1, color: '#4A5568' }}>{name}</span>
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: bg, color: col, fontWeight: 500 }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Stats ── */}
      <div ref={statsRef} style={{ background: '#1E2235', padding: '48px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 32 }}>
          <StatCard value={8} suffix="+" label="Channels connected" start={statsVisible} />
          <StatCard value={99} suffix=".9%" label="Uptime SLA" start={statsVisible} />
          <StatCard value={10} suffix="ms" label="Avg sync latency" start={statsVisible} />
          <StatCard value={5} suffix="+" label="African markets" start={statsVisible} />
        </div>
      </div>

      {/* ── Platform ── */}
      <section id="platform" style={{ padding: '96px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4F46E5', marginBottom: 14 }}>The Platform</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 14 }}>Infrastructure, not software</h2>
            <p style={{ fontSize: 15, color: '#718096', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>Vendrix doesn't replace your tools. It makes them all work together as one coherent operation.</p>
          </div>
        </FadeUp>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
          {PILLARS.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 80}>
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: '32px 28px',
                height: '100%',
                transition: 'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,70,229,0.09)'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={19} color="#4F46E5" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: '#718096', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Integrations ── */}
      <section id="integrations" style={{ background: '#F4F5F7', padding: '88px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <FadeUp>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4F46E5', marginBottom: 14 }}>Integrations</div>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 14 }}>Every channel. One pipeline.</h2>
            <p style={{ fontSize: 14.5, color: '#718096', maxWidth: 460, margin: '0 auto 52px', lineHeight: 1.75 }}>Connect your entire commerce stack. Vendrix handles the sync so you don't have to.</p>
          </FadeUp>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {INTEGRATIONS.map(({ name, color, bg }, i) => (
              <FadeUp key={name} delay={i * 50}>
                <div style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 10, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 11,
                  minWidth: 148,
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${color}22`; e.currentTarget.style.borderColor = `${color}55` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0' }}>
                  <div style={{ width: 33, height: 33, borderRadius: 8, background: bg, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {BRAND_ICONS[name]}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#1E2235', whiteSpace: 'nowrap' }}>{name}</span>
                </div>
              </FadeUp>
            ))}
            <FadeUp delay={INTEGRATIONS.length * 50}>
              <div style={{ background: '#FFFFFF', border: '1.5px dashed #CBD5E1', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 11, minWidth: 148 }}>
                <div style={{ width: 33, height: 33, borderRadius: 8, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#94A3B8', flexShrink: 0 }}>+</div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: '#94A3B8' }}>More coming</span>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Enterprise ── */}
      <section id="enterprise" style={{ padding: '96px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
          <FadeUp>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4F46E5', marginBottom: 14 }}>Enterprise</div>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 18, lineHeight: 1.2 }}>
              Built for organizations that operate at scale
            </h2>
            <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.8, marginBottom: 32 }}>
              Role-based access control, multi-tenant organizations, complete audit logs, and a public API with webhook support — everything a logistics director or operations manager requires.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 22px', borderRadius: 6,
              background: '#4F46E5', color: 'white',
              fontSize: 13.5, fontWeight: 500,
              boxShadow: '0 3px 10px rgba(79,70,229,0.25)',
              transition: 'all 0.18s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3730A3'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'none' }}>
              Access the platform <ArrowRight size={14} />
            </Link>
          </FadeUp>
          <FadeUp delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {ENTERPRISE_FEATURES.map(([title, desc], i) => (
                <div key={title} style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 9, padding: '16px',
                  transition: 'border-color 0.18s, transform 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1E2235', marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#4F46E5', padding: '88px 28px', textAlign: 'center' }}>
        <FadeUp>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: 16, lineHeight: 1.15 }}>
            The commerce OS for Africa starts here.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.65)', marginBottom: 38, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 38px' }}>
            Connect your channels, unify your operations, and scale across African markets — from one control center.
          </p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 30px', borderRadius: 7,
            background: '#FFFFFF', color: '#4F46E5',
            fontSize: 14.5, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.18s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'none' }}>
            Request Access <ArrowRight size={15} />
          </Link>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1E2235', padding: '36px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="3" cy="4" r="1.7" fill="white"/><circle cx="13" cy="4" r="1.7" fill="white"/><circle cx="8" cy="11" r="1.7" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>Vendrix</span>
            <span style={{ fontSize: 12, color: '#4A5568', marginLeft: 2 }}>by Heras Technology</span>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { name: 'LinkedIn', href: 'https://linkedin.com/company/heras-technology' },
              { name: 'GitHub',   href: 'https://github.com/Seank3' },
              { name: 'X',        href: 'https://x.com/herastech' },
            ].map(({ name, href }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" style={{
                width: 34, height: 34, borderRadius: 7,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748B',
                transition: 'all 0.18s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}>
                {SOCIAL_ICONS[name]}
              </a>
            ))}
          </div>

          <div style={{ fontSize: 12, color: '#374151' }}>© 2026 Heras Technology. All rights reserved.</div>
        </div>
      </footer>

      <style>{`
        @keyframes vxpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
