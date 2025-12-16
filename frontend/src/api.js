import axios from 'axios'

// Create axios instance with interceptors
const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor for auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: async (payload) => {
    const response = await client.post('/auth/login', payload)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response
  },
  me: () => client.get('/auth/me'),
  logout: async () => {
    localStorage.removeItem('auth_token')
    // Call logout endpoint if available
    try {
      await client.post('/auth/logout')
    } catch (e) {
      // Ignore logout errors
    }
  },
}

export const config = {
  get: () => client.get('/config'),
  update: (data) => client.put('/config', data),
}

export const integrations = {
  list: () => client.get('/integrations'),
}

export const credentials = {
  get: (platform) => client.get('/credentials', { params: { platform } }),
  save: (platform, creds) => client.post('/credentials', { platform, credentials: creds }),
}

export const orders = {
  list: (params = {}) => client.get('/orders', { params }),
}

export const analytics = {
  overview: (params = {}) => client.get('/analytics/overview', { params }),
  metrics: (params = {}) => client.get('/analytics/metrics', { params }),
}

export const dashboard = {
  metrics: () => client.get('/dashboard/metrics'),
}

export const users = {
  list: (params = {}) => client.get('/users', { params }),
}

export const logs = {
  list: (params = {}) => client.get('/logs', { params }),
}

