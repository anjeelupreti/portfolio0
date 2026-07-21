import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import SocialIcon from '../ui/SocialIcon'

/** Site-wide footer with social links, back-to-top control, and secondary nav. */
export default function Footer({ profile, socialLinks = [] }) {
  const year = new Date().getFullYear()
  const visibleSocialLinks = socialLinks.filter((link) => link.is_visible)

  return (
    <footer className="bg-ink-fixed px-4 pb-8 pt-16 text-cream-fixed sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-cream-fixed/10 pb-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="font-mono text-accent">~/</span>anjeel
            </p>
            <p className="mt-3 max-w-sm text-sm text-cream-fixed/60">
              {profile?.title || 'Software Engineer'} building reliable backend
              systems, one clean commit at a time.
            </p>
            <p className="mt-3 font-mono text-xs text-cream-fixed/30">
              // exit code 0 — always shipping
            </p>
          </div>

          <div className="flex items-center gap-3">
            {visibleSocialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform_label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-fixed/20 text-cream-fixed transition-colors hover:border-accent hover:text-accent"
              >
                <SocialIcon platform={link.platform} size={18} />
              </a>
            ))}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              aria-label="Back to top"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-ink-fixed transition-transform hover:scale-105"
            >
              <ArrowUp size={18} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-cream-fixed/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} {profile?.full_name || 'Anjeel Upreti'}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-accent">Home</Link>
            <Link to="/blog" className="hover:text-accent">Insights</Link>
            <a href="#contact" className="hover:text-accent">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
