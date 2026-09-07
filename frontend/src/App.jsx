import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import ToastContainer from './components/Toast'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Integrations from './pages/Integrations'
import Organizations from './pages/Organizations'
import Analytics from './pages/Analytics'
import Events from './pages/Events'
import Users from './pages/Users'
import Settings from './pages/Settings'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('auth_token'))
    setLoading(false)
  }, [])
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span className="vx-spinner" /> <span style={{ color: 'var(--text-4)', fontSize: 13 }}>Loading Vendrix…</span>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const Protected = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
)

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"     element={<Protected><Dashboard /></Protected>} />
        <Route path="/products"      element={<Protected><Products /></Protected>} />
        <Route path="/inventory"     element={<Protected><Inventory /></Protected>} />
        <Route path="/orders"        element={<Protected><Orders /></Protected>} />
        <Route path="/integrations"  element={<Protected><Integrations /></Protected>} />
        <Route path="/organizations" element={<Protected><Organizations /></Protected>} />
        <Route path="/analytics"     element={<Protected><Analytics /></Protected>} />
        <Route path="/events"        element={<Protected><Events /></Protected>} />
        <Route path="/users"         element={<Protected><Users /></Protected>} />
        <Route path="/settings"      element={<Protected><Settings /></Protected>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}
export default App
