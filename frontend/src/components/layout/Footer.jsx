import { Link } from 'react-router-dom'
import { GitBranch, Link2, Globe, Camera, ArrowUp } from 'lucide-react'

const SOCIALS = [
  { key: 'github_url', Icon: GitBranch, label: 'GitHub' },
  { key: 'linkedin_url', Icon: Link2, label: 'LinkedIn' },
  { key: 'facebook_url', Icon: Globe, label: 'Facebook' },
  { key: 'instagram_url', Icon: Camera, label: 'Instagram' },
]

/** Site-wide footer with social links, back-to-top control, and secondary nav. */
export default function Footer({ profile }) {
  const year = new Date().getFullYear()

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
            {SOCIALS.map(({ key, Icon, label }) =>
              profile?.[key] ? (
                <a
                  key={key}
                  href={profile[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-fixed/20 text-cream-fixed transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon size={18} />
                </a>
              ) : null
            )}
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
