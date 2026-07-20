import { motion } from 'framer-motion'
import { GitBranch, ExternalLink, LucideStar as Star } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'
import { WindowTitlebar } from '../ui/WindowChrome'

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function ProjectCard({ project }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <WindowTitlebar label={`${slugify(project.title)}.py`} className="border-cream/10" />

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-cream sm:text-2xl">
              {project.title}
            </h3>
            {project.featured && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
                <Star size={11} fill="currentColor" /> Featured
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">{project.description}</p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-4 py-2 font-mono text-xs font-semibold text-cream transition-colors hover:bg-cream hover:text-ink"
            >
              <GitBranch size={14} /> code
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-ink transition-colors hover:bg-accent-soft"
            >
              <ExternalLink size={14} /> live
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Portfolio({ projects }) {
  return (
    <section id="portfolio" className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <SectionEyebrow>Projects</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            A few things I&apos;ve built recently.
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-ink/40">
            $ ls ./projects --sort=recent
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
        {projects.length === 0 && (
          <p className="mt-10 text-ink/50">Projects will appear here soon.</p>
        )}
      </div>
    </section>
  )
}
