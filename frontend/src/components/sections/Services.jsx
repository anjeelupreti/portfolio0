import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { fadeUp, viewportOnce } from '../../lib/motion'
import { resolveIcon } from '../../lib/icons'
import SectionEyebrow from '../ui/SectionEyebrow'

function ServiceRow({ service, index }) {
  const Icon = resolveIcon(service.icon_name)
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeUp}
      className="group relative border-b border-cream-fixed/10 py-8 sm:py-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <span className="font-mono text-lg text-cream-fixed/30">{num}</span>

        <div className="flex-1">
          <h3 className="font-display text-2xl font-bold tracking-tight text-cream-fixed transition-colors group-hover:text-accent sm:text-4xl">
            {service.title}
          </h3>
          <p className="mt-2 max-w-xl text-sm text-cream-fixed/60 sm:text-base">
            {service.description}
          </p>
        </div>

        <a
          href="#contact"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-cream-fixed/80 transition-colors hover:text-accent"
        >
          Read More
          <ArrowUpRight size={16} />
        </a>
      </div>

      {/* hover-reveal thumbnail — only appears on hover of this row */}
      <div
        className="pointer-events-none absolute right-4 top-1/2 z-10 hidden h-32 w-44 -translate-y-1/2 translate-x-4 rotate-3 scale-90 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-soft opacity-0 shadow-2xl transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 sm:right-24 sm:flex lg:right-40"
      >
        <Icon size={44} className="text-ink-fixed" />
      </div>
    </motion.div>
  )
}

export default function Services({ services }) {
  return (
    <section id="services" className="overflow-hidden bg-ink-fixed px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <SectionEyebrow tone="dark">Services</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-cream-fixed sm:text-5xl">
            Anyway, why work with me?
          </h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-cream-fixed/40">
            // what I can take off your plate
          </p>
        </motion.div>

        <div className="mt-14">
          {services
            .filter((s) => s.is_active !== false)
            .map((service, i) => (
              <ServiceRow key={service.id} service={service} index={i} />
            ))}
          {services.length === 0 && (
            <p className="py-10 text-cream-fixed/50">Services will appear here soon.</p>
          )}
        </div>
      </div>
    </section>
  )
}
