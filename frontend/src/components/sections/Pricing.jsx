import { motion } from 'framer-motion'
import { Check, LucideX as X } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion'
import SectionEyebrow from '../ui/SectionEyebrow'

function PlanCard({ plan }) {
  const featured = plan.is_featured

  return (
    <motion.div
      variants={fadeUp}
      className={`relative flex flex-col rounded-3xl p-8 transition-transform duration-300 ${
        featured
          ? 'scale-100 bg-ink-fixed text-cream-fixed shadow-2xl lg:scale-105'
          : 'border border-ink/10 bg-cream text-ink'
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-fixed">
          Popular
        </span>
      )}

      <h3 className="font-display text-xl font-bold">{plan.name}</h3>
      <p className={`mt-2 text-sm ${featured ? 'text-cream-fixed/60' : 'text-ink/60'}`}>
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold">{plan.price}</span>
        {plan.billing_period && (
          <span className={`text-sm ${featured ? 'text-cream-fixed/50' : 'text-ink/50'}`}>
            / {plan.billing_period}
          </span>
        )}
      </div>

      <ul className="mt-8 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f.id} className="flex items-center gap-3">
            {f.included ? (
              <Check size={16} className="shrink-0 text-accent" />
            ) : (
              <X size={16} className={`shrink-0 ${featured ? 'text-cream-fixed/30' : 'text-ink/30'}`} />
            )}
            <span className={f.included ? '' : 'line-through opacity-50'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a
        href="#contact"
        className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-105 ${
          featured ? 'bg-accent text-ink-fixed' : 'bg-ink text-cream'
        }`}
      >
        Get Started
      </a>
    </motion.div>
  )
}

export default function Pricing({ plans }) {
  return (
    <section id="pricing" className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Simple, transparent packages for every project size.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center"
        >
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </motion.div>
        {plans.length === 0 && (
          <p className="mt-10 text-ink/50">Pricing plans will appear here soon.</p>
        )}
      </div>
    </section>
  )
}
