import { motion } from 'framer-motion'
import {
  LucideMapPin as MapPin,
  LucideCalendarDays as CalendarDays,
  LucideBuilding2 as Building2,
} from 'lucide-react'
import { fadeUp, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'

function EntryCard({ exp, align }) {
  const dateRange = `${exp.start_date}${
    exp.is_current ? ' — Present' : exp.end_date ? ` — ${exp.end_date}` : ''
  }`

  return (
    <div
      className={`rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft/60 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-7 ${
        align === 'right' ? 'lg:text-left' : 'lg:text-right'
      }`}
    >
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-accent/80 ${
          align === 'right' ? '' : 'lg:justify-end'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} />
          {dateRange}
        </span>
        {exp.is_current && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            current
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-cream-fixed sm:text-2xl">
        {exp.role}
      </h3>

      <p
        className={`mt-1 flex items-center gap-1.5 text-sm text-cream-fixed/60 ${
          align === 'right' ? '' : 'lg:flex-row-reverse'
        }`}
      >
        <Building2 size={14} className="shrink-0 text-cream-fixed/40" />
        {exp.company}
        {exp.location && (
          <>
            <span className="text-cream-fixed/25">&middot;</span>
            <span className="inline-flex items-center gap-1 text-cream-fixed/45">
              <MapPin size={12} />
              {exp.location}
            </span>
          </>
        )}
      </p>

      {exp.description && (
        <p className="mt-3 text-sm leading-relaxed text-cream-fixed/60">{exp.description}</p>
      )}

      {exp.highlights?.length > 0 && (
        <ul
          className={`mt-4 space-y-2 border-t border-cream-fixed/10 pt-4 text-sm text-cream-fixed/70 ${
            align === 'right' ? '' : 'lg:items-end'
          } flex flex-col`}
        >
          {[...exp.highlights]
            .sort((a, b) => a.order - b.order)
            .map((h) => (
              <li
                key={h.id}
                className={`flex max-w-md gap-2 ${
                  align === 'right' ? '' : 'lg:flex-row-reverse lg:text-right'
                }`}
              >
                <span className="shrink-0 font-mono text-accent/70">&gt;</span>
                <span>{h.text}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function ExperienceTimeline({ experience = [] }) {
  const sorted = [...experience].sort((a, b) => (b.order ?? 0) - (a.order ?? 0))

  return (
    <section
      id="timeline"
      className="bg-dot-grid relative overflow-hidden bg-ink-fixed px-4 py-24 text-cream-fixed sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
          <SectionEyebrow tone="dark">Timeline</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Where I&apos;ve worked and what I shipped.
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-cream-fixed/45">
            $ git log --reverse --pretty=&quot;role @ company&quot;
          </p>
        </motion.div>

        {sorted.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-cream-fixed/15 py-16 text-center text-cream-fixed/50">
            Experience history will appear here soon.
          </div>
        ) : (
          <div className="relative mt-20">
            {/* connecting vertical line */}
            <div className="absolute left-3 top-0 h-full w-0.5 bg-accent/25 lg:left-1/2 lg:-translate-x-1/2" />

            <div className="flex flex-col gap-14">
              {sorted.map((exp, i) => {
                const align = i % 2 === 0 ? 'left' : 'right'
                return (
                  <motion.div
                    key={exp.id}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={fadeUp}
                    custom={i * 0.1}
                    className="relative pl-12 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:pl-0"
                  >
                    {/* marker dot */}
                    <span className="absolute left-3 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-ink-fixed bg-accent shadow-[0_0_0_4px_rgba(217,255,75,0.15)] lg:left-1/2" />

                    {align === 'left' ? (
                      <>
                        <EntryCard exp={exp} align="right" />
                        <div className="hidden lg:block" />
                      </>
                    ) : (
                      <>
                        <div className="hidden lg:block" />
                        <EntryCard exp={exp} align="left" />
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
