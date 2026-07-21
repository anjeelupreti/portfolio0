import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ArrowUpRight, LucideNewspaper as Newspaper, Eye } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getBlogPosts, getBlogCategories } from '../api/resources'
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion'

/** Public blog index — lists published posts with client-side category filtering. */
export default function BlogList() {
  const { data: posts, loading } = useApi(getBlogPosts, [], [])
  const { data: categories } = useApi(getBlogCategories, [], [])
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    const list = posts || []
    if (activeCategory === 'all') return list
    return list.filter((p) => p.category?.slug === activeCategory)
  }, [posts, activeCategory])

  return (
    <section className="min-h-screen bg-cream px-4 pb-24 pt-40 sm:px-6 sm:pt-44">
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink/70">
            Insights
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Notes &amp; Writing
          </h1>
          <p className="mt-4 max-w-xl text-ink/60">
            Thoughts on backend engineering, APIs, and building maintainable software.
          </p>
        </motion.div>

        {categories?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeCategory === 'all' ? 'bg-ink text-cream' : 'border border-ink/15 text-ink/70'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-ink text-cream'
                    : 'border border-ink/15 text-ink/70'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="mt-16 text-ink/40">Loading posts...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-16 rounded-3xl border border-dashed border-ink/15 py-20 text-center text-ink/50">
            <Newspaper className="mx-auto mb-4 text-ink/30" size={32} />
            No posts published yet — check back soon.
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-surface/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-44 w-full overflow-hidden">
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
                    <h2 className="font-display text-lg font-bold tracking-tight text-ink">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink/60">
                      {post.excerpt}
                    </p>
                    {post.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[11px] text-ink/60"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-ink/40">
                      <span>
                        {post.published_at
                          ? format(new Date(post.published_at), 'MMM d, yyyy')
                          : ''}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={13} /> {post.view_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-ink group-hover:text-accent">
                          Read <ArrowUpRight size={13} />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
