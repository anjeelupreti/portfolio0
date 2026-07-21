import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2, LucideCheck as Check } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getSiteThemeAdmin, updateSiteTheme } from '../api/adminResources'
import { useToast } from '../components/Toast'
import { useTheme } from '../../lib/theme'

// Hardcoded representative primary/secondary hex pairs per preset — used for
// the swatch gallery and to populate the custom color pickers on selection.
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
    </div>
  )
}
