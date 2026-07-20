import { motion } from 'framer-motion'
import {
  LucideGraduationCap as GraduationCap,
  LucideAward as Award,
  LucideLanguages as LanguagesIcon,
  LucideQuote as Quote,
} from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'

function InfoCard({ icon: Icon, title, promptLabel, children }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-ink/10 bg-cream-dark/40 p-6 transition-colors hover:border-ink/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-accent">
            <Icon size={16} />
          </span>
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        </div>
        <span className="hidden font-mono text-[11px] text-ink/30 sm:inline">{promptLabel}</span>
      </div>
      <div className="mt-5 space-y-4 text-sm text-ink/70">{children}</div>
    </motion.div>
  )
}

export default function About({ profile, education, training, languages, references = [] }) {
  return (
    <section id="about" className="relative bg-cream px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <SectionEyebrow>About</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            {profile?.tagline || 'I build backend systems that scale.'}
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm text-ink/40">
            $ whoami &nbsp;→&nbsp; {profile?.title || 'Software Engineer'}, {profile?.location || 'Kathmandu, Nepal'}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70">
            {profile?.summary ||
              'Python Developer with over a couple of years experience in backend web development, specializing in Django, Odoo, and PostgreSQL.'}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Education */}
          <InfoCard icon={GraduationCap} title="Education" promptLabel="~/about/education">
            {education.length > 0 ? (
              education.map((ed) => (
                <div key={ed.id} className="border-l-2 border-ink/10 pl-4">
                  <p className="font-medium text-ink">{ed.degree}</p>
                  <p className="text-ink/50">
                    {ed.institution} &middot; {ed.start_year}–{ed.end_year}
                  </p>
                  {ed.gpa && (
                    <p className="mt-1 font-mono text-xs text-ink/40">GPA: {ed.gpa}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-ink/40">Coming soon.</p>
            )}
          </InfoCard>

          {/* Training */}
          <InfoCard icon={Award} title="Training &amp; Certifications" promptLabel="~/about/training">
            {training.length > 0 ? (
              <ul className="space-y-3">
                {training.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="mt-1 font-mono text-ink/30">-</span>
                    <span>
                      <span className="font-medium text-ink">{t.title}</span>
                      <span className="text-ink/45"> &middot; {t.provider}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40">Coming soon.</p>
            )}
          </InfoCard>

          {/* Languages */}
          <InfoCard icon={LanguagesIcon} title="Languages" promptLabel="~/about/languages">
            {languages.length > 0 ? (
              <ul className="space-y-3">
                {languages.map((lang) => (
                  <li key={lang.id} className="flex items-center justify-between">
                    <span className="font-medium text-ink">{lang.name}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-4 rounded-full ${
                              i < (lang.proficiency_level || 0) ? 'bg-ink' : 'bg-ink/10'
                            }`}
                          />
                        ))}
                      </span>
                      <span className="font-mono text-xs text-ink/40">
                        {lang.proficiency_label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40">Coming soon.</p>
            )}
          </InfoCard>

          {/* References */}
          <InfoCard icon={Quote} title="References" promptLabel="~/about/references">
            {references.length > 0 ? (
              <ul className="space-y-4">
                {references.map((ref) => (
                  <li key={ref.id}>
                    <p className="font-medium text-ink">{ref.name}</p>
                    <p className="text-ink/45">
                      {ref.role}
                      {ref.company ? ` @ ${ref.company}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40">Available upon request.</p>
            )}
          </InfoCard>
        </motion.div>
      </div>
    </section>
  )
}
