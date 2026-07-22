import { useEffect, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideWrench as Wrench,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getServicesAdmin, createService, updateService, deleteService } from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { title: '', description: '', icon_name: '', order: 0, is_active: true }

/** Small toggle-switch control, same pattern as Widgets.jsx/SocialLinks.jsx's local Switch. */
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

/**
 * Admin CRUD for service entries (the public site's "what I do" cards). Supports inline
 * text-field editing (Pricing.jsx's pattern) plus an is_active Switch, since the public API
 * hides inactive entries entirely and staff need to tell them apart here.
 */
export default function Services() {
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
    getServicesAdmin()
      .then(setItems)
      .catch(() => push('Failed to load service entries.', 'error'))
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
    if (!form.title.trim() || !form.description.trim()) {
      push('Title and description are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createService(form)
      setItems((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      push('Service added.', 'success')
    } catch {
      push('Failed to add service.', 'error')
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
      await deleteService(item.id)
      push('Service deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete service.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (item, nextValue) => {
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_active: nextValue } : x)))
    setBusyId(item.id)
    try {
      await updateService(item.id, { is_active: nextValue })
      push(`"${item.title}" is now ${nextValue ? 'active' : 'inactive'}.`, 'success')
    } catch {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_active: !nextValue } : x)))
      push(`Failed to update "${item.title}".`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      description: item.description,
      icon_name: item.icon_name || '',
      order: item.order,
      is_active: item.is_active,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((f) => ({ ...f, [name]: name === 'order' ? Number(value) : value }))
  }

  const handleEditSave = async (item) => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      push('Title and description are required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateService(item.id, editForm)
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
      push('Service updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update service.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Services</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Services</h1>
        <p className="mt-1 font-mono text-xs text-ink/40">
          Manage the "what I do" cards shown on the public site. Inactive entries stay hidden from visitors.
        </p>
      </div>

      <Card title="services.add">
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
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Icon name</label>
            <input
              type="text"
              name="icon_name"
              value={form.icon_name}
              onChange={handleFormChange}
              placeholder="e.g. Code2"
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
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
              <Switch
                checked={form.is_active}
                onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              Active
            </label>
          </div>
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creating ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="services.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Wrench className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No service entries yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex flex-col gap-3 px-5 py-4 first:pt-4 last:pb-4 sm:flex-row sm:items-center sm:justify-between ${
                  item.is_active ? '' : 'opacity-60'
                }`}
              >
                {editingId === item.id ? (
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Icon name</label>
                      <input
                        type="text"
                        name="icon_name"
                        value={editForm.icon_name}
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
                    <div className="flex items-end pb-2.5">
                      <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
                        <Switch
                          checked={editForm.is_active}
                          onChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                        />
                        Active
                      </label>
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
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{item.title}</span>
                        {item.icon_name && (
                          <span className="font-mono text-[11px] text-ink/40">{item.icon_name}</span>
                        )}
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                          order: {item.order}
                        </span>
                        {!item.is_active && (
                          <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink/50">
                            inactive
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 truncate font-mono text-[11px] text-ink/40">{item.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <Switch
                        checked={item.is_active}
                        disabled={busyId === item.id}
                        onChange={(next) => handleToggleActive(item, next)}
                      />
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
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
