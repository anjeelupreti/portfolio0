import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LucideLoader2 as Loader2, LucideCheck as Check } from 'lucide-react'
import { WindowTitlebar } from '../../components/ui/WindowChrome'
import { forgotPassword } from '../api/adminResources'

/** Requests a password reset email. Always shows the "sent" confirmation regardless of outcome, since the backend intentionally doesn't reveal whether the email exists. */
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await forgotPassword(email)
    } catch {
    } finally {
      setStatus('sent')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-fixed bg-dot-grid px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft shadow-2xl">
        <WindowTitlebar label="admin/forgot-password.jsx" />
        <div className="p-7">
          <h1 className="font-display text-xl font-bold text-cream-fixed">Forgot Password</h1>
          <p className="mt-1 font-mono text-xs text-cream-fixed/40">
            We'll email you a reset link if the account exists.
          </p>

          {status === 'sent' ? (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs text-accent">
              <Check size={15} className="mt-0.5 shrink-0" />
              If an account with that email exists, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-cream-fixed/50">email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-cream-fixed/15 bg-black/20 px-3.5 py-2.5 text-sm text-cream-fixed placeholder:text-cream-fixed/30 focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-fixed transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
                {status === 'loading' ? 'Sending...' : 'Send reset link'}
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
