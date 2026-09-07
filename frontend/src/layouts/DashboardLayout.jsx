import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, Plug,
  BarChart2, Activity, Users, Settings, LogOut, Search, Bell,
  ChevronDown, Menu, X, ChevronsLeft, LayoutGrid, Building2,
} from 'lucide-react'
import { authAPI } from '../services/api'
import { useUIStore } from '../store/ui'
import { initials } from '../components/ui'

const APP_MODULES = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',    desc: 'Operational overview' },
  { path: '/products',      icon: Package,         label: 'Products',     desc: 'Master catalog' },
  { path: '/inventory',     icon: Warehouse,       label: 'Inventory',    desc: 'Stock & ledger' },
  { path: '/orders',        icon: ShoppingCart,    label: 'Orders',       desc: 'Channel orders' },
  { path: '/integrations',  icon: Plug,            label: 'Integrations', desc: 'Connected channels' },
  { path: '/analytics',     icon: BarChart2,       label: 'Analytics',    desc: 'Performance' },
  { path: '/events',        icon: Activity,        label: 'Events',       desc: 'Activity stream' },
  { path: '/users',         icon: Users,           label: 'Team',         desc: 'Users & roles' },
  { path: '/organizations', icon: Building2,       label: 'Organization', desc: 'Tenant profile' },
  { path: '/settings',      icon: Settings,        label: 'Settings',     desc: 'Workspace & keys' },
]

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Products',   href: '/products',   icon: Package },
      { label: 'Inventory',  href: '/inventory',  icon: Warehouse },
      { label: 'Orders',     href: '/orders',     icon: ShoppingCart },
    ],
  },
  {
    label: 'Channels',
    items: [{ label: 'Integrations', href: '/integrations', icon: Plug }],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart2 },
      { label: 'Events',    href: '/events',    icon: Activity },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Team',        href: '/users',         icon: Users },
      { label: 'Organization', href: '/organizations', icon: Building2 },
      { label: 'Settings',    href: '/settings',      icon: Settings },
    ],
  },
]

const PAGE_LABEL = Object.fromEntries(APP_MODULES.map((m) => [m.path, m.label]))

const Logo = ({ mini }) => (
  <Link to="/dashboard" className="brand" title="Vendrix">
    <span className="mark">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <polyline points="3,4 8,11 13,4" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="4" r="1.6" fill="white" />
        <circle cx="13" cy="4" r="1.6" fill="white" />
        <circle cx="8" cy="11" r="1.6" fill="white" />
      </svg>
    </span>
    {!mini && <span>Vendrix</span>}
  </Link>
)

