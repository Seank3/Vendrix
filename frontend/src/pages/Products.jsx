import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, RefreshCw, MoreHorizontal } from 'lucide-react'

const DEMO_PRODUCTS = [
  { sku: 'SKU-0041', name: 'Organic Shea Butter 500ml', inventory: 842, channels: ['Shopify', 'Jumia'], status: 'active', last_sync: '3 min ago', price: '$12.50' },
  { sku: 'SKU-0042', name: 'Aloe Vera Gel 250ml', inventory: 326, channels: ['Shopify'], status: 'active', last_sync: '3 min ago', price: '$8.00' },
  { sku: 'SKU-0043', name: 'Coconut Hair Oil 200ml', inventory: 17, channels: ['Jumia', 'WhatsApp'], status: 'low_stock', last_sync: '15 min ago', price: '$9.75' },
  { sku: 'SKU-0044', name: 'African Black Soap Bar', inventory: 0, channels: ['Shopify', 'Jumia', 'WhatsApp'], status: 'out_of_stock', last_sync: '1 hr ago', price: '$4.50' },
  { sku: 'SKU-0045', name: 'Baobab Face Serum 30ml', inventory: 204, channels: ['Shopify'], status: 'active', last_sync: '3 min ago', price: '$24.00' },
  { sku: 'SKU-0046', name: 'Moringa Powder 1kg', inventory: 558, channels: ['Jumia'], status: 'active', last_sync: '8 min ago', price: '$18.00' },
  { sku: 'SKU-0047', name: 'Hibiscus Tea Blend 100g', inventory: 89, channels: ['WhatsApp', 'Shopify'], status: 'active', last_sync: '3 min ago', price: '$6.00' },
  { sku: 'SKU-0048', name: 'Argan Conditioning Oil', inventory: 3, channels: ['Shopify'], status: 'low_stock', last_sync: '45 min ago', price: '$16.50' },
]

const statusBadge = (s) => {
  if (s === 'active')       return <span className="vx-badge vx-badge-green">Active</span>
  if (s === 'low_stock')    return <span className="vx-badge vx-badge-amber">Low stock</span>
  if (s === 'out_of_stock') return <span className="vx-badge vx-badge-red">Out of stock</span>
  return <span className="vx-badge vx-badge-gray">{s}</span>
}

const channelTag = (name) => {
  const colors = { Shopify: '#96BF48', Jumia: '#F46A00', WhatsApp: '#25D366', 'Odoo ERP': '#714B67' }
  return (
    <span key={name} style={{
      display: 'inline-block', padding: '1px 6px', borderRadius: 3,
      fontSize: 11, fontWeight: 500, background: `${colors[name]}18`,
      color: colors[name] || 'var(--text-secondary)', border: `1px solid ${colors[name]}30`,
    }}>{name}</span>
  )
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = DEMO_PRODUCTS.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchF = filter === 'all' || p.status === filter
    return matchQ && matchF
  })

  return (
    <div className="vx-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{DEMO_PRODUCTS.length} products synced across all channels</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="vx-btn vx-btn-secondary"><RefreshCw size={13} /> Sync now</button>
          <button className="vx-btn vx-btn-primary"><Plus size={13} /> Add product</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="vx-input" style={{ paddingLeft: 30, height: 34 }} placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="vx-select" style={{ height: 34, fontSize: 13 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <button className="vx-btn vx-btn-secondary" style={{ height: 34 }}><Filter size={13} /> Filter</button>
      </div>

      <div className="vx-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="vx-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Inventory</th>
                <th>Channels</th>
                <th>Status</th>
                <th>Last sync</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products match your search.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.sku}>
                  <td className="mono">{p.sku}</td>
                  <td style={{ fontWeight: 500, maxWidth: 240 }} className="truncate">{p.name}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: p.inventory === 0 ? 700 : 500, color: p.inventory === 0 ? 'var(--red)' : p.inventory < 20 ? 'var(--amber)' : 'var(--text-primary)' }}>
                    {p.inventory.toLocaleString()}
                  </td>
                  <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{p.channels.map(channelTag)}</div></td>
                  <td>{statusBadge(p.status)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{p.last_sync}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.price}</td>
                  <td>
                    <button className="vx-btn vx-btn-ghost" style={{ padding: 5 }}><MoreHorizontal size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of {DEMO_PRODUCTS.length} products</span>
          <span>Last full sync: 3 minutes ago</span>
        </div>
      </div>
    </div>
  )
}
