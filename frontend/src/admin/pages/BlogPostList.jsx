import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  LucideLoader2 as Loader2,
  LucidePlus as Plus,
  LucideSquarePen as SquarePen,
  LucideTrash2 as Trash2,
  LucideEye as Eye,
  LucideNewspaper as Newspaper,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getBlogPosts, deleteBlogPost } from '../api/adminResources'
import { useToast } from '../components/Toast'

/** Admin table of all blog posts with links to create/edit and inline optimistic delete. */
export default function BlogPostList() {
  const { push } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState(null)

  const load = () => {
    setLoading(true)
    getBlogPosts()
      .then(setPosts)
      .catch(() => push('Failed to load posts.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setBusySlug(post.slug)
    const prev = posts
    setPosts((p) => p.filter((x) => x.slug !== post.slug))
    try {
      await deleteBlogPost(post.slug)
      push('Post deleted.', 'success')
    } catch {
      setPosts(prev)
      push('Failed to delete post.', 'error')
    } finally {
      setBusySlug(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionEyebrow>Blog</SectionEyebrow>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">Blog Posts</h1>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-105"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      <Card title="blog-posts.list" bodyClassName="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Newspaper className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No posts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 font-mono text-[11px] uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-normal">Title</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal">Category</th>
                  <th className="px-5 py-3 font-normal">Views</th>
                  <th className="px-5 py-3 font-normal">Published</th>
                  <th className="px-5 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-ink/5 last:border-none">
                    <td className="max-w-[220px] truncate px-5 py-3 font-medium text-ink" title={post.title}>
                      {post.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
                          post.status === 'published'
                            ? 'bg-accent/20 text-ink'
                            : 'bg-ink/10 text-ink/50'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/60">{post.category?.name || '—'}</td>
                    <td className="px-5 py-3 text-ink/60">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={13} /> {post.view_count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/60">
                      {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/blog/${post.slug}/edit`}
                          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
                        >
                          <SquarePen size={13} /> Edit
                        </Link>
                        <button
                          type="button"
                          disabled={busySlug === post.slug}
                          onClick={() => handleDelete(post)}
                          className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 font-mono text-xs text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
