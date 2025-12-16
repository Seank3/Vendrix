import React, { useState, useEffect } from 'react'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import { projectsAPI } from '../services/api'
import { getRecentOrders, IS_DEMO } from '../data/demoData'

const Orders = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await projectsAPI.getProjects()
        setProjects(data.results || data || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        // Use demo data as fallback
        if (IS_DEMO) {
          console.log('Using demo data for orders')
          setTimeout(() => {
            setProjects(getRecentOrders().map(order => ({
              id: order.id,
              order_id: order.id,
              customer_name: order.customer,
              platform: 'Shopify', // Demo platform
              status: order.status,
              total_amount: order.amount,
              created_at: order.date
            })))
            setLoading(false)
          }, 500)
        } else {
          setError('Failed to load projects data')
          setLoading(false)
        }
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-400 bg-green-900/20'
      case 'pending': return 'text-yellow-400 bg-yellow-900/20'
      case 'cancelled': return 'text-red-400 bg-red-900/20'
      case 'in_progress': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-lg text-gray-400">Manage and track all your orders</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-gray-400 text-sm">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-400 text-sm">Platform</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-400 text-sm">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-400 text-sm">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-400 text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-700">
                    <td className="px-4 py-3 text-white">{project.order_id || `#${project.id}`}</td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>{project.platform || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{project.customer_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      ${project.total_amount ? project.total_amount.toLocaleString() : '0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Orders