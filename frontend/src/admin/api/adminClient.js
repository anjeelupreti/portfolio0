import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const ACCESS_TOKEN_KEY = 'portfolio_access_token'
export const REFRESH_TOKEN_KEY = 'portfolio_refresh_token'

/** Reads the persisted access token from localStorage. */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** Reads the persisted refresh token from localStorage. */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** Persists whichever of access/refresh tokens are provided to localStorage. */
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

/** Removes both stored tokens, e.g. on logout or forced re-auth. */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** Authenticated axios instance for the admin dashboard, kept separate from the public site's client so auth headers never leak into public requests. */
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

/** Clears stored tokens and sends the browser to the login page, unless already there. */
function redirectToLogin() {
  clearTokens()
  if (window.location.pathname !== '/admin/login') {
    window.location.assign('/admin/login')
  }
}

/** Exchanges the stored refresh token for a new access token and persists it. */
async function performRefresh() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No refresh token available')
  const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh })
  setTokens({ access: data.access })
  return data.access
}

/**
 * On a 401 (excluding the login/refresh endpoints themselves), transparently
 * refreshes the access token and retries the original request once. Concurrent
 * 401s share a single in-flight refresh via `refreshPromise`.
 */
adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error)
    }

    if (config.url?.includes('/auth/refresh/') || config.url?.includes('/auth/login/')) {
      redirectToLogin()
      return Promise.reject(error)
    }

    config._retry = true

    try {
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
