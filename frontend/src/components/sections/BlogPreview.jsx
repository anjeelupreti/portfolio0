import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowUpRight, LucideNewspaper as Newspaper } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'

function PostCard({ post }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-40 w-full overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink to-ink-soft">
              <Newspaper className="text-accent" size={28} />
            </div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold text-ink">
              {post.category.name}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink/60">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-ink/40">
            <span>
              {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : ''}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-ink group-hover:text-accent">
              Read <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function BlogPreview({ posts }) {
  return (
    <section id="insights" className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
          className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <SectionEyebrow>Insights</SectionEyebrow>
            <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Notes on backend engineering &amp; building software.
            </h2>
            <p className="mt-4 max-w-xl font-mono text-sm text-ink/40">
              // writing about what I&apos;m learning
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            View all posts <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        {posts.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-16 rounded-3xl border border-dashed border-ink/15 py-16 text-center text-ink/50">
            No posts published yet — check back soon.
          </div>
        )}
      </div>
    </section>
  )
}
