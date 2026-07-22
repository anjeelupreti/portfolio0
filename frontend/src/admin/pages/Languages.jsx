import { useEffect, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideLanguages as Languages2,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import {
  getLanguagesAdmin,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { name: '', proficiency_label: '', proficiency_level: 1, order: 0 }

/** Small 1-5 filled/unfilled dot row echoing the public site's language proficiency display. */
function ProficiencyDots({ level }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-2 w-2 rounded-full ${n <= level ? 'bg-ink' : 'bg-ink/15'}`}
        />
      ))}
    </span>
  )
}

/**
 * Admin CRUD for language entries. Simple flat list with inline-editable fields, following
 * Pricing.jsx's plan editing pattern (Pencil/Save/Cancel), same toast/load conventions as
 * Training.jsx.
 */
export default function Languages() {
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
    getLanguagesAdmin()
      .then(setItems)
      .catch(() => push('Failed to load language entries.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'order' || name === 'proficiency_level' ? Number(value) : value,
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.proficiency_label.trim()) {
      push('Name and proficiency label are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createLanguage(form)
      setItems((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      push('Language added.', 'success')
    } catch {
      push('Failed to add language.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const prev = items
    setItems((p) => p.filter((x) => x.id !== item.id))
    try {
      await deleteLanguage(item.id)
      push('Language deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete language.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      proficiency_label: item.proficiency_label,
      proficiency_level: item.proficiency_level,
      order: item.order,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((f) => ({
      ...f,
      [name]: name === 'order' || name === 'proficiency_level' ? Number(value) : value,
    }))
  }

  const handleEditSave = async (item) => {
    if (!editForm.name.trim() || !editForm.proficiency_label.trim()) {
      push('Name and proficiency label are required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateLanguage(item.id, editForm)
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
      push('Language updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update language.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Languages</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Languages</h1>
      </div>

      <Card title="languages.add">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Proficiency label</label>
            <input
              type="text"
              name="proficiency_label"
              value={form.proficiency_label}
              onChange={handleFormChange}
              placeholder="Native, Proficient..."
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Proficiency level (1-5)</label>
            <input
              type="number"
              name="proficiency_level"
              min={1}
              max={5}
              value={form.proficiency_level}
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
              {creating ? 'Adding...' : 'Add Language'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="languages.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Languages2 className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No language entries yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-5 py-4 first:pt-4 last:pb-4">
                {editingId === item.id ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Proficiency label</label>
                      <input
                        type="text"
                        name="proficiency_label"
                        value={editForm.proficiency_label}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Proficiency level (1-5)</label>
                      <input
                        type="number"
                        name="proficiency_level"
                        min={1}
                        max={5}
                        value={editForm.proficiency_level}
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
                        <span className="font-medium text-ink">{item.name}</span>
                        <span className="font-mono text-[11px] text-ink/40">{item.proficiency_label}</span>
                        <ProficiencyDots level={item.proficiency_level} />
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                          order: {item.order}
                        </span>
                      </div>
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
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
