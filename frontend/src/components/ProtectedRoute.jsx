import { Navigate, useLocation } from 'react-router-dom'
import { SkeletonCard } from './Skeleton'

const ProtectedRoute = ({ children }) => {
  // For now, allow access to all routes
  // In a real app, you would check authentication status here
  const isAuthenticated = true
  const isLoading = false
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute