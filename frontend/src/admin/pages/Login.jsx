import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LucideLoader2 as Loader2, LucideAlertCircle as AlertCircle } from 'lucide-react'
import { WindowTitlebar } from '../../components/ui/WindowChrome'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await login(form.username, form.password)
      const dest = location.state?.from?.pathname || '/admin/overview'
      navigate(dest, { replace: true })
    } catch (err) {
      setStatus('idle')
      setError(
        err?.response?.data?.detail || 'Invalid username or password.'
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-fixed bg-dot-grid px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft shadow-2xl">
        <WindowTitlebar label="admin/login.jsx" />
        <div className="p-7">
          <h1 className="font-display text-xl font-bold text-cream-fixed">Admin Login</h1>
          <p className="mt-1 font-mono text-xs text-cream-fixed/40">
            &lt;PortfolioDashboard /&gt;
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs text-cream-fixed/50">username</label>
              <input
                required
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-cream-fixed/15 bg-black/20 px-3.5 py-2.5 text-sm text-cream-fixed placeholder:text-cream-fixed/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs text-cream-fixed/50">password</label>
              <input
                required
                type="password"
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-cream-fixed/15 bg-black/20 px-3.5 py-2.5 text-sm text-cream-fixed placeholder:text-cream-fixed/30 focus:border-accent focus:outline-none"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 font-mono text-xs text-red-300">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-fixed transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between font-mono text-xs">
            <Link to="/admin/forgot-password" className="text-cream-fixed/40 hover:text-accent">
              Forgot password?
            </Link>
            <Link to="/" className="text-cream-fixed/40 hover:text-accent">
              &larr; Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
