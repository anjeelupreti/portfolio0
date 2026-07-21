import { useState } from 'react'
import { LucideLoader2 as Loader2, LucideKey as Key } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { changePassword } from '../api/adminResources'
import { useToast } from '../components/Toast'

/** Settings page letting the logged-in admin change their own password, given the current one. */
export default function ChangePassword() {
  const { push } = useToast()
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm) {
      push('New passwords do not match.', 'error')
      return
    }
    setSaving(true)
    try {
      await changePassword({ old_password: form.old_password, new_password: form.new_password })
      push('Password changed successfully.', 'success')
      setForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      push(err?.response?.data?.detail || 'Failed to change password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Settings</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Change Password</h1>
      </div>

      <Card title="change-password.form" className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">current password</label>
            <input
              required
              type="password"
              name="old_password"
              value={form.old_password}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">new password</label>
            <input
              required
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">confirm new password</label>
            <input
              required
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            {saving ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </Card>
    </div>
  )
}
