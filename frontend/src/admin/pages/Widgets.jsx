import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2 } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getSiteWidgetsAdmin, updateSiteWidgets } from '../api/adminResources'
import { useToast } from '../components/Toast'
import { buildWhatsAppUrl } from '../../components/ui/WhatsAppButton'

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-accent' : 'bg-ink/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function Widgets() {
  const { push } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getSiteWidgetsAdmin()
      .then((data) => {
        if (!data) return
        setEnabled(!!data.whatsapp_enabled)
        setNumber(data.whatsapp_number || '')
        setMessage(data.whatsapp_default_message || '')
      })
      .catch(() => push('Failed to load widget settings.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = async (next) => {
    const prev = enabled
    setEnabled(next)
    try {
      await updateSiteWidgets({ whatsapp_enabled: next })
      push(`WhatsApp button is now ${next ? 'enabled' : 'disabled'}.`, 'success')
    } catch {
      setEnabled(prev)
      push('Failed to update WhatsApp button.', 'error')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateSiteWidgets({
        whatsapp_number: number,
        whatsapp_default_message: message,
      })
      setNumber(updated.whatsapp_number || '')
      setMessage(updated.whatsapp_default_message || '')
      push('Widget settings saved.', 'success')
    } catch (err) {
      const detail =
        err?.response?.data &&
        Object.values(err.response.data).flat().join(' ')
      push(detail || 'Failed to save widget settings.', 'error')
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

  const previewUrl = buildWhatsAppUrl(number, message)

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Widgets</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">WhatsApp Button</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Controls the floating "Chat on WhatsApp" button shown to visitors on the public site.
        </p>
      </div>

      <Card title="whatsapp-widget.json">
        <div className="flex items-center justify-between gap-4 pb-5">
          <div>
            <p className="font-medium text-ink">Enable floating button</p>
            <p className="font-mono text-[11px] text-ink/40">
              Show or hide the button across all public pages.
            </p>
          </div>
          <Switch checked={enabled} onChange={handleToggle} />
        </div>

        <div className="space-y-5 border-t border-ink/10 pt-5">
          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">WhatsApp number</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+9779843951313"
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1.5 font-mono text-[11px] text-ink/40">
              Include country code, e.g. +9779843951313, no spaces or dashes.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">Default message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Hi! I found your portfolio and would like to get in touch."
              className="w-full resize-none rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1.5 font-mono text-[11px] text-ink/40">
              Prefilled message visitors see when they open the chat.
            </p>
          </div>
        </div>
      </Card>

      <Card title="preview.jsx">
        <div className="space-y-4">
          <div className="relative h-28 overflow-hidden rounded-xl border border-ink/10 bg-cream">
            <div
              className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-black/20"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg viewBox="0 0 32 32" width="28" height="28" fill="white" aria-hidden="true">
                <path d="M16.001 3C9.098 3 3.5 8.598 3.5 15.5c0 2.31.63 4.474 1.727 6.33L3 29l7.36-2.184A12.44 12.44 0 0 0 16.001 28C22.903 28 28.5 22.402 28.5 15.5S22.903 3 16.001 3Zm0 22.75a10.2 10.2 0 0 1-5.207-1.427l-.373-.222-4.367 1.296 1.317-4.256-.243-.39A10.19 10.19 0 0 1 5.75 15.5c0-5.66 4.591-10.25 10.251-10.25 5.659 0 10.25 4.59 10.25 10.25 0 5.66-4.591 10.25-10.25 10.25Zm5.633-7.674c-.309-.155-1.828-.902-2.111-1.005-.283-.103-.489-.155-.695.155-.206.31-.797 1.005-.977 1.211-.18.206-.36.232-.668.077-.309-.155-1.303-.48-2.482-1.53-.917-.818-1.536-1.828-1.716-2.137-.18-.31-.019-.477.136-.63.14-.14.309-.361.464-.542.155-.18.206-.31.309-.516.103-.206.051-.387-.026-.542-.077-.155-.695-1.675-.953-2.294-.251-.603-.506-.522-.695-.532l-.593-.01c-.206 0-.542.077-.825.387-.283.31-1.08 1.056-1.08 2.576s1.106 2.988 1.26 3.194c.155.206 2.177 3.324 5.276 4.66.737.318 1.312.508 1.76.65.739.235 1.412.202 1.944.123.593-.089 1.828-.747 2.086-1.469.258-.722.258-1.34.18-1.469-.077-.129-.283-.206-.592-.361Z" />
              </svg>
            </div>
            {!enabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream/70 font-mono text-[11px] text-ink/40">
                button hidden (disabled)
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 font-mono text-[11px] text-ink/40">Link visitors will open:</p>
            <p className="break-all rounded-lg border border-ink/10 bg-ink/[0.03] px-3.5 py-2.5 font-mono text-xs text-ink/70">
              {previewUrl}
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
          Save Widget Settings
        </button>
      </div>
    </div>
  )
}
