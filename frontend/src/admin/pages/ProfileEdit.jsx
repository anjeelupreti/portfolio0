import { useEffect, useRef, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucideSave as Save,
  LucideUpload as Upload,
  LucideFileText as FileText,
  LucideTrash2 as Trash2,
  LucideUser as User,
  LucidePlus as Plus,
  LucideShare2 as Share2,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import SocialIcon from '../../components/ui/SocialIcon'
import {
  getProfile,
  updateProfile,
  uploadResume,
  uploadProfileImage,
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

const EMPTY_SOCIAL_FORM = { platform: 'github', url: '', is_visible: true, order: 0 }

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

/** Social/contact link management, embedded as a section within the Profile page. */
function SocialLinksSection() {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState(EMPTY_SOCIAL_FORM)
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
      setForm(EMPTY_SOCIAL_FORM)
      push('Social link added.', 'success')
    } catch {
      push('Failed to add social link.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (item, nextValue) => {
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_visible: nextValue } : x)))
    setBusyId(item.id)
    try {
      await updateSocialLink(item.id, { is_visible: nextValue })
      push(`${item.platform_label} is now ${nextValue ? 'visible' : 'hidden'}.`, 'success')
    } catch {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_visible: !nextValue } : x)))
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
    <Card title="social-links.json">
      <label className="mb-1.5 block font-mono text-xs text-ink/50">Social &amp; Contact Links</label>
      <p className="mb-4 text-xs text-ink/40">
        Shown as icons in the Hero section and footer of the public site.
      </p>

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
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? 'Adding...' : 'Add Social Link'}
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-ink/10 pt-5">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-ink/30" size={22} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Share2 className="text-ink/20" size={24} />
            <p className="font-mono text-xs text-ink/40">No social links yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
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
      </div>
    </Card>
  )
}

const FIELDS = [
  { name: 'full_name', label: 'Full name' },
  { name: 'title', label: 'Title' },
  { name: 'tagline', label: 'Tagline' },
  { name: 'summary', label: 'Summary', textarea: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'location', label: 'Location' },
  { name: 'portfolio_url', label: 'Portfolio URL' },
]

/**
 * Admin form for editing the single Profile record (contact info, bio) plus resume
 * upload/removal via `uploadResume`/`updateProfile` from adminResources. Assumes exactly one
 * profile exists and takes the first item if the API returns a list. Also embeds Social Links
 * management (its own model, not Profile fields) as a section at the bottom of this page.
 */
export default function ProfileEdit() {
  const { push } = useToast()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)

  useEffect(() => {
    getProfile()
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : data
        setProfile(item || null)
        setForm(item || {})
      })
      .catch(() => push('Failed to load profile.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    try {
      // resume_file/profile_image are file fields — form holds their current
      // URL as a plain string (from the initial load or a prior upload), and
      // DRF's FileField rejects a string in place of an actual uploaded file.
      // Uploads go through their own dedicated endpoints, so strip them here.
      const { resume_file, profile_image, ...payload } = form
      const updated = await updateProfile(profile.id, payload)
      setProfile(updated)
      push('Profile updated.', 'success')
    } catch {
      push('Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploading(true)
    try {
      const updated = await uploadResume(profile.id, file)
      setProfile(updated)
      setForm((f) => ({ ...f, resume_file: updated.resume_file }))
      push('Resume uploaded.', 'success')
    } catch {
      push('Failed to upload resume.', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResumeRemove = async () => {
    if (!profile?.id) return
    setUploading(true)
    try {
      const updated = await updateProfile(profile.id, { resume_file: null })
      setProfile(updated)
      setForm((f) => ({ ...f, resume_file: null }))
      push('Resume removed.', 'success')
    } catch {
      push('Failed to remove resume.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploadingPhoto(true)
    try {
      const updated = await uploadProfileImage(profile.id, file)
      setProfile(updated)
      setForm((f) => ({ ...f, profile_image: updated.profile_image }))
      push('Photo uploaded.', 'success')
    } catch {
      push('Failed to upload photo.', 'error')
    } finally {
      setUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handlePhotoRemove = async () => {
    if (!profile?.id) return
    setUploadingPhoto(true)
    try {
      const updated = await updateProfile(profile.id, { profile_image: null })
      setProfile(updated)
      setForm((f) => ({ ...f, profile_image: null }))
      push('Photo removed.', 'success')
    } catch {
      push('Failed to remove photo.', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-ink/30" size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Profile</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Edit Profile</h1>
      </div>

      <Card title="profile.photo">
        <label className="mb-1.5 block font-mono text-xs text-ink/50">Profile Photo</label>
        <p className="mb-3 text-xs text-ink/40">
          Shown in the Hero section and navbar on the public site once uploaded.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/15 bg-surface">
            {form.profile_image ? (
              <img src={form.profile_image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User size={28} className="text-ink/20" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 font-mono text-xs text-ink/70 disabled:opacity-50"
            >
              {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploadingPhoto ? 'Uploading...' : form.profile_image ? 'Replace photo' : 'Upload photo'}
            </button>
            {form.profile_image && (
              <button
                type="button"
                onClick={handlePhotoRemove}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-2 font-mono text-xs text-ink/60 disabled:opacity-50"
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </Card>

      <Card title="profile.resume">
        <label className="mb-1.5 block font-mono text-xs text-ink/50">Resume / CV</label>
        <p className="mb-3 text-xs text-ink/40">
          Upload your own CV file. Nothing is generated automatically — the public site's download
          button only appears once a file is uploaded here.
        </p>
        {form.resume_file ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5">
            <FileText size={16} className="shrink-0 text-ink/50" />
            <a
              href={form.resume_file}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-ink underline underline-offset-2"
            >
              {form.resume_file.split('/').pop()}
            </a>
            <button
              type="button"
              onClick={handleResumeRemove}
              disabled={uploading}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/60 disabled:opacity-50"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 font-mono text-xs text-ink/70 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading...' : 'Upload resume'}
            </button>
            <span className="font-mono text-[11px] text-ink/30">PDF recommended</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeSelect}
          className="hidden"
        />
      </Card>

      <Card title="profile.form">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.textarea ? 'sm:col-span-2' : ''}>
              <label className="mb-1.5 block font-mono text-xs text-ink/50">{f.label}</label>
              {f.textarea ? (
                <textarea
                  name={f.name}
                  rows={4}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  className="w-full resize-none rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="open_to_work"
              name="open_to_work"
              checked={!!form.open_to_work}
              onChange={handleChange}
              className="h-4 w-4 accent-ink"
            />
            <label htmlFor="open_to_work" className="font-mono text-xs text-ink/60">
              open to work
            </label>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </Card>

      <SocialLinksSection />
    </div>
  )
}
