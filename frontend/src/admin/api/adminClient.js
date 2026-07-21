import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const ACCESS_TOKEN_KEY = 'portfolio_access_token'
export const REFRESH_TOKEN_KEY = 'portfolio_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Separate axios instance for admin/authenticated calls — keeps the public
// site's plain client (src/api/client.js) untouched, avoiding any risk of
// leaking auth headers into public requests.
const adminClient = axios.create({
  baseURL,
  timeout: 15000,
})

adminClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

function redirectToLogin() {
  clearTokens()
  if (window.location.pathname !== '/admin/login') {
    window.location.assign('/admin/login')
  }
}

async function performRefresh() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No refresh token available')
  const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh })
  setTokens({ access: data.access })
  return data.access
}

adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error)
    }

    // Don't try to refresh the refresh call itself or the login call.
    if (config.url?.includes('/auth/refresh/') || config.url?.includes('/auth/login/')) {
      redirectToLogin()
      return Promise.reject(error)
    }

    config._retry = true

    try {
      // Coalesce concurrent 401s into a single refresh request.
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null
        })
      }
      const newAccess = await refreshPromise
      config.headers.Authorization = `Bearer ${newAccess}`
      return adminClient(config)
    } catch (refreshErr) {
      redirectToLogin()
      return Promise.reject(refreshErr)
    }
  }
)

export default adminClient