const SidebarContent = ({ mini, onNavigate }) => {
  const location = useLocation()
  return (
    <div className="scroll">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="vx-nav-group">{section.label}</div>
          {section.items.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`vx-nav-item ${active ? 'active' : ''}`}
                title={mini ? label : undefined}
                onClick={onNavigate}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {!mini && <span>{label}</span>}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [user, setUser] = useState(null)
  const [appsOpen, setAppsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const appsRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    let live = true
    authAPI.me().then((u) => live && setUser(u)).catch(() => {
      try { setUser(JSON.parse(localStorage.getItem('auth_user') || 'null')) } catch { /* ignore */ }
    })
    return () => { live = false }
  }, [location.pathname])

  useEffect(() => {
    const close = (e) => {
      if (appsRef.current && !appsRef.current.contains(e.target)) setAppsOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  const logout = async () => {
    await authAPI.logout()
    navigate('/login')
  }

  const label = PAGE_LABEL[location.pathname] || 'Vendrix'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Top bar ─── */}
      <header className="vx-topbar">
        {!sidebarCollapsed && <Logo />}
        {sidebarCollapsed && <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><Logo mini /></div>}
        {!sidebarCollapsed && (
          <button className="vx-icon-btn" onClick={toggleSidebar} title="Collapse sidebar" style={{ marginLeft: 6 }}>
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* App switcher — Odoo-style */}
        <div style={{ position: 'relative' }} ref={appsRef}>
          <button className={`vx-icon-btn ${appsOpen ? 'active' : ''}`} onClick={() => setAppsOpen((v) => !v)} title="Apps">
            <LayoutGrid size={16} />
          </button>
          {appsOpen && (
            <div className="vx-menu" style={{ left: 0, right: 'auto', width: 340, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {APP_MODULES.map(({ path, icon: Icon, label: l, desc }) => (
                <Link key={path} to={path} className="vx-menu-item" style={{ alignItems: 'flex-start', padding: 10 }}
                  onClick={() => setAppsOpen(false)}>
                  <span className="vx-logo-tile" style={{ width: 30, height: 30, borderRadius: 8, fontSize: 12, background: location.pathname === path ? 'var(--brand)' : 'var(--surface-3)', color: location.pathname === path ? '#fff' : 'var(--text-3)' }}>
                    <Icon size={15} />
                  </span>
                  <span style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{l}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{desc}</div>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <nav className="vx-crumbs" style={{ marginLeft: 4 }} aria-label="Breadcrumb">
          <span style={{ color: 'var(--text-4)' }}>Home</span>
          <span className="sep">›</span>
          <span className="current">{label}</span>
        </nav>

        <div style={{ flex: 1 }} />

        {/* Global search */}
        <form className="topsearch" onSubmit={submitSearch} role="search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs…"
            aria-label="Search"
          />
        </form>

        <Link to="/events" className="vx-icon-btn" title="Activity stream">
          <Bell size={16} />
        </Link>

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8 }}
          >
            <span className="vx-avatar">{initials(user ? `${user.first_name} ${user.last_name}` || user.email : '?')}</span>
            <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{user ? (user.first_name || user.email.split('@')[0]) : '…'}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-4)', textTransform: 'capitalize' }}>{user?.role || 'member'}</div>
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-4)' }} />
          </button>
          {menuOpen && (
            <div className="vx-menu">
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: 5 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{user?.email || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{user?.organization?.name || 'Organization'}</div>
              </div>
              <Link to="/organizations" className="vx-menu-item" onClick={() => setMenuOpen(false)}><Building2 size={14} /> My organization</Link>
              <Link to="/settings" className="vx-menu-item" onClick={() => setMenuOpen(false)}><Settings size={14} /> Settings</Link>
              <div className="vx-menu-sep" />
              <button className="vx-menu-item danger" onClick={logout}><LogOut size={14} /> Sign out</button>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
        {/* ─── Sidebar (desktop) ─── */}
        <aside className={`vx-sidebar ${sidebarCollapsed ? 'mini' : ''}`} style={{ display: mobileOpen ? 'none' : undefined }}>
          <button
            className="vx-icon-btn"
            onClick={toggleSidebar}
            style={{ position: 'absolute', top: 6, right: 6, display: sidebarCollapsed ? 'flex' : 'none' }}
            title="Expand sidebar"
          >
            <ChevronsLeft size={15} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <SidebarContent mini={sidebarCollapsed} />
        </aside>

        {/* ─── Mobile drawer ─── */}
        {mobileOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(16,24,40,.45)' }} onClick={() => setMobileOpen(false)}>
            <aside className="vx-sidebar" style={{ position: 'relative', zIndex: 2, top: 0, height: '100vh', boxShadow: 'var(--sh-xl)' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 4px 16px', height: 52 }}>
                <Logo />
                <button className="vx-icon-btn" onClick={() => setMobileOpen(false)}><X size={16} /></button>
              </div>
              <SidebarContent mini={false} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* ─── Content ─── */}
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>

      {/* Mobile topbar burger */}
      <button
        className="vx-icon-btn"
        onClick={() => setMobileOpen(true)}
        title="Open menu"
        style={{ position: 'fixed', top: 11, right: 14, zIndex: 45, display: 'none', background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Menu size={16} />
      </button>
    </div>
  )
}
