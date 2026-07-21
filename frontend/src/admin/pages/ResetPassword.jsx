import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LucideLoader2 as Loader2, LucideAlertCircle as AlertCircle, LucideCheck as Check } from 'lucide-react'
import { WindowTitlebar } from '../../components/ui/WindowChrome'
import { resetPassword } from '../api/adminResources'

/** Sets a new password using the uid/token pair from the emailed reset link, then redirects to login after a short delay. */
export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setStatus('loading')
    setError('')
    try {
      await resetPassword({ uid, token, new_password: newPassword })
      setStatus('done')
      setTimeout(() => navigate('/admin/login'), 1800)
    } catch (err) {
      setStatus('idle')
      setError(err?.response?.data?.detail || 'Invalid or expired reset link.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-fixed bg-dot-grid px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft shadow-2xl">
        <WindowTitlebar label="admin/reset-password.jsx" />
        <div className="p-7">
          <h1 className="font-display text-xl font-bold text-cream-fixed">Reset Password</h1>

          {status === 'done' ? (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs text-accent">
              <Check size={15} className="mt-0.5 shrink-0" />
              Password reset. Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-cream-fixed/50">new password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-cream-fixed/15 bg-black/20 px-3.5 py-2.5 text-sm text-cream-fixed focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs text-cream-fixed/50">confirm password</label>
                <input
                  required
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-cream-fixed/15 bg-black/20 px-3.5 py-2.5 text-sm text-cream-fixed focus:border-accent focus:outline-none"
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
                {status === 'loading' ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="mt-5 font-mono text-xs">
            <Link to="/admin/login" className="text-cream-fixed/40 hover:text-accent">
              &larr; Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
