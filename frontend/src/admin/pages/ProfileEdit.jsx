import { useEffect, useRef, useState } from 'react'
import { LucideLoader2 as Loader2, LucideSave as Save, LucideUpload as Upload, LucideFileText as FileText, LucideTrash2 as Trash2 } from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getProfile, updateProfile, uploadResume } from '../api/adminResources'
import { useToast } from '../components/Toast'

const FIELDS = [
  { name: 'full_name', label: 'Full name' },
  { name: 'title', label: 'Title' },
  { name: 'tagline', label: 'Tagline' },
  { name: 'summary', label: 'Summary', textarea: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'location', label: 'Location' },
  { name: 'github_url', label: 'GitHub URL' },
  { name: 'linkedin_url', label: 'LinkedIn URL' },
  { name: 'facebook_url', label: 'Facebook URL' },
  { name: 'instagram_url', label: 'Instagram URL' },
  { name: 'portfolio_url', label: 'Portfolio URL' },
]

/**
 * Admin form for editing the single Profile record (contact info, bio, socials) plus resume
 * upload/removal via `uploadResume`/`updateProfile` from adminResources. Assumes exactly one
 * profile exists and takes the first item if the API returns a list.
 */
export default function ProfileEdit() {
  const { push } = useToast()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

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
      const updated = await updateProfile(profile.id, form)
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
    </div>
  )
}
