import { useEffect, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideLayers as Layers,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import {
  getSkillCategoriesAdmin,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = { name: '', order: 0 }

const EMPTY_SKILL_FORM = { name: '', proficiency: 50, order: 0 }

/** Inline-editable row for a single skill, plus its own delete button. */
function SkillRow({ skill, onSave, onDelete, busy }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: skill.name,
    proficiency: skill.proficiency,
    order: skill.order,
  })

  const startEdit = () => {
    setForm({ name: skill.name, proficiency: skill.proficiency, order: skill.order })
    setEditing(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'order' || name === 'proficiency' ? Number(value) : value }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    await onSave(skill.id, form)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
        <input
          type="number"
          name="proficiency"
          min={0}
          max={100}
          value={form.proficiency}
          onChange={handleChange}
          className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none sm:w-24"
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
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate text-sm text-ink">{skill.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink/40">{skill.proficiency}%</span>
        </div>
        <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
          order: {skill.order}
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
          onClick={() => onDelete(skill)}
          className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </li>
  )
}

/** Small add-skill form pinned to the bottom of a category's skill list. */
function AddSkillForm({ categoryId, onAdd }) {
  const [form, setForm] = useState(EMPTY_SKILL_FORM)
  const [adding, setAdding] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'order' || name === 'proficiency' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setAdding(true)
    try {
      await onAdd({ category: categoryId, ...form })
      setForm(EMPTY_SKILL_FORM)
    } finally {
      setAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="New skill name"
        className="w-full flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
      />
      <input
        type="number"
        name="proficiency"
        min={0}
        max={100}
        value={form.proficiency}
        onChange={handleChange}
        className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none sm:w-24"
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
        Add skill
      </button>
    </form>
  )
}

/**
 * Admin CRUD for skill categories and their nested skills. Categories support inline text-field
 * editing (Pricing.jsx's pattern); skills live on a separate top-level endpoint but are managed
 * here nested under each category, refetching the whole category list after any change to keep
 * state simple (same approach Pricing.jsx uses for features).
 */
export default function Skills() {
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
    getSkillCategoriesAdmin()
      .then(setItems)
      .catch(() => push('Failed to load skill categories.', 'error'))
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
    if (!form.name.trim()) {
      push('Name is required.', 'error')
      return
    }
    setCreating(true)
    try {
      await createSkillCategory(form)
      setForm(EMPTY_FORM)
      push('Skill category added.', 'success')
      load()
    } catch {
      push('Failed to add skill category.', 'error')
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
      await deleteSkillCategory(item.id)
      push('Skill category deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete skill category.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({ name: item.name, order: item.order })
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
    if (!editForm.name.trim()) {
      push('Name is required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateSkillCategory(item.id, editForm)
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
      push('Skill category updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update skill category.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleSkillSave = async (skillId, payload) => {
    try {
      await updateSkill(skillId, payload)
      push('Skill updated.', 'success')
      load()
    } catch {
      push('Failed to update skill.', 'error')
    }
  }

  const handleSkillDelete = async (skill) => {
    if (!window.confirm(`Delete skill "${skill.name}"? This cannot be undone.`)) return
    try {
      await deleteSkill(skill.id)
      push('Skill deleted.', 'success')
      load()
    } catch {
      push('Failed to delete skill.', 'error')
    }
  }

  const handleSkillAdd = async (payload) => {
    try {
      await createSkill(payload)
      push('Skill added.', 'success')
      load()
    } catch {
      push('Failed to add skill.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Skills</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Skill Categories</h1>
      </div>

      <Card title="skills.add">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-3">
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
              {creating ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="skills.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Layers className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No skill categories yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 px-5 py-4 first:pt-4 last:pb-4">
                {editingId === item.id ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-3">
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

                <div className="overflow-hidden rounded-xl border border-ink/10">
                  <div className="border-b border-ink/10 bg-ink/[0.03] px-4 py-2">
                    <span className="font-mono text-[11px] text-ink/40">skills</span>
                  </div>
                  {item.skills && item.skills.length > 0 ? (
                    <ul className="divide-y divide-ink/10">
                      {item.skills.map((skill) => (
                        <SkillRow
                          key={skill.id}
                          skill={skill}
                          onSave={handleSkillSave}
                          onDelete={handleSkillDelete}
                          busy={false}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 font-mono text-xs text-ink/40">No skills yet.</p>
                  )}
                  <div className="border-t border-ink/10">
                    <AddSkillForm categoryId={item.id} onAdd={handleSkillAdd} />
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
