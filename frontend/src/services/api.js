import axios from 'axios'

/**
 * Vendrix API client — speaks to the multi-tenant backend at /api/v1.
 * In dev, Vite proxies /api -> http://localhost:8000.
 * In production, set VITE_API_BASE_URL to the hosted API during the build
 * (e.g. https://vendrix-api.onrender.com/api/v1) — no trailing slash.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const TOKEN_KEY = 'auth_token'
export const REFRESH_KEY = 'auth_refresh'
export const USER_KEY = 'auth_user'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login/')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const unwrap = (p) => p.then((r) => r.data)

// ───────────────────────── Auth ─────────────────────────
export const authAPI = {
  login: (credentials) =>
    unwrap(api.post('/auth/login/', credentials)).then((r) => {
      localStorage.setItem(TOKEN_KEY, r.access)
      if (r.refresh) localStorage.setItem(REFRESH_KEY, r.refresh)
      localStorage.setItem(USER_KEY, JSON.stringify(r.user))
      return r
    }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    return Promise.resolve()
  },
  me: () => unwrap(api.get('/auth/me/')),
  apiKeys: {
    list: () => unwrap(api.get('/auth/api-keys/')),
    create: (data) => unwrap(api.post('/auth/api-keys/', data)),
    revoke: (id) => unwrap(api.delete(`/auth/api-keys/${id}/`)),
  },
  users: {
    list: async () => {
      const r = await unwrap(api.get('/auth/users/'))
      return Array.isArray(r) ? r : r.results || []
    },
    create: (data) => unwrap(api.post('/auth/users/', data)),
  },
}

// ─────────────────────── Dashboard ───────────────────────
export const dashboardAPI = {
  /** Composed overview — pulls together the real analytics/product/inventory/integration endpoints. */
  getOverview: async () => {
    const [analytics, products, inventory, integrations, orders, events] = await Promise.all([
      analyticsAPI.getOverview(),
      productsAPI.list(),
      inventoryAPI.list(),
      integrationsAPI.list(),
      ordersAPI.list(),
      eventsAPI.list({ page_size: 8 }),
    ])
    const skus = inventory.length
    const inStock = inventory.filter((l) => l.quantity_available > 0).length
    const lowStock = inventory.filter((l) => l.quantity_available > 0 && l.quantity_available <= 5).length
    const connected = integrations.filter((i) => i.status === 'connected').length
    return {
      metrics: {
        products_synced: products.length,
        active_integrations: connected,
        integrations_total: integrations.length,
        inventory_skus: skus,
        inventory_health: skus ? Math.round((inStock / skus) * 100) : 0,
        low_stock: lowStock,
        orders_today: analytics.orders_today || 0,
        events_today: analytics.events_today || 0,
        sync_failures: analytics.sync_failures_unresolved || 0,
      },
      products,
      inventory,
      integrations,
      orders,
      events,
      analytics,
    }
  },
}

// ─────────────────────── Products ────────────────────────
export const productsAPI = {
  list: (params = {}) => unwrap(api.get('/products/', { params })),
  get: (id) => unwrap(api.get(`/products/${id}/`)),
  create: (data) => unwrap(api.post('/products/', data)),
  update: (id, data) => unwrap(api.patch(`/products/${id}/`, data)),
}

// ─────────────────────── Inventory ───────────────────────
export const inventoryAPI = {
  list: () => unwrap(api.get('/inventory/')),
  get: (sku) => unwrap(api.get(`/inventory/${encodeURIComponent(sku)}/`)),
  adjust: (data) => unwrap(api.post('/inventory/adjust/', data)),
  ledger: (params = {}) => unwrap(api.get('/inventory/ledger/', { params })),
  setBuffer: (data) => unwrap(api.post('/inventory/buffers/', data)),
}

// ─────────────────────── Orders ──────────────────────────
export const ordersAPI = {
  list: (params = {}) => unwrap(api.get('/orders/', { params })),
  get: (id) => unwrap(api.get(`/orders/${id}/`)),
  updateStatus: (id, status) => unwrap(api.patch(`/orders/${id}/status/`, { status })),
  create: (data) => unwrap(api.post('/orders/', data)),
}

// ───────────────────── Integrations ──────────────────────
export const integrationsAPI = {
  platforms: () => unwrap(api.get('/integrations/platforms/')),
  list: () => unwrap(api.get('/integrations/')),
  get: (id) => unwrap(api.get(`/integrations/${id}/`)),
  create: (data) => unwrap(api.post('/integrations/', data)),
  pushProduct: (id, productId) => unwrap(api.post(`/integrations/${id}/push-product/`, { product_id: productId })),
  fetchOrders: (id, since = null) => unwrap(api.post(`/integrations/${id}/fetch-orders/`, { since })),
  syncJobs: (params = {}) => unwrap(api.get('/integrations/sync-jobs/', { params })),
  syncJob: (id) => unwrap(api.get(`/integrations/sync-jobs/${id}/`)),
}

// ─────────────────────── Analytics ───────────────────────
export const analyticsAPI = {
  getOverview: () => unwrap(api.get('/analytics/overview/')),
  ordersByChannel: (days = 30) => unwrap(api.get('/analytics/orders-by-channel/', { params: { days } })),
  skuPerformance: (days = 30) => unwrap(api.get('/analytics/sku-performance/', { params: { days } })),
  syncFailures: (resolved) =>
    unwrap(api.get('/analytics/sync-failures/', { params: resolved === undefined ? {} : { resolved } })),
}

// ─────────────────────── Events ──────────────────────────
export const eventsAPI = {
  list: (params = {}) => unwrap(api.get('/events/', { params })),
}

export default api
