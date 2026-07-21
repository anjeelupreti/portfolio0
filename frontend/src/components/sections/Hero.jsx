import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { fadeUp } from '../../lib/motion'
import { TrafficLights } from '../ui/WindowChrome'
import SocialIcon from '../ui/SocialIcon'

/** Landing hero section (first thing rendered on the home page) — headline, availability status, summary, and social links. */
export default function Hero({ profile, socialLinks = [] }) {
  const visibleSocialLinks = socialLinks.filter((link) => link.is_visible)
  const fullName = profile?.full_name || 'Anjeel Upreti'
  const firstName = fullName.split(' ')[0] || 'Anjeel'
  const title = profile?.title || 'Software Engineer'

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-cream px-4 pb-16 pt-36 sm:px-6 sm:pt-40"
    >
      {profile?.profile_image ? (
        <div className="pointer-events-none absolute right-[2%] top-1/2 hidden h-80 w-80 -translate-y-1/2 overflow-hidden rounded-[45%_55%_60%_40%/45%_40%_60%_55%] shadow-2xl sm:block sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]">
          <img src={profile.profile_image} alt={fullName} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-[45%_55%_60%_40%/45%_40%_60%_55%] bg-gradient-to-br from-accent via-accent-soft to-cream-dark opacity-70 blur-2xl sm:h-[36rem] sm:w-[36rem]" />
      )}
      <div className="pointer-events-none absolute right-[-4%] top-1/3 h-64 w-64 rounded-full border-2 border-ink/10 sm:h-80 sm:w-80" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-3 rounded-xl border border-ink/15 bg-cream/60 px-4 py-2.5 shadow-sm backdrop-blur-sm"
        >
          <TrafficLights />
          <span className="font-mono text-xs font-medium text-ink/60">
            {profile?.open_to_work ? (
              <>
                <span className="text-ink/40">$</span> status --available{' '}
                <span className="text-accent">&#9679;</span>
              </>
            ) : (
              <>
                <span className="text-ink/40">$</span> whoami &nbsp;→&nbsp; {title}
              </>
            )}
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.1}
          className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-8xl"
        >
          HI THERE
          <br />
          I'M <span className="outline-text">{firstName.toUpperCase()}</span>
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.25}
          className="mt-8 flex max-w-xl flex-col gap-6 sm:mt-10"
        >
          <p className="text-base text-ink/70 sm:text-lg">
            {profile?.summary ||
              'Backend-focused software engineer crafting scalable, reliable systems with Django, Odoo, and PostgreSQL.'}
          </p>

          <div className="flex items-center gap-4">
            {visibleSocialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform_label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                <SocialIcon platform={link.platform} size={18} />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-ink/50">
            {profile?.location && (
              <span>
                <span className="text-ink/30">location:</span> {profile.location}
              </span>
            )}
            <span>
              <span className="text-ink/30">stack:</span> Python / Django / PostgreSQL
            </span>
            <span>
              <span className="text-ink/30">focus:</span> backend systems
            </span>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.4}
          className="mt-14 flex items-center gap-4 border-t border-ink/10 pt-6 sm:mt-20"
        >
          <span className="text-xs uppercase tracking-widest text-ink/50">
            Scroll to explore
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20">
            <ArrowDown size={16} />
          </span>
        </motion.div>
      </div>
    </section>
  )
}
