import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials).then(res => res.data),
  logout: () => api.post('/auth/logout/').then(res => res.data),
  me: () => api.get('/auth/me/').then(res => res.data),
  changePassword: (data) => api.post('/auth/change-password/', data).then(res => res.data),
}

// Dashboard API
export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics/').then(res => res.data),
  getOverview: (params = {}) => api.get('/dashboard/overview/', { params }).then(res => res.data),
}

// Analytics API
export const analyticsAPI = {
  getOverview: (range = '30d') => api.get('/analytics/overview/', { params: { range } }).then(res => res.data),
  getPerformance: (days = 30) => api.get('/analytics/performance/', { params: { days } }).then(res => res.data),
}

// Projects/Orders API
export const projectsAPI = {
  getProjects: (params = {}) => api.get('/projects/', { params }).then(res => res.data),
  getProject: (id) => api.get(`/projects/${id}/`).then(res => res.data),
  createProject: (data) => api.post('/projects/', data).then(res => res.data),
  updateProject: (id, data) => api.patch(`/projects/${id}/`, data).then(res => res.data),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
  getProjectHistory: (id) => api.get(`/projects/${id}/history/`).then(res => res.data),
  getStats: () => api.get('/projects/stats/').then(res => res.data),
  getAnalytics: () => api.get('/projects/analytics/').then(res => res.data),
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/users/', { params }).then(res => res.data),
  getUser: (id) => api.get(`/users/${id}/`).then(res => res.data),
  createUser: (data) => api.post('/users/', data).then(res => res.data),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  getProfile: () => api.get('/auth/me/').then(res => res.data),
  updateProfile: (data) => api.patch('/auth/me/', data).then(res => res.data),
}

export default api