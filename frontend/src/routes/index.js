import { lazy } from 'react'

// Lazy load pages for better performance
const Login = lazy(() => import('../pages/Login'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Analytics = lazy(() => import('../pages/Analytics'))
const Orders = lazy(() => import('../pages/Orders'))
const Users = lazy(() => import('../pages/Users'))
const Integrations = lazy(() => import('../pages/Integrations'))
const Settings = lazy(() => import('../pages/Settings'))

export const routes = [
  {
    path: '/login',
    element: Login,
    layout: 'auth',
    protected: false,
  },
  {
    path: '/dashboard',
    element: Dashboard,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/analytics',
    element: Analytics,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/orders',
    element: Orders,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/users',
    element: Users,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/integrations',
    element: Integrations,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/settings',
    element: Settings,
    layout: 'dashboard',
    protected: true,
  },
  {
    path: '/',
    redirect: '/dashboard',
    protected: true,
  },
]

export default routes
