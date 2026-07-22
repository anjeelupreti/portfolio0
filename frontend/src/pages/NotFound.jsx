import { Link } from 'react-router-dom'
import { LucideCompass as Compass, LucideArrowLeft as ArrowLeft } from 'lucide-react'
import SEO from '../components/ui/SEO'

/** Catch-all 404 page for any unmatched public route. */
export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-4 pt-32 text-center">
      <SEO title="Page not found" description="This page doesn't exist or may have moved." />
      <Compass className="text-ink/30" size={40} />
      <h1 className="font-display text-3xl font-bold text-ink">404 — Page not found</h1>
      <p className="max-w-sm text-ink/60">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-105"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>
    </section>
  )
}
