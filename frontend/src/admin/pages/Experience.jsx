import { useEffect, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideStar as Star,
  LucideBriefcase as Briefcase,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import {
  getExperienceAdmin,
  createExperience,
  updateExperience,
  deleteExperience,
  createExperienceHighlight,
  updateExperienceHighlight,
  deleteExperienceHighlight,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = {
  company: '',
  role: '',
  location: '',
  description: '',
  start_date: '',
  end_date: '',
  is_current: false,
  order: 0,
}

const EMPTY_HIGHLIGHT_FORM = { text: '', order: 0 }

/** Inline-editable row for a single experience highlight, plus its own delete button. */
function HighlightRow({ highlight, onSave, onDelete, busy }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    text: highlight.text,
    order: highlight.order,
  })

  const startEdit = () => {
    setForm({ text: highlight.text, order: highlight.order })
    setEditing(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'order' ? Number(value) : value }))
  }

  const handleSave = async () => {
    if (!form.text.trim()) return
    await onSave(highlight.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="text"
          name="text"
          value={form.text}
          onChange={handleChange}
          className="w-full flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none sm:w-20"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-mono text-xs font-semibold text-cream disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/60 hover:border-ink/40 hover:text-ink"
          >
            <X size={13} /> Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-ink">{highlight.text}</span>
        <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
          order: {highlight.order}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={startEdit}
          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 disabled:opacity-50"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(highlight)}
          className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </li>
  )
}

/** Small add-highlight form pinned to the bottom of an experience entry's highlight list. */
function AddHighlightForm({ experienceId, onAdd }) {
  const [form, setForm] = useState(EMPTY_HIGHLIGHT_FORM)
  const [adding, setAdding] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'order' ? Number(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    setAdding(true)
    try {
      await onAdd({ experience: experienceId, ...form })
      setForm(EMPTY_HIGHLIGHT_FORM)
    } finally {
      setAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <input
        type="text"
        name="text"
        value={form.text}
        onChange={handleChange}
        placeholder="New highlight text"
        className="w-full flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
      />
      <input
        type="number"
        name="order"
        value={form.order}
        onChange={handleChange}
        className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none sm:w-20"
      />
      <button
        type="submit"
        disabled={adding}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 disabled:opacity-50"
      >
        {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Add highlight
      </button>
    </form>
  )
}

/**
 * Admin CRUD for work experience entries and their nested highlights. Experience entries support
 * inline text-field editing (Pricing.jsx's pattern); highlights live on a separate top-level
 * endpoint but are managed here nested under each entry, refetching the whole experience list
 * after any change to keep state simple (same approach Pricing.jsx uses for features).
 */
export default function Experience() {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)

  const load = () => {
    setLoading(true)
    getExperienceAdmin()
      .then(setItems)
      .catch(() => push('Failed to load experience entries.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => {
      const next = {
        ...f,
        [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
      }
      if (name === 'is_current' && checked) {
        next.end_date = ''
      }
      return next
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) {
      push('Company and role are required.', 'error')
      return
    }
    setCreating(true)
    try {
      await createExperience({ ...form, end_date: form.is_current ? '' : form.end_date })
      setForm(EMPTY_FORM)
      push('Experience added.', 'success')
      load()
    } catch {
      push('Failed to add experience.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.role} at ${item.company}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const prev = items
    setItems((p) => p.filter((x) => x.id !== item.id))
    try {
      await deleteExperience(item.id)
      push('Experience deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete experience.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      company: item.company,
      role: item.role,
      location: item.location || '',
      description: item.description || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      is_current: item.is_current,
      order: item.order,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm((f) => {
      const next = {
        ...f,
        [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
      }
      if (name === 'is_current' && checked) {
        next.end_date = ''
      }
      return next
    })
  }

  const handleEditSave = async (item) => {
    if (!editForm.company.trim() || !editForm.role.trim()) {
      push('Company and role are required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateExperience(item.id, {
        ...editForm,
        end_date: editForm.is_current ? '' : editForm.end_date,
      })
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
      push('Experience updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update experience.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleHighlightSave = async (highlightId, payload) => {
    try {
      await updateExperienceHighlight(highlightId, payload)
      push('Highlight updated.', 'success')
      load()
    } catch {
      push('Failed to update highlight.', 'error')
    }
  }

  const handleHighlightDelete = async (highlight) => {
    if (!window.confirm(`Delete highlight "${highlight.text}"? This cannot be undone.`)) return
    try {
      await deleteExperienceHighlight(highlight.id)
      push('Highlight deleted.', 'success')
      load()
    } catch {
      push('Failed to delete highlight.', 'error')
    }
  }

  const handleHighlightAdd = async (payload) => {
    try {
      await createExperienceHighlight(payload)
      push('Highlight added.', 'success')
      load()
    } catch {
      push('Failed to add highlight.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Experience</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Work Experience</h1>
      </div>

      <Card title="experience.add">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Company</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Role</label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
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
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Start date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">End date</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleFormChange}
              disabled={form.is_current}
              placeholder="Leave blank if present"
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
              <input
                type="checkbox"
                name="is_current"
                checked={form.is_current}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-ink/30"
              />
              Current role
            </label>
          </div>
          <div className="sm:col-span-4">
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
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
              {creating ? 'Adding...' : 'Add Experience'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="experience.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Briefcase className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No experience entries yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 px-5 py-4 first:pt-4 last:pb-4">
                {editingId === item.id ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={editForm.company}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Order</label>
                      <input
                        type="number"
                        name="order"
                        value={editForm.order}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Start date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={editForm.start_date}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">End date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={editForm.end_date}
                        onChange={handleEditChange}
                        disabled={editForm.is_current}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-end pb-2.5">
                      <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
                        <input
                          type="checkbox"
                          name="is_current"
                          checked={editForm.is_current}
                          onChange={handleEditChange}
                          className="h-4 w-4 rounded border-ink/30"
                        />
                        Current role
                      </label>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Description</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-1 sm:col-span-2">
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => handleEditSave(item)}
                        className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-mono text-xs font-semibold text-cream disabled:opacity-60"
                      >
                        {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 font-mono text-xs text-ink/60 hover:border-ink/40 hover:text-ink"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{item.role}</span>
                        <span className="font-mono text-[11px] text-ink/40">
                          {item.company}
                          {item.location ? ` · ${item.location}` : ''}
                        </span>
                        {item.is_current && (
                          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                            <Star size={10} /> current
                          </span>
                        )}
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                          order: {item.order}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-ink/40">
                        {item.start_date || '—'} to {item.is_current ? 'present' : item.end_date || '—'}
                      </div>
                      {item.description && (
                        <p className="mt-1 truncate font-mono text-[11px] text-ink/40">{item.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => startEdit(item)}
                        className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 disabled:opacity-50"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleDelete(item)}
                        className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-ink/10">
                  <div className="border-b border-ink/10 bg-ink/[0.03] px-4 py-2">
                    <span className="font-mono text-[11px] text-ink/40">highlights</span>
                  </div>
                  {item.highlights && item.highlights.length > 0 ? (
                    <ul className="divide-y divide-ink/10">
                      {item.highlights.map((highlight) => (
                        <HighlightRow
                          key={highlight.id}
                          highlight={highlight}
                          onSave={handleHighlightSave}
                          onDelete={handleHighlightDelete}
                          busy={false}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 font-mono text-xs text-ink/40">No highlights yet.</p>
                  )}
                  <div className="border-t border-ink/10">
                    <AddHighlightForm experienceId={item.id} onAdd={handleHighlightAdd} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
