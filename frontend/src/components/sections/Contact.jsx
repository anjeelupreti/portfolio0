import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LucideMail as Mail,
  LucideMapPin as MapPin,
  LucidePhone as Phone,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { fadeUp, viewportOnce } from '../../lib/motion'
import { postContact } from '../../api/resources'
import SectionEyebrow from '../ui/SectionEyebrow'

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' }

/** Contact section of the home page with profile contact info and a message form that posts to the contact API. */
export default function Contact({ profile }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await postContact(form)
      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      console.warn('Contact form submission failed', err)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="bg-dot-grid relative overflow-hidden bg-ink-fixed px-4 py-24 text-cream-fixed sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeUp}
          className="grid grid-cols-1 gap-16 lg:grid-cols-2"
        >
          <div>
            <SectionEyebrow tone="dark">Contact</SectionEyebrow>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Reach out and let&apos;s create something great together.
            </h2>
            <p className="mt-4 max-w-md font-mono text-sm text-cream-fixed/40">
              $ curl -X POST /contact -d &quot;hello@anjeel&quot;
            </p>

            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="mt-8 inline-block break-all font-display text-2xl font-semibold text-accent underline decoration-accent/40 underline-offset-4 sm:text-3xl"
              >
                {profile.email}
              </a>
            )}

            <div className="mt-8 space-y-3 text-sm text-cream-fixed/60">
              {profile?.location && (
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-accent" /> {profile.location}
                </p>
              )}
              {profile?.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-accent" /> {profile.phone}
                </p>
              )}
              {profile?.email && (
                <p className="flex items-center gap-2">
                  <Mail size={16} className="text-accent" /> {profile.email}
                </p>
              )}
            </div>

            <a
              href={profile?.email ? `mailto:${profile.email}` : '#contact'}
              className="group mt-10 inline-flex h-32 w-32 flex-col items-center justify-center rounded-full bg-cream-fixed text-center text-sm font-semibold text-ink-fixed transition-transform hover:scale-105"
            >
              Let&apos;s Connect
              <ArrowUpRight size={16} className="mt-1 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-cream-fixed/10 bg-ink-fixed-soft p-6 shadow-lg shadow-black/20 sm:p-8">
            <p className="mb-2 font-mono text-xs text-cream-fixed/35">~/contact $ new-message --to anjeel</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-xl border border-cream-fixed/15 bg-transparent px-4 py-3 text-sm text-cream-fixed placeholder:text-cream-fixed/40 focus:border-accent focus:outline-none"
              />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="rounded-xl border border-cream-fixed/15 bg-transparent px-4 py-3 text-sm text-cream-fixed placeholder:text-cream-fixed/40 focus:border-accent focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (optional)"
                className="rounded-xl border border-cream-fixed/15 bg-transparent px-4 py-3 text-sm text-cream-fixed placeholder:text-cream-fixed/40 focus:border-accent focus:outline-none"
              />
              <input
                required
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="rounded-xl border border-cream-fixed/15 bg-transparent px-4 py-3 text-sm text-cream-fixed placeholder:text-cream-fixed/40 focus:border-accent focus:outline-none"
              />
            </div>
            <textarea
              required
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell me about your project..."
              rows={5}
              className="w-full resize-none rounded-xl border border-cream-fixed/15 bg-transparent px-4 py-3 text-sm text-cream-fixed placeholder:text-cream-fixed/40 focus:border-accent focus:outline-none"
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-ink-fixed transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === 'sending' && <Loader2 size={16} className="animate-spin" />}
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle2 size={16} /> Message sent! I&apos;ll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle size={16} /> Something went wrong. Please try again later.
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
