import React, { useEffect, useState } from 'react'
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

const styles = {
  // Dark Theme Variables
  colors: {
    bg: '#0a0a0a',
    bgSecondary: '#111111',
    bgTertiary: '#1a1a1a',
    border: '#2a2a2a',
    borderLight: '#333333',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },

  // Global Styles
  app: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    color: '#ffffff',
  },

  // Layout Components
  sidebar: {
    width: '280px',
    backgroundColor: '#111111',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
  },

  sidebarCollapsed: {
    transform: 'translateX(-100%)',
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },

  topNav: {
    height: '64px',
    backgroundColor: '#111111',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
  },

  contentArea: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },

  // Cards and Components
  card: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },

  kpiCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },

  // Form Elements
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },

  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  buttonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#a3a3a3',
  },

  // Status and Badges
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  statusEnabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },

  statusDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },

  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
  },

  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  },

  statusFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },

  // Tables
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },

  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#a3a3a3',
    borderBottom: '1px solid #2a2a2a',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  tableCell: {
    padding: '1rem',
    borderBottom: '1px solid #2a2a2a',
    color: '#ffffff',
  },

  // Grid Layouts
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },

  // Typography
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
  },

  subheading: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#a3a3a3',
    margin: '0 0 1rem 0',
  },

  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 1rem 0',
  },

  // Utilities
  flex: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    color: '#a3a3a3',
  },

  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#737373',
  },

  // Login Specific
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    padding: '1rem',
  },

  loginCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },

  loginTitle: {
    textAlign: 'center',
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },

  loginSubtitle: {
    textAlign: 'center',
    color: '#a3a3a3',
    marginBottom: '2rem',
  },

  // Mobile
  mobileMenu: {
    display: 'none',
  },

  '@media (max-width: 768px)': {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 1000,
    },
    mobileMenu: {
      display: 'block',
    },
  },
}

