import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, Plug,
  Building2, BarChart2, Activity, Settings, LogOut,
  Search, Bell, ChevronDown, Menu, X, Zap, ChevronsLeft
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Products',      href: '/products',      icon: Package },
  { label: 'Inventory',     href: '/inventory',     icon: Warehouse },
  { label: 'Orders',        href: '/orders',        icon: ShoppingCart },
  { label: 'Integrations',  href: '/integrations',  icon: Plug },
  { label: 'Organizations', href: '/organizations', icon: Building2 },
  { label: 'Analytics',     href: '/analytics',     icon: BarChart2 },
  { label: 'Events',        href: '/events',        icon: Activity },
]

const Logo = ({ mini }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 7,
      background: 'var(--indigo)', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="3" cy="4" r="1.7" fill="white"/>
        <circle cx="13" cy="4" r="1.7" fill="white"/>
        <circle cx="8" cy="11" r="1.7" fill="white"/>
      </svg>
    </div>
    {!mini && <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Vendrix</span>}
  </div>
)

const Sidebar = ({ mini, setMini, mobileOpen, setMobileOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => { localStorage.removeItem('auth_token'); navigate('/login') }

  const content = (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo + collapse */}
      <div style={{ padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {!mini && <Logo />}
        {mini && <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><Logo mini /></div>}
        {!mini && (
          <button className="vx-btn vx-btn-ghost" style={{ padding: '4px 6px', marginRight: -6 }} onClick={() => setMini(true)} title="Collapse">
            <ChevronsLeft size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {!mini && <div className="vx-section-label" style={{ padding: '8px 12px 6px' }}>Navigation</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`vx-nav-item ${active ? 'active' : ''}`}
                title={mini ? label : undefined}
                style={{ justifyContent: mini ? 'center' : undefined, padding: mini ? '8px' : undefined }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {!mini && label}
              </Link>
            )
          })}
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '10px 12px' }} />

        <Link
          to="/settings"
          className={`vx-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          title={mini ? 'Settings' : undefined}
          style={{ justifyContent: mini ? 'center' : undefined, padding: mini ? '8px' : undefined }}
        >
          <Settings size={16} strokeWidth={1.8} />
          {!mini && 'Settings'}
        </Link>
      </nav>

      {/* User */}
      <div style={{ padding: 10, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {mini ? (
          <button className="vx-btn vx-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 8 }} onClick={() => setMini(false)} title="Expand">
            <Menu size={16} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, background: 'var(--bg-subtle)', cursor: 'default' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--indigo)',
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@vendrix.app</div>
            </div>
            <button className="vx-btn vx-btn-ghost" style={{ padding: 4, flexShrink: 0 }} onClick={logout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: mini ? 56 : 220,
        transition: 'width 0.2s ease',
        zIndex: 50,
        display: 'none',
      }} id="vx-sidebar-desktop">
        {content}
      </div>
      <style>{`@media(min-width:768px){#vx-sidebar-desktop{display:block !important;}}`}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 60 }} onClick={() => setMobileOpen(false)} />
      )}
      <div style={{
        position: 'fixed', top: 0, left: mobileOpen ? 0 : -240, bottom: 0,
        width: 220, transition: 'left 0.22s ease', zIndex: 70,
      }}>
        {content}
      </div>
    </>
  )
}

const Topbar = ({ mini, setMobileOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const pageTitle = {
    '/dashboard': 'Dashboard', '/products': 'Products', '/inventory': 'Inventory',
    '/orders': 'Orders', '/integrations': 'Integrations', '/organizations': 'Organizations',
    '/analytics': 'Analytics', '/events': 'Events', '/settings': 'Settings',
  }[location.pathname] || 'Vendrix'

  const logout = () => { localStorage.removeItem('auth_token'); navigate('/login') }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, height: 56,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 12, zIndex: 40,
      left: 0, transition: 'left 0.2s ease',
    }} id="vx-topbar">
      <style>{`@media(min-width:768px){#vx-topbar{left:${mini ? 56 : 220}px !important;}}`}</style>

      {/* Mobile menu btn */}
      <button className="vx-btn vx-btn-ghost" style={{ padding: 6, display: 'flex' }} onClick={() => setMobileOpen(v => !v)} id="vx-mobile-menu">
        <Menu size={18} />
      </button>
      <style>{`@media(min-width:768px){#vx-mobile-menu{display:none !important;}}`}</style>

      <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{pageTitle}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Search */}
        {searchOpen ? (
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input autoFocus className="vx-input" style={{ paddingLeft: 28, width: 240, height: 32, fontSize: 13 }} placeholder="Search products, orders…" onBlur={() => setSearchOpen(false)} />
          </div>
        ) : (
          <button className="vx-btn vx-btn-secondary" style={{ height: 32, gap: 6, padding: '0 10px', fontSize: 13, color: 'var(--text-muted)' }} onClick={() => setSearchOpen(true)}>
            <Search size={13} /> Search
          </button>
        )}

        {/* Org switcher */}
        <button className="vx-btn vx-btn-secondary" style={{ height: 32, padding: '0 10px', gap: 5, fontSize: 12.5 }} id="vx-orgsw">
          <Building2 size={13} />
          <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Heras Technology</span>
          <ChevronDown size={11} />
        </button>
        <style>{`@media(max-width:640px){#vx-orgsw{display:none !important;}}`}</style>

        {/* Notifications */}
        <button className="vx-btn vx-btn-secondary" style={{ height: 32, width: 32, padding: 0, position: 'relative', justifyContent: 'center' }}>
          <Bell size={14} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: 'var(--red)', borderRadius: '50%', border: '1.5px solid white' }} />
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <button
            className="vx-btn vx-btn-secondary"
            style={{ height: 32, padding: '0 8px', gap: 7 }}
            onClick={() => setUserOpen(v => !v)}
          >
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>A</div>
            <ChevronDown size={11} style={{ color: 'var(--text-muted)', transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {userOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 192,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Admin User</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>admin@vendrix.app</div>
              </div>
              <Link to="/settings" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: 'var(--text-secondary)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Settings size={13} /> Settings
              </Link>
              <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: 'var(--red)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.1s', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children }) => {
  const [mini, setMini] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar mini={mini} setMini={setMini} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Topbar mini={mini} setMobileOpen={setMobileOpen} />
      <main style={{ paddingTop: 56, paddingLeft: 0, transition: 'padding-left 0.2s ease' }} id="vx-main">
        <style>{`@media(min-width:768px){#vx-main{padding-left:${mini ? 56 : 220}px !important;}}`}</style>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
