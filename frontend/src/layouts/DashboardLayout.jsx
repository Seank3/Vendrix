import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IS_DEMO } from '../data/demoData'
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
  Menu,
  Package
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Integrations', href: '/integrations', icon: SettingsIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    // In a real app, you would clear authentication state
    navigate('/login')
  }

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 z-50
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <div className="text-lg font-bold text-white">Ecommerce</div>
            <div className="text-xs text-gray-400">Dashboard</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    sidebar-link relative
                    ${isActive ? 'active' : ''}
                  `}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 border border-red-800 rounded-lg hover:bg-red-900 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

const TopNav = ({ isCollapsed, setIsCollapsed }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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

  return (
    <div className={`
      fixed top-0 h-16 bg-gray-800 border-b border-gray-700 transition-all duration-300 z-40
      ${isCollapsed ? 'left-16' : 'left-64'} right-0
    `}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
            <p className="text-sm text-gray-400">Welcome back, Admin</p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Demo Mode Badge */}
          {IS_DEMO && (
            <div className="px-3 py-1 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-xs font-medium text-yellow-400">
              Demo Mode
            </div>
          )}

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                A
              </div>
              <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="text-sm font-medium text-white">Admin User</div>
                  <div className="text-xs text-gray-400">admin@example.com</div>
                </div>
                <Link to="/settings" className="block px-4 py-2 text-sm text-white hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    // Handle logout
                    setUserMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <TopNav isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

      <main className={`
        transition-all duration-300 pt-16
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout