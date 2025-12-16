import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react'
import { analyticsAPI } from '../services/api'
import { getAnalyticsData, IS_DEMO } from '../data/demoData'

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const analyticsData = await analyticsAPI.getOverview(range)
        setData(analyticsData)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        // Use demo data as fallback
        if (IS_DEMO) {
          console.log('Using demo data for analytics')
          setTimeout(() => {
            setData(getAnalyticsData())
            setLoading(false)
          }, 500)
        } else {
          setError('Failed to load analytics data')
          setLoading(false)
        }
      }
    }

    fetchAnalytics()
  }, [range])

  const handleRangeChange = (newRange) => {
    setRange(newRange)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-lg text-gray-400">Track your performance and business insights</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={range}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Revenue</div>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `$${data?.summary?.totalRevenue || '0'}`}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Revenue for selected period
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Orders</div>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : data?.summary?.totalOrders || '0'}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Orders processed
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Avg Order Value</div>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `$${data?.summary?.averageOrderValue || '0'}`}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Average per order
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Conversion Rate</div>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `${data?.summary?.conversionRate || '0%'}`}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Customer conversion
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend (Last 30 Days)</h3>
          <div className="h-80 bg-gray-900 rounded-lg border border-gray-600 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <BarChart3 className="w-8 h-8 animate-pulse" />
                <span className="ml-2">Loading chart...</span>
              </div>
            ) : data?.chartData ? (
              <div className="flex items-end justify-between h-full gap-1">
                {data.chartData.revenue.slice(-14).map((value, index) => {
                  const maxValue = Math.max(...data.chartData.revenue.slice(-14))
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all duration-1000 ease-out"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top">
                        {data.chartData.labels.slice(-14)[index]}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <BarChart3 className="w-12 h-12" />
                <span className="ml-4">No chart data available</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Top Products</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-400 text-center py-8">
                <div className="animate-pulse">Loading products...</div>
              </div>
            ) : data?.topProducts ? (
              data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="text-white">{product.name}</div>
                  <div className="text-gray-400 font-semibold">
                    ${product.revenue?.toLocaleString() || '0'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">No product data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics