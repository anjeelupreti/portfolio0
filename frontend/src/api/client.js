import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

/** Shared axios instance for all backend API calls; base URL is configurable via VITE_API_BASE_URL. */
const client = axios.create({
  baseURL,
  timeout: 10000,
})

export default client
