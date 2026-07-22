import { useEffect, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideStar as Star,
  LucideCheck as Check,
  LucideTag as Tag,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import {
  getPricingPlansAdmin,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  createPricingFeature,
  updatePricingFeature,
  deletePricingFeature,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = {
  name: '',
  price: '',
  billing_period: '',
  description: '',
  is_featured: false,
  order: 0,
}

const EMPTY_FEATURE_FORM = { text: '', included: true, order: 0 }

/** Small toggle-switch control, same pattern as Widgets.jsx/Sections.jsx's local Switch. */
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

/** Inline-editable row for a single pricing feature, plus its own delete button. */
function FeatureRow({ feature, onSave, onDelete, busy }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    text: feature.text,
    included: feature.included,
    order: feature.order,
  })

  const startEdit = () => {
    setForm({ text: feature.text, included: feature.included, order: feature.order })
    setEditing(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'order' ? Number(value) : value }))
  }

  const handleSave = async () => {
    if (!form.text.trim()) return
    await onSave(feature.id, form)
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
        <Switch checked={form.included} onChange={(v) => setForm((f) => ({ ...f, included: v }))} />
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
        {feature.included ? (
          <Check size={14} className="shrink-0 text-accent" />
        ) : (
          <X size={14} className="shrink-0 text-ink/30" />
        )}
        <span className={`truncate text-sm ${feature.included ? 'text-ink' : 'text-ink/40 line-through'}`}>
          {feature.text}
        </span>
        <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
          order: {feature.order}
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
          onClick={() => onDelete(feature)}
          className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </li>
  )
}

/** Small add-feature form pinned to the bottom of a plan's feature list. */
function AddFeatureForm({ planId, onAdd }) {
  const [form, setForm] = useState(EMPTY_FEATURE_FORM)
  const [adding, setAdding] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    setAdding(true)
    try {
      await onAdd({ plan: planId, ...form })
      setForm(EMPTY_FEATURE_FORM)
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
        placeholder="New feature text"
        className="w-full flex-1 rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
      />
      <input
        type="number"
        name="order"
        value={form.order}
        onChange={handleChange}
        className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none sm:w-20"
      />
      <label className="flex shrink-0 items-center gap-2 font-mono text-xs text-ink/60">
        <input
          type="checkbox"
          name="included"
          checked={form.included}
          onChange={handleChange}
          className="h-4 w-4 rounded border-ink/30"
        />
        Included
      </label>
      <button
        type="submit"
        disabled={adding}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 disabled:opacity-50"
      >
        {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Add feature
      </button>
    </form>
  )
}

/**
 * Admin CRUD for pricing plans and their nested features. Plans support inline text-field
 * editing (Projects.jsx's pattern); features live on a separate top-level endpoint but are
 * managed here nested under each plan, refetching the whole plan list after any change to
 * keep state simple (same approach Training.jsx/Projects.jsx use).
 */
export default function Pricing() {
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
    getPricingPlansAdmin()
      .then(setItems)
      .catch(() => push('Failed to load pricing plans.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price.trim()) {
      push('Name and price are required.', 'error')
      return
    }
    setCreating(true)
    try {
      await createPricingPlan(form)
      setForm(EMPTY_FORM)
      push('Pricing plan added.', 'success')
      load()
    } catch {
      push('Failed to add pricing plan.', 'error')
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
      await deletePricingPlan(item.id)
      push('Pricing plan deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete pricing plan.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      price: item.price,
      billing_period: item.billing_period,
      description: item.description || '',
      is_featured: item.is_featured,
      order: item.order,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
    }))
  }

  const handleEditSave = async (item) => {
    if (!editForm.name.trim() || !editForm.price.trim()) {
      push('Name and price are required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updatePricingPlan(item.id, editForm)
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
      push('Pricing plan updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update pricing plan.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleFeatureSave = async (featureId, payload) => {
    try {
      await updatePricingFeature(featureId, payload)
      push('Feature updated.', 'success')
      load()
    } catch {
      push('Failed to update feature.', 'error')
    }
  }

  const handleFeatureDelete = async (feature) => {
    if (!window.confirm(`Delete feature "${feature.text}"? This cannot be undone.`)) return
    try {
      await deletePricingFeature(feature.id)
      push('Feature deleted.', 'success')
      load()
    } catch {
      push('Failed to delete feature.', 'error')
    }
  }

  const handleFeatureAdd = async (payload) => {
    try {
      await createPricingFeature(payload)
      push('Feature added.', 'success')
      load()
    } catch {
      push('Failed to add feature.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Pricing</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Pricing Plans</h1>
      </div>

      <Card title="pricing.add">
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
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Price</label>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              placeholder="$299 or Custom"
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Billing period</label>
            <input
              type="text"
              name="billing_period"
              value={form.billing_period}
              onChange={handleFormChange}
              placeholder="one-time or /month"
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
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-ink/30"
              />
              Featured
            </label>
          </div>
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creating ? 'Adding...' : 'Add Plan'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="pricing.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Tag className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No pricing plans yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 px-5 py-4 first:pt-4 last:pb-4">
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
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Billing period</label>
                      <input
                        type="text"
                        name="billing_period"
                        value={editForm.billing_period}
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
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={editForm.is_featured}
                          onChange={handleEditChange}
                          className="h-4 w-4 rounded border-ink/30"
                        />
                        Featured
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{item.name}</span>
                        <span className="font-mono text-[11px] text-ink/40">
                          {item.price} {item.billing_period}
                        </span>
                        {item.is_featured && (
                          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                            <Star size={10} /> featured
                          </span>
                        )}
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                          order: {item.order}
                        </span>
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
                    <span className="font-mono text-[11px] text-ink/40">features</span>
                  </div>
                  {item.features && item.features.length > 0 ? (
                    <ul className="divide-y divide-ink/10">
                      {item.features.map((feature) => (
                        <FeatureRow
                          key={feature.id}
                          feature={feature}
                          onSave={handleFeatureSave}
                          onDelete={handleFeatureDelete}
                          busy={false}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 font-mono text-xs text-ink/40">No features yet.</p>
                  )}
                  <div className="border-t border-ink/10">
                    <AddFeatureForm planId={item.id} onAdd={handleFeatureAdd} />
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
