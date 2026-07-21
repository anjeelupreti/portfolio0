import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, ExternalLink, LucideStar as Star } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'
import { WindowTitlebar } from '../ui/WindowChrome'
import Modal from '../ui/Modal'

/** Converts a project title into a lowercase, hyphenated slug for display labels (not routing). */
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Repo/live-demo link buttons shown on a project card; stops propagation so clicks don't open the card's modal. */
function ProjectLinks({ project }) {
  return (
    <div className="mt-8 flex items-center gap-3">
      {project.repo_url && (
        <a
          href={project.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-cream-fixed/15 px-4 py-2 font-mono text-xs font-semibold text-cream-fixed transition-colors hover:bg-cream-fixed hover:text-ink-fixed"
        >
          <GitBranch size={14} /> code
        </a>
      )}
      {project.live_url && (
        <a
          href={project.live_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-ink-fixed transition-colors hover:bg-accent-soft"
        >
          <ExternalLink size={14} /> live
        </a>
      )}
    </div>
  )
}

/** Clickable/keyboard-accessible project tile in the grid; opens the detail modal via `onOpen`. */
function ProjectCard({ project, onOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(project)
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-cream-fixed/10 bg-ink-fixed shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <WindowTitlebar label={`${slugify(project.title)}.py`} className="border-cream-fixed/10" />

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-cream-fixed sm:text-2xl">
              {project.title}
            </h3>
            {project.featured && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-fixed">
                <Star size={11} fill="currentColor" /> Featured
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cream-fixed/60">{project.description}</p>
        </div>

        <ProjectLinks project={project} />
      </div>
    </motion.div>
  )
}

/** Expanded project detail shown inside the Modal when a ProjectCard is opened. */
function ProjectPreview({ project }) {
  return (
    <div>
      {project.image ? (
        <div className="overflow-hidden rounded-xl">
          <img src={project.image} alt={project.title} className="max-h-[45vh] w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-ink to-ink-soft">
          <span className="font-mono text-xs text-cream/40">{`${slugify(project.title)}.py`}</span>
        </div>
      )}

      <div className="mt-5 flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{project.title}</h3>
        {project.featured && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
            <Star size={11} fill="currentColor" /> Featured
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{project.description}</p>

      <div className="mt-6 flex items-center gap-3">
        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 font-mono text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
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
  )
}

/** Projects section of the home page: grid of ProjectCards with a shared detail Modal for the active project. */
export default function Portfolio({ projects }) {
  const [activeProject, setActiveProject] = useState(null)

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
            <ProjectCard key={project.id} project={project} onOpen={setActiveProject} />
          ))}
        </motion.div>
        {projects.length === 0 && (
          <p className="mt-10 text-ink/50">Projects will appear here soon.</p>
        )}
      </div>

      <Modal
        open={!!activeProject}
        onClose={() => setActiveProject(null)}
        title={activeProject ? `${slugify(activeProject.title)}.py` : ''}
      >
        {activeProject && <ProjectPreview project={activeProject} />}
      </Modal>
    </section>
  )
}
