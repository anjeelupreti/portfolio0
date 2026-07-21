import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LucideGraduationCap as GraduationCap,
  LucideAward as Award,
  LucideLanguages as LanguagesIcon,
  LucideQuote as Quote,
  LucideFileText as FileText,
  LucideMail as Mail,
  LucidePhone as Phone,
  LucideBuilding2 as Building2,
} from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'
import CertificatePreviewModal from '../ui/CertificatePreviewModal'
import Modal from '../ui/Modal'

/** Shared card layout for the About section's four info panels (education, training, languages, references). */
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

/** About section of the home page: bio plus education/training/languages/references cards, with certificate and reference-detail modals. */
export default function About({ profile, education, training, languages, references = [] }) {
  const [activeCertificate, setActiveCertificate] = useState(null)
  const [activeReference, setActiveReference] = useState(null)

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

          <InfoCard icon={Award} title="Training &amp; Certifications" promptLabel="~/about/training">
            {training.length > 0 ? (
              <ul className="space-y-3">
                {training.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="mt-1 font-mono text-ink/30">-</span>
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span>
                        <span className="font-medium text-ink">{t.title}</span>
                        <span className="text-ink/45"> &middot; {t.provider}</span>
                      </span>
                      {t.certificate_file && (
                        <button
                          type="button"
                          onClick={() => setActiveCertificate(t)}
                          className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-semibold text-ink/70 transition-colors hover:border-ink hover:text-ink"
                        >
                          <FileText size={11} /> View Certificate
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40">Coming soon.</p>
            )}
          </InfoCard>

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

          <InfoCard icon={Quote} title="References" promptLabel="~/about/references">
            {references.length > 0 ? (
              <ul className="space-y-4">
                {references.map((ref) => (
                  <li key={ref.id}>
                    <button
                      type="button"
                      onClick={() => setActiveReference(ref)}
                      className="w-full rounded-lg text-left transition-colors hover:text-ink"
                    >
                      <p className="font-medium text-ink underline decoration-ink/20 underline-offset-2">
                        {ref.name}
                      </p>
                      <p className="text-ink/45">
                        {ref.role}
                        {ref.company ? ` @ ${ref.company}` : ''}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40">Available upon request.</p>
            )}
          </InfoCard>
        </motion.div>
      </div>

      <CertificatePreviewModal
        open={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        title={activeCertificate ? `${activeCertificate.title}.certificate` : ''}
        fileUrl={activeCertificate?.certificate_file}
      />

      <Modal
        open={!!activeReference}
        onClose={() => setActiveReference(null)}
        title={activeReference ? `${activeReference.name}.reference` : ''}
      >
        {activeReference && (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-accent">
              <Quote size={20} />
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-ink">{activeReference.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
              <Building2 size={14} />
              {activeReference.role}
              {activeReference.company ? ` @ ${activeReference.company}` : ''}
            </p>

            <div className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-sm">
              {activeReference.email ? (
                <a
                  href={`mailto:${activeReference.email}`}
                  className="flex items-center gap-2 text-ink/70 hover:text-ink"
                >
                  <Mail size={15} /> {activeReference.email}
                </a>
              ) : (
                <p className="flex items-center gap-2 text-ink/40">
                  <Mail size={15} /> Available upon request
                </p>
              )}
              {activeReference.phone ? (
                <a
                  href={`tel:${activeReference.phone}`}
                  className="flex items-center gap-2 text-ink/70 hover:text-ink"
                >
                  <Phone size={15} /> {activeReference.phone}
                </a>
              ) : (
                <p className="flex items-center gap-2 text-ink/40">
                  <Phone size={15} /> Available upon request
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