// Modern Components
const Card = ({ title, children, action, className = '' }) => (
  <div style={{ ...styles.card, ...(className && {}) }}>
    {(title || action) && (
      <div style={styles.flexBetween}>
        {title && <h3 style={styles.cardTitle}>{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
)

const KPICard = ({ title, value, change, icon: Icon, trend }) => (
  <div style={styles.kpiCard}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={24} color="#3b82f6" />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.25rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
        {value}
      </div>
      {change && (
        <div style={{
          fontSize: '0.875rem',
          color: trend === 'up' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      )}
    </div>
  </div>
)

const StatusBadge = ({ status, children }) => {
  const statusStyles = {
    enabled: styles.statusEnabled,
    disabled: styles.statusDisabled,
    success: styles.statusSuccess,
    pending: styles.statusPending,
    failed: styles.statusFailed,
  }

  return (
    <span style={{
      ...styles.statusBadge,
      ...statusStyles[status] || styles.statusEnabled
    }}>
      {children}
    </span>
  )
}

const Button = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, ...props }) => {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyle = styles.button
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.75rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' },
  }

  const variantStyles = {
    secondary: styles.buttonSecondary,
    success: { backgroundColor: '#10b981' },
    danger: { backgroundColor: '#ef4444' },
  }

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...(variantStyles[variant] || {}),
        ...(isHovered ? styles.buttonHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const Input = ({ label, type = 'text', placeholder, icon: Icon, showPasswordToggle, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#a3a3a3',
          marginBottom: '0.5rem'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#737373'
          }}>
            <Icon size={18} />
          </div>
        )}
        <input
          type={showPasswordToggle && showPassword ? 'text' : type}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...(Icon ? { paddingLeft: '2.5rem' } : {}),
            ...(showPasswordToggle ? { paddingRight: '2.5rem' } : {}),
            ...(isFocused ? styles.inputFocus : {})
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#737373',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}




function CredentialsForm() {
  const [platform, setPlatform] = useState('etsy')
  const [credentialsData, setCredentialsData] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const platforms = [
    { value: 'etsy', label: 'Etsy', fields: ['access_token', 'api_key'] },
    { value: 'woocommerce', label: 'WooCommerce', fields: ['consumer_key', 'consumer_secret'] },
    { value: 'ebay', label: 'eBay', fields: ['app_id', 'cert_id', 'auth_token'] },
    { value: 'jumia', label: 'Jumia', fields: ['api_key', 'merchant_id'] },
    { value: 'jiji', label: 'Jiji', fields: ['api_token', 'store_id'] },
    { value: 'shopify', label: 'Shopify', fields: ['access_token', 'shop_domain'] },
  ]

  const currentPlatform = platforms.find(p => p.value === platform)

  useEffect(() => {
    loadCredentials()
  }, [platform])

  const loadCredentials = async () => {
    try {
      const res = await credentials.get(platform)
      setCredentialsData(res.data || {})
    } catch (err) {
      console.error('Failed to load credentials:', err)
    }
  }

  const updateCredential = (field, value) => {
    setCredentialsData(prev => ({ ...prev, [field]: value }))
  }

  const saveCredentials = async () => {
    setLoading(true)
    setMessage('')
    try {
      await credentials.save(platform, credentialsData)
      setMessage('Credentials saved successfully!')
      setMessageType('success')
    } catch (err) {
      setMessage('Failed to save credentials')
      setMessageType('error')
      console.error('Save error:', err)
    }
    setLoading(false)
  }

  const testCredentials = async () => {
    setLoading(true)
    setMessage('')
    try {
      // This would call a test endpoint in a real app
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setMessage('Credentials test successful!')
      setMessageType('success')
    } catch (err) {
      setMessage('Credentials test failed')
      setMessageType('error')
    }
    setLoading(false)
  }

  return (
    <Card title="Platform Credentials">
      <div style={styles.formGroup}>
        <label style={styles.label}>Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={styles.input}
        >
          {platforms.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {currentPlatform && (
        <div>
          <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#374151' }}>
            Required Fields for {currentPlatform.label}
          </h4>
          {currentPlatform.fields.map(field => (
            <div key={field} style={styles.formGroup}>
              <label style={styles.label}>
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <input
                type={field.includes('token') || field.includes('key') ? 'password' : 'text'}
                value={credentialsData[field] || ''}
                onChange={(e) => updateCredential(field, e.target.value)}
                style={styles.input}
                placeholder={`Enter ${field.replace(/_/g, ' ')}`}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button onClick={saveCredentials} disabled={loading}>
              {loading ? 'Saving...' : 'Save Credentials'}
            </Button>
            <Button onClick={testCredentials} disabled={loading} variant="success">
              Test Connection
            </Button>
          </div>

          {message && (
            <div style={{
              ...styles.message,
              ...(messageType === 'success' ? styles.messageSuccess : styles.messageError)
            }}>
              {message}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// Sidebar Component
const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [activeItem, setActiveItem] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{
      ...styles.sidebar,
      ...(isCollapsed ? styles.sidebarCollapsed : {}),
      position: window.innerWidth <= 768 ? 'fixed' : 'relative',
      zIndex: window.innerWidth <= 768 ? 1000 : 'auto'
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Package size={20} color="#ffffff" />
        </div>
        {!isCollapsed && (
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              E-Commerce
            </div>
            <div style={{ fontSize: '0.75rem', color: '#737373' }}>
              Integration Hub
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <li key={item.id} style={{ marginBottom: '0.25rem' }}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: isActive ? '#3b82f6' : '#a3a3a3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <Icon size={18} />
                  {!isCollapsed && item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid #2a2a2a' }}>
        <button
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem',
            fontWeight: '500',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
        >
          <LogOut size={18} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  )
}

// Top Navigation Component
const TopNav = ({ onMenuClick }) => {
  return (
    <div style={styles.topNav}>
      <div style={styles.flex}>
        <button
          onClick={onMenuClick}
          style={{
            ...styles.mobileMenu,
            background: 'none',
            border: 'none',
            color: '#a3a3a3',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ ...styles.heading, fontSize: '1.5rem', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ ...styles.subheading, fontSize: '0.875rem', margin: 0 }}>
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      <div style={styles.flex}>
        {/* Search */}
        <div style={{ position: 'relative', marginRight: '1rem' }}>
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
              ...styles.input,
              width: '250px',
              paddingLeft: '2.25rem',
              backgroundColor: '#111111',
              border: '1px solid #2a2a2a'
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{
          background: 'none',
          border: 'none',
          color: '#a3a3a3',
          cursor: 'pointer',
          padding: '0.5rem',
          position: 'relative',
          marginRight: '1rem'
        }}>
          <Bell size={20} />
          <div style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444'
          }} />
        </button>

        {/* User Menu */}
        <div style={styles.flex}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.5rem'
          }}>
            <User size={16} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.875rem', color: '#ffffff' }}>Admin</span>
            <ChevronDown size={14} color="#a3a3a3" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div style={{ ...styles.app, minHeight: '100vh', display: 'flex' }}>
      <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

      <div style={styles.mainContent}>
        <TopNav onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div style={styles.contentArea}>
          {/* KPI Cards */}
          <div style={styles.kpiGrid}>
            <KPICard
              title="Total Revenue"
              value="$45,231"
              change="+20.1%"
              icon={DollarSign}
              trend="up"
            />
            <KPICard
              title="Orders Today"
              value="234"
              change="+12.5%"
              icon={ShoppingCart}
              trend="up"
            />
            <KPICard
              title="Active Integrations"
              value="8"
              change="2 pending"
              icon={Activity}
              trend="neutral"
            />
            <KPICard
              title="Success Rate"
              value="98.5%"
              change="-0.2%"
              icon={TrendingUp}
              trend="down"
            />
          </div>

          {/* Main Content Grid */}
          <div style={styles.dashboardGrid}>
            <Integrations />
            <Orders />

            {/* Chart Placeholders */}
            <Card title="Revenue Trend">
              <div style={{
                height: '200px',
                backgroundColor: '#111111',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#737373'
              }}>
                <BarChart3 size={48} />
                <span style={{ marginLeft: '1rem' }}>Revenue Chart</span>
              </div>
            </Card>

            <Card title="Order Status">
              <div style={{
                height: '200px',
                backgroundColor: '#111111',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#737373'
              }}>
                <Activity size={48} />
                <span style={{ marginLeft: '1rem' }}>Status Chart</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await auth.login({ username: email, password })
      navigate('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
      console.error('Login error:', err)
    }
    setLoading(false)
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Package size={32} color="#ffffff" />
          </div>
          <h1 style={styles.loginTitle}>Welcome Back</h1>
          <p style={styles.loginSubtitle}>
            Sign in to your E-Commerce Integration Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <a href="#" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Forgot password?
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <X size={16} />
              {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1.5rem' }}
            size="lg"
          >
            {loading ? (
              <>
                <Activity className="animate-spin" size={16} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Create Account Link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <a href="#" style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Create one
              </a>
            </span>
          </div>
        </form>

        {/* Security Note */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#10b981',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <Lock size={16} />
            Your data is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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

  useEffect(() => {
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

