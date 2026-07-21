import { useEffect, useRef, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucideUpload as Upload,
  LucideFileText as FileText,
  LucideAward as Award,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import CertificatePreviewModal from '../../components/ui/CertificatePreviewModal'
import {
  getTrainingAdmin,
  createTraining,
  updateTraining,
  deleteTraining,
  uploadTrainingCertificate,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { title: '', provider: '', order: 0 }

export default function Training() {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [activeCertificate, setActiveCertificate] = useState(null)
  const fileInputRefs = useRef({})

  const load = () => {
    setLoading(true)
    getTrainingAdmin()
      .then(setItems)
      .catch(() => push('Failed to load training entries.', 'error'))
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
    if (!form.title.trim() || !form.provider.trim()) {
      push('Title and provider are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createTraining(form)
      setItems((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      push('Training entry added.', 'success')
    } catch {
      push('Failed to add training entry.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const prev = items
    setItems((p) => p.filter((x) => x.id !== item.id))
    try {
      await deleteTraining(item.id)
      push('Training entry deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete training entry.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleCertificateSelect = async (item, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusyId(item.id)
    try {
      const updated = await uploadTrainingCertificate(item.id, file)
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
      push('Certificate uploaded.', 'success')
    } catch {
      push('Failed to upload certificate.', 'error')
    } finally {
      setBusyId(null)
      if (fileInputRefs.current[item.id]) fileInputRefs.current[item.id].value = ''
    }
  }

  const handleCertificateRemove = async (item) => {
    setBusyId(item.id)
    try {
      const updated = await updateTraining(item.id, { certificate_file: null })
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
      push('Certificate removed.', 'success')
    } catch {
      push('Failed to remove certificate.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Training</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Training &amp; Certifications</h1>
      </div>

      <Card title="training.add">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Provider</label>
            <input
              type="text"
              name="provider"
              value={form.provider}
              onChange={handleFormChange}
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
              {creating ? 'Adding...' : 'Add Training'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="training.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Award className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No training entries yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-5 py-4 first:pt-4 last:pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="font-mono text-[11px] text-ink/40">{item.provider}</span>
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                      order: {item.order}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                        item.certificate_file ? 'bg-accent/20 text-ink' : 'bg-ink/10 text-ink/50'
                      }`}
                    >
                      {item.certificate_file ? 'has certificate' : 'no certificate'}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {item.certificate_file && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveCertificate(item)}
                        className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
                      >
                        <FileText size={13} /> View
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleCertificateRemove(item)}
                        className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/60 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Remove certificate
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 disabled:opacity-50"
                  >
                    {busyId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    {item.certificate_file ? 'Replace' : 'Upload'}
                  </button>
                  <input
                    ref={(el) => (fileInputRefs.current[item.id] = el)}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={(e) => handleCertificateSelect(item, e)}
                    className="hidden"
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

      <CertificatePreviewModal
        open={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        title={activeCertificate ? `${activeCertificate.title}.certificate` : ''}
        fileUrl={activeCertificate?.certificate_file}
      />
    </div>
  )
}
