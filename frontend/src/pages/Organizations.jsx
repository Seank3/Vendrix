import React, { useState, useEffect, useCallback } from 'react'
import { Building2, Users, Package, ShoppingCart, Plug, RefreshCw, ShieldCheck } from 'lucide-react'
import { authAPI, productsAPI, ordersAPI, integrationsAPI } from '../services/api'
import { useToastStore } from '../store/toast'
import { PageHeader, StatCard, Badge, EmptyState, LoadingRows, fetchError, fmtDate, statusTone } from '../components/ui'

export default function Organizations() {
  const [data, setData] = useState(null)
  const toast = useToastStore()

  const load = useCallback(async () => {
    try {
      const [user, products, orders, integrations] = await Promise.all([
        authAPI.me(),
        productsAPI.list().catch(() => []),
        ordersAPI.list().catch(() => []),
        integrationsAPI.list().catch(() => []),
      ])
      setData({ user, products, orders, integrations })
    } catch (e) {
      toast.error(fetchError(e, 'Could not load organization.'))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const org = data?.user?.organization
  const connected = (data?.integrations || []).filter((i) => i.status === 'connected').length

  return (
    <div className="vx-page">
      <PageHeader title="Organization" sub="Your tenant on Vendrix — the unit every record belongs to."
        crumbs={['Organization']}
        actions={<button className="vx-btn vx-btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>} />

      <div className="grid grid-4" style={{ gap: 14, marginBottom: 16 }}>
        <StatCard icon={Users} label="Members" value={data ? 1 : '…'} sub="you + invites" tone="purple" />
        <StatCard icon={Package} label="Products" value={data ? data.products.length : '…'} sub="master catalog" />
        <StatCard icon={ShoppingCart} label="Orders" value={data ? data.orders.length : '…'} sub="all channels" tone="blue" />
        <StatCard icon={Plug} label="Connected" value={data ? connected : '…'} sub={`of ${data?.integrations?.length ?? 0} integrations`} tone="green" />
      </div>

      <div className="grid grid-2" style={{ gap: 14 }}>
        <div className="vx-card">
          <div className="vx-card-head"><span className="vx-card-title"><Building2 size={15} /> Profile</span></div>
          <div className="vx-card-body">
            {!org ? <LoadingRows rows={4} cols={2} /> : (
              <dl className="vx-kv">
                <dt>Name</dt><dd style={{ fontWeight: 700, fontSize: 15 }}>{org.name}</dd>
                <dt>Slug</dt><dd className="mono">{org.slug}</dd>
                <dt>Status</dt><dd><Badge tone={org.is_active ? 'green' : 'red'} dot>{org.is_active ? 'active' : 'inactive'}</Badge></dd>
                <dt>Organization ID</dt><dd className="mono xs">{org.id}</dd>
                <dt>Created</dt><dd>{fmtDate(org.created_at)}</dd>
              </dl>
            )}
          </div>
        </div>

        <div className="vx-card">
          <div className="vx-card-head"><span className="vx-card-title"><ShieldCheck size={15} /> Channels</span></div>
          <div className="vx-card-body">
            {!data ? <LoadingRows rows={3} cols={2} /> : !data.integrations.length ? (
              <EmptyState icon={Plug} title="No integrations" sub="Connect a channel to start syncing." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.integrations.map((i) => (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="vx-logo-tile" style={{ width: 28, height: 28, borderRadius: 7, fontSize: 12 }}>{i.platform[0].toUpperCase()}</span>
                    <div style={{ flex: 1 }}>
                      <div className="small fw-600">{i.name}</div>
                      <div className="xs muted" style={{ textTransform: 'capitalize' }}>{i.platform.replace('_', ' ')}</div>
                    </div>
                    <Badge tone={statusTone(i.status)} dot>{i.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
