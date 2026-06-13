import React, { useState } from 'react'
import { CheckCircle, XCircle, Settings, Zap, ExternalLink } from 'lucide-react'

const platforms = [
  { id: 'shopify',     name: 'Shopify',     emoji: '🛒', desc: 'Full-featured e-commerce platform',       category: 'Marketplace' },
  { id: 'woocommerce', name: 'WooCommerce', emoji: '📦', desc: 'WordPress-powered online store',          category: 'Marketplace' },
  { id: 'jumia',       name: 'Jumia',       emoji: '🌍', desc: "Africa's leading e-commerce marketplace", category: 'Africa' },
  { id: 'jiji',        name: 'Jiji',        emoji: '📱', desc: 'East African classifieds platform',       category: 'Africa' },
  { id: 'etsy',        name: 'Etsy',        emoji: '🎨', desc: 'Global handmade & vintage marketplace',   category: 'Marketplace' },
  { id: 'ebay',        name: 'eBay',        emoji: '🔨', desc: 'Global auction & buy-it-now platform',    category: 'Marketplace' },
  { id: 'kilimall',    name: 'Kilimall',    emoji: '🏪', desc: 'East Africa e-commerce platform',        category: 'Africa' },
  { id: 'flutterwave', name: 'Flutterwave', emoji: '💳', desc: 'Pan-African payment infrastructure',     category: 'Payments' },
  { id: 'mtn',         name: 'MTN MoMo',    emoji: '📲', desc: 'Mobile money for Uganda & beyond',        category: 'Payments' },
]

const categories = ['All', 'Marketplace', 'Africa', 'Payments']

const Integrations = () => {
  const [connected, setConnected] = useState({ etsy: true, woocommerce: true, mtn: true })
  const [filter, setFilter] = useState('All')
  const [configuring, setConfiguring] = useState(null)

  const toggle = (id) => setConnected(prev => ({ ...prev, [id]: !prev[id] }))

  const visible = platforms.filter(p => filter === 'All' || p.category === filter)

  const connectedCount = Object.values(connected).filter(Boolean).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Integrations</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>{connectedCount} connected</span> · Connect your sales channels
          </p>
        </div>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', borderRadius: 10, padding: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: 7, border: 'none',
                background: filter === cat ? 'var(--surface-hover)' : 'transparent',
                color: filter === cat ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {visible.map((p, i) => {
          const isConnected = !!connected[p.id]
          return (
            <div
              key={p.id}
              className={`vx-card vx-card-hover animate-fade-up ${isConnected ? 'connected-card' : ''}`}
              style={{
                padding: '1.5rem',
                animationDelay: `${i * 50}ms`,
                borderColor: isConnected ? 'rgba(61,142,240,0.3)' : undefined,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {isConnected && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 80, height: 80,
                  background: 'radial-gradient(circle at top right, rgba(61,142,240,0.1), transparent 70%)',
                  pointerEvents: 'none',
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: isConnected ? 'rgba(61,142,240,0.1)' : 'var(--surface-overlay)',
                    border: `1px solid ${isConnected ? 'rgba(61,142,240,0.25)' : 'var(--surface-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</div>
                    <span className="vx-badge vx-badge-muted" style={{ fontSize: '0.68rem', marginTop: 3 }}>{p.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isConnected
                    ? <CheckCircle size={16} color="#34d399" />
                    : <XCircle size={16} color="var(--text-muted)" />
                  }
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.5 }}>{p.desc}</p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => toggle(p.id)}
                  className={isConnected ? 'vx-btn-ghost' : 'vx-btn-primary'}
                  style={{
                    flex: 1, justifyContent: 'center', padding: '0.5rem',
                    fontSize: '0.8rem',
                    ...(isConnected ? { borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' } : {}),
                  }}
                >
                  {isConnected ? 'Disconnect' : (
                    <><Zap size={13} /> Connect</>
                  )}
                </button>
                {isConnected && (
                  <button
                    className="vx-btn-ghost"
                    style={{ padding: '0.5rem 0.65rem' }}
                    title="Configure"
                    onClick={() => setConfiguring(p.id)}
                  >
                    <Settings size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Config modal */}
      {configuring && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfiguring(null)}
        >
          <div
            className="animate-scale-in vx-card"
            style={{ width: '100%', maxWidth: 440, padding: '2rem', margin: '1rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Configure {platforms.find(p => p.id === configuring)?.name}</span>
              <button className="vx-btn-ghost" style={{ padding: '0.4rem', border: 'none' }} onClick={() => setConfiguring(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>API Key</label>
              <input className="vx-input" placeholder="Enter your API key…" type="password" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Store URL</label>
              <input className="vx-input" placeholder="https://your-store.myshopify.com" />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button className="vx-btn-ghost" onClick={() => setConfiguring(null)}>Cancel</button>
              <button className="vx-btn-primary" onClick={() => setConfiguring(null)}>Save configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Integrations
