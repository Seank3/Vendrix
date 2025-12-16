import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from './store'
import ProtectedRoute from './components/ProtectedRoute'
import ToastContainer from './components/Toast'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react'

// Sidebar Component
const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation()

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', path: '/orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', path: '/users', label: 'Users', icon: UsersIcon },
    { id: 'integrations', path: '/integrations', label: 'Integrations', icon: SettingsIcon },
    { id: 'settings', path: '/settings', label: 'Settings', icon: SettingsIcon }
  ]

  const currentPath = location.pathname

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isCollapsed ? '80px' : '280px',
      backgroundColor: '#0f0f0f',
      borderRight: '1px solid #1f1f1f',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #1f1f1f',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#ffffff'
        }}>
          EC
        </div>
        {!isCollapsed && (
          <div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#ffffff',
              lineHeight: '1.2'
            }}>
              E-Commerce
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#a3a3a3'
            }}>
              Integration Hub
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path

          return (
            <a
              key={item.id}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1.5rem',
                color: isActive ? '#3b82f6' : '#a3a3a3',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #3b82f6' : 'none',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Icon size={20} />
              {!isCollapsed && (
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {item.label}
                </span>
              )}

              {isCollapsed && (
                <div style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  marginLeft: '0.5rem',
                  zIndex: 1001
                }}>
                  {item.label}
                </div>
              )}
            </a>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #1f1f1f'
      }}>
        <button
          onClick={() => {
            useAuthStore.getState().logout()
            window.location.href = '/login'
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#a3a3a3',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

// Top Navigation Component
const TopNav = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuthStore()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    const titles = {
      '/dashboard': 'Dashboard',
      '/analytics': 'Analytics',
      '/orders': 'Orders',
      '/users': 'Users',
      '/integrations': 'Integrations',
      '/settings': 'Settings'
    }
    return titles[path] || 'Dashboard'
  }

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: isCollapsed ? '80px' : '280px',
      right: 0,
      height: '64px',
      backgroundColor: '#0f0f0f',
      borderBottom: '1px solid #1f1f1f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 999,
      transition: 'left 0.3s ease'
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#a3a3a3',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          width: '300px'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#737373'
          }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#a3a3a3',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%'
          }} />
        </button>

        {/* User Menu */}
        <div className="user-menu" style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={16} style={{
              transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              width: '200px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #2a2a2a',
                fontSize: '0.875rem',
                color: '#a3a3a3'
              }}>
                {user?.email || user?.username || 'demo@example.com'}
              </div>
              <button
                onClick={() => {
                  window.location.href = '/settings'
                  setUserMenuOpen(false)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Profile Settings
              </button>
              <button
                onClick={() => {
                  useAuthStore.getState().logout()
                  window.location.href = '/login'
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Layout Component
const MainLayout = ({ children }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <TopNav isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

      <main style={{
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        marginTop: '64px',
        padding: '2rem',
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </main>

      <ToastContainer />
    </div>
  )
}

// Enhanced Login Component
const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        await login({ username, ...data.user }, data.token)
        navigate('/dashboard')
      } else {
        throw new Error('Login failed')
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.')
      console.error('Login error:', err)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 auto 1rem'
          }}>
            EC
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#a3a3a3',
            margin: 0
          }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#a3a3a3',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem'
              }}
              placeholder="Enter your username"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#a3a3a3',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#a3a3a3'
          }}>
            <a href="#" style={{
              color: '#3b82f6',
              textDecoration: 'none'
            }}>
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #3b82f6',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <MainLayout>
            <Orders />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <MainLayout>
            <Users />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/integrations" element={
        <ProtectedRoute>
          <MainLayout>
            <Integrations />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
