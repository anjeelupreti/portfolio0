import { useEffect, useState } from 'react'
import { LucideLoader2 as Loader2, LucidePlus as Plus, LucideTrash2 as Trash2, LucideShare2 as Share2 } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import SocialIcon from '../../components/ui/SocialIcon'
import {
  getSocialLinksAdmin,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
]

const EMPTY_FORM = { platform: 'github', url: '', is_visible: true, order: 0 }

/** Toggle control styled as an iOS-like switch, used for each social link's visibility row. */
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

/** Admin CRUD for social/contact links (GitHub, LinkedIn, Twitter/X, etc), including per-entry visibility toggle. */
export default function SocialLinks() {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    getSocialLinksAdmin()
      .then(setItems)
      .catch(() => push('Failed to load social links.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'order' ? Number(value) : value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.url.trim()) {
      push('URL is required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createSocialLink(form)
      setItems((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      push('Social link added.', 'success')
    } catch {
      push('Failed to add social link.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (item, nextValue) => {
    setItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, is_visible: nextValue } : x))
    )
    setBusyId(item.id)
    try {
      await updateSocialLink(item.id, { is_visible: nextValue })
      push(`${item.platform_label} is now ${nextValue ? 'visible' : 'hidden'}.`, 'success')
    } catch {
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, is_visible: !nextValue } : x))
      )
      push(`Failed to update ${item.platform_label}.`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.platform_label}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const prev = items
    setItems((p) => p.filter((x) => x.id !== item.id))
    try {
      await deleteSocialLink(item.id)
      push('Social link deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete social link.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Social Links</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Social &amp; Contact Links</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Manage the icons shown in the Hero section and footer of the public site.
        </p>
      </div>

      <Card title="social-links.add">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Platform</label>
            <select
              name="platform"
              value={form.platform}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-mono text-xs text-ink/50">URL</label>
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleFormChange}
              placeholder="https://..."
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Order</label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creating ? 'Adding...' : 'Add Social Link'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="social-links.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Share2 className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No social links yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-5 py-4 first:pt-4 last:pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink">
                    <SocialIcon platform={item.platform} size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{item.platform_label}</span>
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                        order: {item.order}
                      </span>
                    </div>
                    <p className="truncate font-mono text-[11px] text-ink/40">{item.url}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Switch
                    checked={item.is_visible}
                    disabled={busyId === item.id}
                    onChange={(next) => handleToggle(item, next)}
                  />
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
