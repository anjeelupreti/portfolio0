import { useEffect, useRef, useState } from 'react'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideTrash2 as Trash2,
  LucideUpload as Upload,
  LucideImage as ImageIcon,
  LucideFolderCode as FolderCode,
  LucidePencil as Pencil,
  LucideSave as Save,
  LucideX as X,
  LucideStar as Star,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import {
  getProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} from '../api/adminResources'
import { useToast } from '../components/Toast'

const EMPTY_FORM = {
  title: '',
  description: '',
  repo_url: '',
  live_url: '',
  featured: false,
  order: 0,
}

/**
 * Admin CRUD for portfolio project entries, including cover image upload via `uploadProjectImage`
 * (shared multipart upload helper, same pattern as Training's certificate upload) and inline
 * editing of text fields, which the backend supports but Training's UI does not surface.
 */
export default function Projects() {
  const { push } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInputRefs = useRef({})

  const load = () => {
    setLoading(true)
    getProjectsAdmin()
      .then(setItems)
      .catch(() => push('Failed to load projects.', 'error'))
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
    if (!form.title.trim() || !form.description.trim()) {
      push('Title and description are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createProject(form)
      setItems((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      push('Project added.', 'success')
    } catch {
      push('Failed to add project.', 'error')
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
      await deleteProject(item.id)
      push('Project deleted.', 'success')
    } catch {
      setItems(prev)
      push('Failed to delete project.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleImageSelect = async (item, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusyId(item.id)
    try {
      const updated = await uploadProjectImage(item.id, file)
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
      push('Image uploaded.', 'success')
    } catch {
      push('Failed to upload image.', 'error')
    } finally {
      setBusyId(null)
      if (fileInputRefs.current[item.id]) fileInputRefs.current[item.id].value = ''
    }
  }

  const handleImageRemove = async (item) => {
    setBusyId(item.id)
    try {
      const updated = await updateProject(item.id, { image: null })
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
      push('Image removed.', 'success')
    } catch {
      push('Failed to remove image.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      description: item.description,
      repo_url: item.repo_url || '',
      live_url: item.live_url || '',
      featured: item.featured,
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
    if (!editForm.title.trim() || !editForm.description.trim()) {
      push('Title and description are required.', 'error')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateProject(item.id, editForm)
      setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)))
      push('Project updated.', 'success')
      cancelEdit()
    } catch {
      push('Failed to update project.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Projects</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Projects</h1>
      </div>

      <Card title="projects.add">
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
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Repo URL</label>
            <input
              type="text"
              name="repo_url"
              value={form.repo_url}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-ink/50">Live URL</label>
            <input
              type="text"
              name="live_url"
              value={form.live_url}
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
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
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
              {creating ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="projects.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <FolderCode className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No projects yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-5 py-4 first:pt-4 last:pb-4">
                {editingId === item.id ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Repo URL</label>
                      <input
                        type="text"
                        name="repo_url"
                        value={editForm.repo_url}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-ink/50">Live URL</label>
                      <input
                        type="text"
                        name="live_url"
                        value={editForm.live_url}
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
                    <div className="flex items-end pb-2.5">
                      <label className="flex items-center gap-2 font-mono text-xs text-ink/60">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={editForm.featured}
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
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-12 w-16 shrink-0 rounded-md border border-ink/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-ink/15 text-ink/20">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-ink">{item.title}</span>
                          {item.featured && (
                            <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                              <Star size={10} /> featured
                            </span>
                          )}
                          <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                            order: {item.order}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                              item.image ? 'bg-accent/20 text-ink' : 'bg-ink/10 text-ink/50'
                            }`}
                          >
                            {item.image ? 'has image' : 'no image'}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-mono text-[11px] text-ink/40">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {item.image && (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleImageRemove(item)}
                          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/60 disabled:opacity-50"
                        >
                          <Trash2 size={13} /> Remove image
                        </button>
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
                        {item.image ? 'Replace' : 'Upload'}
                      </button>
                      <input
                        ref={(el) => (fileInputRefs.current[item.id] = el)}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        onChange={(e) => handleImageSelect(item, e)}
                        className="hidden"
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
