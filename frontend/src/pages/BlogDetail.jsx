import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Eye,
  LucideNewspaper as Newspaper,
  LucideMessageCircle as MessageCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LucideLink as LinkIcon,
  LucideCheck as Check,
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getBlogPost, postBlogComment, getSiteWidgets } from '../api/resources'
import { fadeUp } from '../lib/motion'

const initialForm = { name: '', email: '', content: '' }

// Hand-authored brand glyphs — lucide-react v1.25 dropped real brand icons,
// so these mirror the WhatsApp button's inline-SVG pattern for recognizable
// X/LinkedIn marks instead of generic stand-ins.
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556z" />
    </svg>
  )
}

function ShareButtons({ post }) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(post?.title || '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — fail silently, no crash
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-ink hover:text-ink"
      >
        <XIcon />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-ink hover:text-ink"
      >
        <LinkedInIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-ink hover:text-ink"
      >
        {copied ? <Check size={14} /> : <LinkIcon size={14} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

export default function BlogDetail() {
  const { slug } = useParams()
  // useApi calls its fetcher with no arguments, so getBlogPost (which takes
  // slug as a param) must be wrapped in a closure here rather than passed
  // directly — passing it bare silently requests /blog-posts/undefined/.
  const { data: post, loading } = useApi(() => getBlogPost(slug), [slug], null)
  const { data: widgets } = useApi(getSiteWidgets, [], null)

  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!post?.id) return
    setStatus('sending')
    try {
      await postBlogComment({ post: post.id, ...form })
      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      console.warn('Comment submission failed', err)
      setStatus('error')
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-cream px-4 pt-32">
        <p className="text-ink/40">Loading post...</p>
      </section>
    )
  }

  if (!loading && !post) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-4 pt-32 text-center">
        <Newspaper className="text-ink/30" size={40} />
        <h1 className="font-display text-2xl font-bold text-ink">Post not found</h1>
        <p className="max-w-sm text-ink/60">
          This post may have been unpublished or the link is incorrect.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
        >
          <ArrowLeft size={16} /> Back to Insights
        </Link>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-cream px-4 pb-24 pt-40 sm:px-6 sm:pt-44">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to Insights
        </Link>

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mt-8">
          {post.category && (
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              {post.category.name}
            </span>
          )}
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink/50">
            {post.author && <span>By {post.author}</span>}
            {post.published_at && (
              <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
            )}
            <span className="inline-flex items-center gap-1">
              <Eye size={14} /> {post.view_count ?? 0} views
            </span>
          </div>

          {post.cover_image && (
            <div className="mt-8 overflow-hidden rounded-3xl">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/60"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div
            className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink/75 prose-a:text-ink prose-a:underline prose-strong:text-ink"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {widgets?.blog_share_enabled && <ShareButtons post={post} />}
        </motion.div>

        {/* Comments */}
        <div className="mt-16 border-t border-ink/10 pt-12">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <MessageCircle size={22} /> Comments ({post.comments?.length || 0})
          </h2>

          <div className="mt-8 space-y-6">
            {(post.comments || []).map((c) => (
              <div key={c.id} className="rounded-2xl border border-ink/10 bg-surface/40 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-ink/40">
                    {c.created_at ? format(new Date(c.created_at), 'MMM d, yyyy') : ''}
                  </p>
                </div>
                <p className="mt-2 text-sm text-ink/70">{c.content}</p>
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-sm text-ink/40">Be the first to comment.</p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-4 rounded-3xl border border-ink/10 bg-surface/40 p-6"
          >
            <h3 className="font-display text-lg font-semibold text-ink">Leave a comment</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
              />
            </div>
            <textarea
              required
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full resize-none rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === 'sending' && <Loader2 size={16} className="animate-spin" />}
              {status === 'sending' ? 'Submitting...' : 'Submit Comment'}
            </button>

            {status === 'success' && (
              <p className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 size={16} /> Thanks! Your comment is pending approval.
              </p>
            )}
            {status === 'error' && (
              <p className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle size={16} /> Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
