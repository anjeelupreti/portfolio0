import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  LucideLoader2 as Loader2,
  LucideCheck as Check,
  LucideTrash2 as Trash2,
  LucideMessageSquare as MessageSquare,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getBlogComments, approveBlogComment, deleteBlogComment, getBlogPosts } from '../api/adminResources'
import { useToast } from '../components/Toast'

export default function Comments() {
  const { push } = useToast()
  const [comments, setComments] = useState([])
  const [postTitles, setPostTitles] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyIds, setBusyIds] = useState({})

  useEffect(() => {
    Promise.all([getBlogComments(), getBlogPosts()])
      .then(([commentData, posts]) => {
        setComments(commentData)
        const map = {}
        posts.forEach((p) => { map[p.id] = p.title })
        setPostTitles(map)
      })
      .catch(() => push('Failed to load comments.', 'error'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setBusy = (id, val) => setBusyIds((p) => ({ ...p, [id]: val }))

  const handleApprove = async (comment) => {
    setBusy(comment.id, true)
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, is_approved: true } : c)))
    try {
      await approveBlogComment(comment.id)
      push('Comment approved.', 'success')
    } catch {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, is_approved: false } : c)))
      push('Failed to approve comment.', 'error')
    } finally {
      setBusy(comment.id, false)
    }
  }

  const handleDelete = async (comment) => {
    setBusy(comment.id, true)
    const prevList = comments
    setComments((prev) => prev.filter((c) => c.id !== comment.id))
    try {
      await deleteBlogComment(comment.id)
      push('Comment deleted.', 'success')
    } catch {
      setComments(prevList)
      push('Failed to delete comment.', 'error')
    } finally {
      setBusy(comment.id, false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Comments</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Comment Moderation</h1>
      </div>

      <Card title="blog-comments.list">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-ink/30" size={24} />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquare className="text-ink/20" size={28} />
            <p className="font-mono text-xs text-ink/40">No comments yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="font-mono text-[11px] text-ink/40">{c.email}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                        c.is_approved ? 'bg-accent/20 text-ink' : 'bg-ink/10 text-ink/50'
                      }`}
                    >
                      {c.is_approved ? 'approved' : 'pending'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-ink/40">
                    on &ldquo;{postTitles[c.post] || `post #${c.post}`}&rdquo; &middot;{' '}
                    {c.created_at ? format(new Date(c.created_at), 'MMM d, yyyy') : ''}
                  </p>
                  <p className="mt-2 text-sm text-ink/75">{c.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!c.is_approved && (
                    <button
                      type="button"
                      disabled={busyIds[c.id]}
                      onClick={() => handleApprove(c)}
                      className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-mono text-xs text-cream disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyIds[c.id]}
                    onClick={() => handleDelete(c)}
                    className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3.5 py-2 font-mono text-xs text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
