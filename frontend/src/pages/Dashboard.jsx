import React, { useEffect, useState } from 'react'
import { SkeletonCard } from '../components/Skeleton'
import AnimatedNumber from '../components/AnimatedNumber'
import { dashboardAPI } from '../services/api'
import { getDashboardMetrics, IS_DEMO } from '../data/demoData'
import {
  DollarSign,
  ShoppingCart,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react'

const KPICard = ({ title, value, change, icon: Icon, trend, loading, prefix = '', suffix = '', decimals = 0 }) => {
  if (loading) {
    return <SkeletonCard />
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center gap-4 shadow-lg">
      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-400 mb-1">{title}</div>
        <div className="text-3xl font-bold text-white mb-1">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
        {change && (
          <div className={`text-sm flex items-center gap-1 ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const data = await dashboardAPI.getMetrics()
        setMetrics(data)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
        // Use demo data as fallback
        if (IS_DEMO) {
          console.log('Using demo data for dashboard')
          setTimeout(() => {
            setMetrics(getDashboardMetrics())
            setLoading(false)
          }, 500) // Small delay for demo effect
        } else {
          setError('Failed to load dashboard data')
          setLoading(false)
        }
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-lg text-gray-400">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={metrics?.revenue || 0}
          change={metrics?.revenue_growth ? `${metrics.revenue_growth > 0 ? '+' : ''}${metrics.revenue_growth.toFixed(1)}%` : ''}
          icon={DollarSign}
          trend={metrics?.revenue_growth > 0 ? 'up' : metrics?.revenue_growth < 0 ? 'down' : 'neutral'}
          loading={loading}
          prefix="$"
          suffix=""
          decimals={0}
        />
        <KPICard
          title="Total Orders"
          value={metrics?.orders || 0}
          change=""
          icon={ShoppingCart}
          trend="neutral"
          loading={loading}
          prefix=""
          suffix=""
          decimals={0}
        />
        <KPICard
          title="Active Users"
          value={metrics?.users || 0}
          change=""
          icon={Activity}
          trend="neutral"
          loading={loading}
          prefix=""
          suffix=""
          decimals={0}
        />
        <KPICard
          title="Success Rate"
          value={metrics?.success_rate || 0}
          change=""
          icon={TrendingUp}
          trend="neutral"
          loading={loading}
          prefix=""
          suffix="%"
          decimals={1}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-80 bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">
            <BarChart3 className="w-12 h-12" />
            <span className="ml-4">Revenue Chart Placeholder</span>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Order Analytics</h3>
          <div className="h-80 bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">
            <Activity className="w-12 h-12" />
            <span className="ml-4">Analytics Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard