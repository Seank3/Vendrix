import React from 'react'

export default function Inventory() {
  return (
    <div className="vx-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Inventory</h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>This page is under construction.</p>
      </div>
      <div className="vx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Inventory module coming soon</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>This page will be built out in the next phase.</div>
      </div>
    </div>
  )
}
