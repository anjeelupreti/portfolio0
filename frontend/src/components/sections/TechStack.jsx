import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import { resolveSkillIcon } from '../../lib/icons'
import SectionEyebrow from '../ui/SectionEyebrow'
import { WindowTitlebar } from '../ui/WindowChrome'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ProficiencyRing({ value }) {
  const offset = CIRCUMFERENCE - (Math.min(100, Math.max(0, value)) / 100) * CIRCUMFERENCE

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 -rotate-90">
      <circle
        cx="28"
        cy="28"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-cream-fixed/10"
      />
      <motion.circle
        cx="28"
        cy="28"
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-accent"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={viewportOnce}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function SkillRow({ skill }) {
  const Icon = resolveSkillIcon(skill.name) || Code2

  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-4 rounded-xl border border-cream-fixed/5 bg-black/10 px-4 py-3 transition-colors hover:border-accent/30 hover:bg-black/20"
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <ProficiencyRing value={skill.proficiency} />
        <Icon size={18} className="absolute text-cream-fixed/80" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-cream-fixed">{skill.name}</p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-cream-fixed/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.proficiency}%` }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold text-accent">
        {skill.proficiency}%
      </span>
    </motion.div>
  )
}

function CategoryCard({ category }) {
  return (
    <motion.div
      variants={fadeUp}
      className="overflow-hidden rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft shadow-lg shadow-black/20"
    >
      <WindowTitlebar label={`~/skills/${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`} />
      <div className="p-5">
        <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-cream-fixed/40">
          {category.name}
        </h3>
        <div className="space-y-3">
          {[...category.skills]
            .sort((a, b) => a.order - b.order)
            .map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function TechStack({ skillCategories = [] }) {
  return (
    <section
      id="tech-stack"
      className="bg-dot-grid relative overflow-hidden bg-ink-fixed px-4 py-24 text-cream-fixed sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
          <SectionEyebrow tone="dark">TechStack</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tools and technologies I use to build reliable software.
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-cream-fixed/45">
            $ cat stack.json --grouped --with-proficiency
          </p>
        </motion.div>

        {skillCategories.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-cream-fixed/15 py-16 text-center text-cream-fixed/50">
            Skills will appear here soon.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {[...skillCategories]
              .sort((a, b) => a.order - b.order)
              .map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
