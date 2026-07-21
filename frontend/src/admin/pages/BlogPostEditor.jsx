import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LucideLoader2 as Loader2,
  LucideSave as Save,
  LucideEye as Eye,
  LucideX as X,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import RichTextEditor from '../components/RichTextEditor'
import { useToast } from '../components/Toast'
import {
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  getBlogTags,
  createBlogCategory,
  createBlogTag,
} from '../api/adminResources'

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '',
  tags: [],
  status: 'draft',
}

export default function BlogPostEditor() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()
  const { push } = useToast()

  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')

  useEffect(() => {
    Promise.all([getBlogCategories(), getBlogTags()])
      .then(([cats, tagList]) => {
        setCategories(cats)
        setTags(tagList)
      })
      .catch(() => push('Failed to load categories/tags.', 'error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getBlogPost(slug)
      .then((post) => {
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          cover_image: post.cover_image || '',
          category: post.category?.id ?? '',
          tags: (post.tags || []).map((t) => t.id),
          status: post.status || 'draft',
        })
        setSlugTouched(true)
      })
      .catch(() => push('Failed to load post.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleTagToggle = (tagId) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((id) => id !== tagId) : [...f.tags, tagId],
    }))
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    try {
      const cat = await createBlogCategory({ name, slug: slugify(name) })
      setCategories((c) => [...c, cat])
      setForm((f) => ({ ...f, category: cat.id }))
      setNewCategoryName('')
    } catch {
      push('Failed to create category.', 'error')
    }
  }

  const handleAddTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    try {
      const tag = await createBlogTag({ name, slug: slugify(name) })
      setTags((t) => [...t, tag])
      setForm((f) => ({ ...f, tags: [...f.tags, tag.id] }))
      setNewTagName('')
    } catch {
      push('Failed to create tag.', 'error')
    }
  }

  const buildPayload = (statusOverride) => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    excerpt: form.excerpt,
    content: form.content,
    cover_image: form.cover_image || undefined,
    category: form.category || null,
    tags: form.tags,
    status: statusOverride || form.status,
  })

  const handleSave = async (statusOverride) => {
    if (!form.title.trim()) {
      push('Title is required.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = buildPayload(statusOverride)
      let saved
      if (isEdit) {
        saved = await updateBlogPost(slug, payload)
      } else {
        saved = await createBlogPost(payload)
      }
      push(isEdit ? 'Post updated.' : 'Post created.', 'success')
      navigate(`/admin/blog/${saved.slug}/edit`, { replace: true })
    } catch (err) {
      const detail = err?.response?.data
      push(
        typeof detail === 'object' ? JSON.stringify(detail) : 'Failed to save post.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const categoryName = useMemo(
    () => categories.find((c) => c.id === form.category)?.name,
    [categories, form.category]
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-ink/30" size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionEyebrow>Blog</SectionEyebrow>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink"
          >
            <Eye size={15} /> Preview
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-105 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="post.title">
            <label className="mb-1.5 block font-mono text-xs text-ink/50">title</label>
            <input
              value={form.title}
              onChange={handleTitleChange}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
            <label className="mb-1.5 mt-4 block font-mono text-xs text-ink/50">slug</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm((f) => ({ ...f, slug: e.target.value }))
              }}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 font-mono text-sm text-ink focus:border-ink focus:outline-none"
            />
            <label className="mb-1.5 mt-4 block font-mono text-xs text-ink/50">excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </Card>

          <Card title="post.content.html">
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="post.meta">
            <label className="mb-1.5 block font-mono text-xs text-ink/50">status</label>
            <div className="flex gap-2">
              {['draft', 'published'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 rounded-full px-3 py-2 font-mono text-xs capitalize transition-colors ${
                    form.status === s ? 'bg-ink text-accent' : 'bg-ink/5 text-ink/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="mb-1.5 mt-4 block font-mono text-xs text-ink/50">cover image URL</label>
            <input
              name="cover_image"
              value={form.cover_image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1 font-mono text-[10px] text-ink/30">
              File upload not wired (DRF ImageField would need multipart handling) — paste a hosted URL.
            </p>
          </Card>

          <Card title="post.category">
            <select
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category"
                className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="rounded-lg border border-ink/15 px-3 py-2 font-mono text-xs text-ink/70 hover:border-ink"
              >
                Add
              </button>
            </div>
          </Card>

          <Card title="post.tags">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
                    form.tags.includes(tag.id) ? 'bg-ink text-accent' : 'bg-ink/5 text-ink/50'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
              {tags.length === 0 && <p className="font-mono text-xs text-ink/30">No tags yet.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag"
                className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs text-ink focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg border border-ink/15 px-3 py-2 font-mono text-xs text-ink/70 hover:border-ink"
              >
                Add
              </button>
            </div>
          </Card>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-cream shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-cream px-6 py-4">
              <span className="font-mono text-xs text-ink/40">preview.html</span>
              <button type="button" onClick={() => setShowPreview(false)} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-8 sm:px-10">
              {categoryName && (
                <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                  {categoryName}
                </span>
              )}
              <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                {form.title || 'Untitled post'}
              </h1>
              {form.cover_image && (
                <div className="mt-8 overflow-hidden rounded-3xl">
                  <img src={form.cover_image} alt={form.title} className="w-full object-cover" />
                </div>
              )}
              <div
                className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink/75 prose-a:text-ink prose-a:underline prose-strong:text-ink"
                dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-ink/40">No content yet.</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
