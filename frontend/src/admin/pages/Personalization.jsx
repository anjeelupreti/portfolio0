import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2, LucideCheck as Check } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getSiteThemeAdmin, updateSiteTheme, getSiteWidgetsAdmin, updateSiteWidgets } from '../api/adminResources'
import { useToast } from '../components/Toast'
import { useTheme } from '../../lib/theme'
import { buildWhatsAppUrl } from '../../components/ui/WhatsAppButton'

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

/** Labeled row pairing a title/description with a Switch, used for each widget's on/off setting. */
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

/** Site widget settings (WhatsApp, scroll-to-top, resume download, blog share, cookie banner), embedded as a section within Personalization. */
function WidgetsSection() {
  const { push } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [enabled, setEnabled] = useState(false)
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  const [scrollToTopEnabled, setScrollToTopEnabled] = useState(false)
  const [resumeDownloadEnabled, setResumeDownloadEnabled] = useState(false)
  const [blogShareEnabled, setBlogShareEnabled] = useState(false)
  const [cookieBannerEnabled, setCookieBannerEnabled] = useState(false)
  const [cookieMessage, setCookieMessage] = useState('')

  useEffect(() => {
    getSiteWidgetsAdmin()
      .then((data) => {
        if (!data) return
        setEnabled(!!data.whatsapp_enabled)
        setNumber(data.whatsapp_number || '')
        setMessage(data.whatsapp_default_message || '')
        setScrollToTopEnabled(!!data.scroll_to_top_enabled)
        setResumeDownloadEnabled(!!data.resume_download_enabled)
        setBlogShareEnabled(!!data.blog_share_enabled)
        setCookieBannerEnabled(!!data.cookie_banner_enabled)
        setCookieMessage(data.cookie_banner_message || '')
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

  /** Builds an optimistic toggle handler (update state, PATCH field, revert on failure) for a simple boolean widget setting. */
  const makeToggleHandler = (setState, field, label) => async (next) => {
    setState(next)
    try {
      await updateSiteWidgets({ [field]: next })
      push(`${label} is now ${next ? 'enabled' : 'disabled'}.`, 'success')
    } catch {
      setState(!next)
      push(`Failed to update ${label}.`, 'error')
    }
  }

  const handleScrollToTopToggle = makeToggleHandler(setScrollToTopEnabled, 'scroll_to_top_enabled', 'Scroll-to-top button')
  const handleResumeDownloadToggle = makeToggleHandler(setResumeDownloadEnabled, 'resume_download_enabled', 'Resume download button')
  const handleBlogShareToggle = makeToggleHandler(setBlogShareEnabled, 'blog_share_enabled', 'Blog share buttons')
  const handleCookieBannerToggle = makeToggleHandler(setCookieBannerEnabled, 'cookie_banner_enabled', 'Cookie banner')

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateSiteWidgets({
        whatsapp_number: number,
        whatsapp_default_message: message,
        cookie_banner_message: cookieMessage,
      })
      setNumber(updated.whatsapp_number || '')
      setMessage(updated.whatsapp_default_message || '')
      setCookieMessage(updated.cookie_banner_message || '')
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
      <div className="flex min-h-[20vh] items-center justify-center">
        <Loader2 className="animate-spin text-ink/30" size={24} />
      </div>
    )
  }

  const previewUrl = buildWhatsAppUrl(number, message)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-ink">Site Widgets</h2>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Controls the floating buttons, share links, and consent banner shown to visitors on the public site.
        </p>
      </div>

      <Card title="whatsapp-widget.json">
        <div className="pb-5">
          <ToggleRow
            title="Enable floating button"
            description="Show or hide the WhatsApp button across all public pages."
            checked={enabled}
            onChange={handleToggle}
          />
        </div>

        <div className="space-y-5 border-t border-ink/10 pt-5">
          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">WhatsApp number</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+9779843951313"
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
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
              className="w-full resize-none rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
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

      <Card title="scroll-to-top.json">
        <ToggleRow
          title="Enable scroll-to-top button"
          description="Floating button (bottom-left) that appears after scrolling and jumps back to the top of the page."
          checked={scrollToTopEnabled}
          onChange={handleScrollToTopToggle}
        />
      </Card>

      <Card title="resume-download.json">
        <ToggleRow
          title="Enable resume download button"
          description="Shows a 'Resume' button in the navbar, linking to the uploaded resume file. Hidden automatically if no resume has been uploaded on the Profile page."
          checked={resumeDownloadEnabled}
          onChange={handleResumeDownloadToggle}
        />
      </Card>

      <Card title="blog-share.json">
        <ToggleRow
          title="Enable blog share buttons"
          description="Adds X (Twitter), LinkedIn, and copy-link share buttons at the end of every blog post."
          checked={blogShareEnabled}
          onChange={handleBlogShareToggle}
        />
      </Card>

      <Card title="cookie-banner.json">
        <div className="pb-5">
          <ToggleRow
            title="Enable cookie/analytics banner"
            description="Shows a dismissible consent notice to first-time visitors."
            checked={cookieBannerEnabled}
            onChange={handleCookieBannerToggle}
          />
        </div>
        <div className="border-t border-ink/10 pt-5">
          <label className="mb-2 block font-mono text-xs text-ink/50">Banner message</label>
          <textarea
            value={cookieMessage}
            onChange={(e) => setCookieMessage(e.target.value)}
            rows={2}
            placeholder="This site uses cookies for basic analytics to improve your experience."
            className="w-full resize-none rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          />
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

/** Primary/secondary hex pairs for each built-in theme preset, used for the swatch gallery and to seed the custom color pickers on selection. */
const PRESETS = [
  { key: 'lime-ink', label: 'Lime Ink', primary: '#d9ff4b', secondary: '#0a0a0a' },
  { key: 'ocean-blue', label: 'Ocean Blue', primary: '#2563eb', secondary: '#0f172a' },
  { key: 'sunset-orange', label: 'Sunset Orange', primary: '#f97316', secondary: '#1c1208' },
  { key: 'violet-dusk', label: 'Violet Dusk', primary: '#a855f7', secondary: '#1a1025' },
  { key: 'forest-green', label: 'Forest Green', primary: '#22c55e', secondary: '#0d1f13' },
  { key: 'crimson-rose', label: 'Crimson Rose', primary: '#f43f5e', secondary: '#1f0a0f' },
  { key: 'rose-gold', label: 'Rose Gold', primary: '#e8a598', secondary: '#241512' },
  { key: 'slate-blue', label: 'Slate Blue', primary: '#7c93b3', secondary: '#141b24' },
  { key: 'amber-noir', label: 'Amber Noir', primary: '#f5a524', secondary: '#0c0a08' },
  { key: 'mint-fresh', label: 'Mint Fresh', primary: '#2dd4a7', secondary: '#0a1f18' },
  { key: 'deep-plum', label: 'Deep Plum', primary: '#9b5de5', secondary: '#170a1f' },
  { key: 'coral-reef', label: 'Coral Reef', primary: '#ff7f6b', secondary: '#0b1f24' },
  { key: 'cyber-teal', label: 'Cyber Teal', primary: '#2de1e6', secondary: '#080c0c' },
  { key: 'golden-hour', label: 'Golden Hour', primary: '#f2c14e', secondary: '#231708' },
  { key: 'electric-indigo', label: 'Electric Indigo', primary: '#6339f5', secondary: '#0b081c' },
  { key: 'monochrome', label: 'Monochrome', primary: '#eaeaea', secondary: '#000000' },
  { key: 'cherry-blossom', label: 'Cherry Blossom', primary: '#f7a8c4', secondary: '#210a14' },
  { key: 'arctic-frost', label: 'Arctic Frost', primary: '#bfe6f5', secondary: '#0a1826' },
  { key: 'volcanic-red', label: 'Volcanic Red', primary: '#ff3b30', secondary: '#0d0705' },
  { key: 'neon-cyber', label: 'Neon Cyber', primary: '#39ff14', secondary: '#0a0a0a' },
]

/** Site-wide theme editor: pick a preset or custom colors, preview live via applyTheme, then persist with Save. Affects every visitor, not just the admin. */
export default function Personalization() {
  const { push } = useToast()
  const { applyTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preset, setPreset] = useState('lime-ink')
  const [primary, setPrimary] = useState('#d9ff4b')
  const [secondary, setSecondary] = useState('#0a0a0a')

  useEffect(() => {
    getSiteThemeAdmin()
      .then((data) => {
        if (!data) return
        setPreset(data.preset || 'custom')
        setPrimary(data.primary_color || '#d9ff4b')
        setSecondary(data.secondary_color || '#0a0a0a')
      })
      .catch(() => push('Failed to load current theme.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectPreset = (p) => {
    setPreset(p.key)
    setPrimary(p.primary)
    setSecondary(p.secondary)
    applyTheme({ primary_color: p.primary, secondary_color: p.secondary })
  }

  const handlePrimaryChange = (value) => {
    setPrimary(value)
    setPreset('custom')
    applyTheme({ primary_color: value })
  }

  const handleSecondaryChange = (value) => {
    setSecondary(value)
    setPreset('custom')
    applyTheme({ secondary_color: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateSiteTheme({
        preset,
        primary_color: primary,
        secondary_color: secondary,
      })
      applyTheme(updated)
      push('Theme saved — now live for all visitors.', 'success')
    } catch {
      push('Failed to save theme.', 'error')
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
        <SectionEyebrow>Personalization</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Site Theme</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          One shared color palette applied site-wide for every visitor. Changes preview live before you save.
        </p>
      </div>

      <Card title="presets.json">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {PRESETS.map((p) => {
            const active = preset === p.key
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors ${
                  active ? 'border-ink bg-ink/5' : 'border-ink/10 hover:border-ink/30'
                }`}
              >
                <span className="relative h-10 w-10 overflow-hidden rounded-full border border-ink/10 shadow-sm">
                  <span className="absolute inset-0" style={{ background: p.secondary }} />
                  <span
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{ background: p.primary }}
                  />
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check size={16} className="text-white drop-shadow" />
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-ink/70">{p.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card title="custom-colors.json">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">Primary color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primary}
                onChange={(e) => handlePrimaryChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-ink/15 bg-surface p-1"
              />
              <input
                type="text"
                value={primary}
                onChange={(e) => handlePrimaryChange(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs text-ink/50">Secondary color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondary}
                onChange={(e) => handleSecondaryChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-ink/15 bg-surface p-1"
              />
              <input
                type="text"
                value={secondary}
                onChange={(e) => handleSecondaryChange(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>
        </div>

        <p className="mt-3 font-mono text-[11px] text-ink/40">
          preset: <span className="text-ink/70">{preset}</span>
        </p>
      </Card>

      <Card title="live-preview.jsx">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-cream p-5">
          <button type="button" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink">
            Primary Button
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent px-4 py-1.5 font-mono text-xs font-medium text-accent">
            &lt;Badge /&gt;
          </span>
          <p className="font-display text-lg font-bold text-ink">Heading text in ink</p>
          <p className="font-mono text-xs text-ink/60">Muted body copy sample.</p>
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
          Save Theme
        </button>
      </div>

      <div className="border-t border-ink/10 pt-6">
        <WidgetsSection />
      </div>
    </div>
  )
}
