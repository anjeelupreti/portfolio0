import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2 } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getEmailSettingsAdmin, updateEmailSettings } from '../api/adminResources'
import { useToast } from '../components/Toast'

/** Small toggle-switch control used by ToggleRow. */
function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-accent' : 'bg-ink/15'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/** Labeled row pairing a title/description with a Switch, used for each toggle setting. */
function ToggleRow({ title, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="font-mono text-[11px] text-ink/40">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

/** Admin settings page controlling what happens when the public contact form is submitted — owner notification and visitor auto-reply. */
export default function EmailSettings() {
  const { push } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notifyOwnerEnabled, setNotifyOwnerEnabled] = useState(false)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  const [autoReplySubject, setAutoReplySubject] = useState('')
  const [autoReplyMessage, setAutoReplyMessage] = useState('')

  useEffect(() => {
    getEmailSettingsAdmin()
      .then((data) => {
        if (!data) return
        setNotifyOwnerEnabled(!!data.notify_owner_enabled)
        setAutoReplyEnabled(!!data.auto_reply_enabled)
        setAutoReplySubject(data.auto_reply_subject || '')
        setAutoReplyMessage(data.auto_reply_message || '')
      })
      .catch(() => push('Failed to load email settings.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Builds an optimistic toggle handler (update state, PATCH field, revert on failure) for a simple boolean setting. */
  const makeToggleHandler = (setState, field, label) => async (next) => {
    setState(next)
    try {
      await updateEmailSettings({ [field]: next })
      push(`${label} is now ${next ? 'enabled' : 'disabled'}.`, 'success')
    } catch {
      setState(!next)
      push(`Failed to update ${label}.`, 'error')
    }
  }

  const handleNotifyOwnerToggle = makeToggleHandler(setNotifyOwnerEnabled, 'notify_owner_enabled', 'Owner notification')
  const handleAutoReplyToggle = makeToggleHandler(setAutoReplyEnabled, 'auto_reply_enabled', 'Visitor auto-reply')

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateEmailSettings({
        auto_reply_subject: autoReplySubject,
        auto_reply_message: autoReplyMessage,
      })
      setAutoReplySubject(updated.auto_reply_subject || '')
      setAutoReplyMessage(updated.auto_reply_message || '')
      push('Email settings saved.', 'success')
    } catch (err) {
      const detail =
        err?.response?.data &&
        Object.values(err.response.data).flat().join(' ')
      push(detail || 'Failed to save email settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-ink/30" size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Email</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Email Settings</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Controls what happens when a visitor submits the public contact form.
        </p>
      </div>

      <Card title="owner-notification.json">
        <ToggleRow
          title="Notify me by email"
          description="Send a copy of every contact form submission to your configured receiver email (CONTACT_RECEIVER_EMAIL)."
          checked={notifyOwnerEnabled}
          onChange={handleNotifyOwnerToggle}
        />
      </Card>

      <Card title="visitor-auto-reply.json">
        <div className="pb-5">
          <ToggleRow
            title="Send visitor auto-reply"
            description="Confirms receipt to whoever submitted the contact form."
            checked={autoReplyEnabled}
            onChange={handleAutoReplyToggle}
          />
        </div>

        <div className="space-y-5 border-t border-ink/10 pt-5">
          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">Subject</label>
            <input
              type="text"
              value={autoReplySubject}
              onChange={(e) => setAutoReplySubject(e.target.value)}
              placeholder="Thanks for reaching out!"
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">Message</label>
            <textarea
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
              rows={7}
              placeholder="Hi {name}, thanks for getting in touch..."
              className="w-full resize-none rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1.5 font-mono text-[11px] text-ink/40">
              Use <code className="rounded bg-ink/5 px-1">{'{name}'}</code> for the visitor's name and{' '}
              <code className="rounded bg-ink/5 px-1">{'{owner_name}'}</code> for your name — both are filled in automatically.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-105 disabled:opacity-50"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save Email Settings
        </button>
      </div>
    </div>
  )
}
