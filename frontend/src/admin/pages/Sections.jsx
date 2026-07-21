import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2 } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getSiteSections, patchSiteSection } from '../api/adminResources'
import { useToast } from '../components/Toast'

/** Toggle control styled as an iOS-like switch, used for each section's visibility row. */
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

/** Admin page for toggling which homepage sections are visible to public visitors. Applies optimistic updates on toggle and reverts if the API call fails. */
export default function Sections() {
  const { push } = useToast()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingIds, setPendingIds] = useState({})

  useEffect(() => {
    getSiteSections()
      .then(setSections)
      .catch(() => push('Failed to load sections.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = async (section, nextValue) => {
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, is_visible: nextValue } : s))
    )
    setPendingIds((p) => ({ ...p, [section.id]: true }))
    try {
      await patchSiteSection(section.id, { is_visible: nextValue })
      push(`${section.label} is now ${nextValue ? 'visible' : 'hidden'}.`, 'success')
    } catch {
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, is_visible: !nextValue } : s))
      )
      push(`Failed to update ${section.label}.`, 'error')
    } finally {
      setPendingIds((p) => {
        const next = { ...p }
        delete next[section.id]
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Sections</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Homepage Sections</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Toggle which sections are visible on the public homepage.
        </p>
      </div>

      <Card title="site-sections.json">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : sections.length === 0 ? (
          <p className="font-mono text-xs text-ink/40">No sections configured.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {sections.map((section) => (
              <li key={section.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-ink">{section.label}</p>
                  <p className="font-mono text-[11px] text-ink/40">key: {section.key} &middot; order: {section.order}</p>
                </div>
                <Switch
                  checked={section.is_visible}
                  disabled={!!pendingIds[section.id]}
                  onChange={(next) => handleToggle(section, next)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
