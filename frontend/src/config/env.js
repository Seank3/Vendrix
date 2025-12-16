// Environment configuration
export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  },
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
}

export default config