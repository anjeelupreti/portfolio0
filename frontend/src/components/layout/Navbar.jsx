import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LucideMenu as Menu, LucideX as X, LucideDownload as Download } from 'lucide-react'
import ColorModeToggle from '../ui/ColorModeToggle'
import CertificatePreviewModal from '../ui/CertificatePreviewModal'
import { getSiteWidgets } from '../../api/resources'

/** Primary nav anchors for the single-page home layout. Pricing is intentionally excluded (gated separately behind a site-sections visibility flag). */
const NAV_LINKS = [
  { label: 'Home', anchor: 'home' },
  { label: 'About', anchor: 'about' },
  { label: 'Timeline', anchor: 'timeline' },
  { label: 'Tech Stack', anchor: 'tech-stack' },
  { label: 'Portfolio', anchor: 'portfolio' },
  { label: 'Services', anchor: 'services' },
]

/** Fixed top navigation bar for the public site. Handles anchor-link scrolling on the home page (navigating there first if on another route) and conditionally shows a resume-preview button based on site widget settings. */
export default function Navbar({ profile }) {
  const [open, setOpen] = useState(false)
  const [widgets, setWidgets] = useState(null)
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false
    getSiteWidgets()
      .then((data) => {
        if (!cancelled) setWidgets(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const showResumeButton = Boolean(widgets?.resume_download_enabled && profile?.resume_file)

  const handleAnchorClick = (anchor) => (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      const el = document.getElementById(anchor)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    }
    setOpen(false)
  }

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[28px] bg-ink-fixed px-4 py-3 shadow-xl shadow-black/20 sm:rounded-[32px] sm:px-6 sm:py-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-cream-fixed sm:text-2xl"
        >
          <span className="font-mono text-accent">~/</span>anjeel
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-medium text-cream-fixed/80 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.anchor}>
              <a
                href={`/#${link.anchor}`}
                onClick={handleAnchorClick(link.anchor)}
                className="transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/blog"
              className={`transition-colors hover:text-accent ${
                location.pathname.startsWith('/blog') ? 'text-accent' : ''
              }`}
            >
              Insights
            </Link>
          </li>
        </ul>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ColorModeToggle className="rounded-full p-2 text-cream-fixed/80 transition-colors hover:bg-cream-fixed/10 hover:text-accent" />
          {showResumeButton && (
            <button
              type="button"
              onClick={() => setResumePreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-cream-fixed/25 px-4 py-2.5 text-sm font-semibold text-cream-fixed transition-colors hover:border-accent hover:text-accent"
            >
              <Download size={15} />
              Resume
            </button>
          )}
          <a
            href="/#contact"
            onClick={handleAnchorClick('contact')}
            className="group inline-flex items-center gap-2 rounded-full bg-cream-fixed px-5 py-2.5 text-sm font-semibold text-ink-fixed transition-transform hover:scale-105"
          >
            Contact Me
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ColorModeToggle className="rounded-full p-2 text-cream-fixed/80 transition-colors hover:bg-cream-fixed/10 hover:text-accent" />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="p-1 text-cream-fixed"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl bg-ink-fixed px-6 py-6 shadow-xl lg:hidden">
          <ul className="flex flex-col gap-4 text-base font-medium text-cream-fixed/90">
            {NAV_LINKS.map((link) => (
              <li key={link.anchor}>
                <a href={`/#${link.anchor}`} onClick={handleAnchorClick(link.anchor)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/blog" onClick={() => setOpen(false)}>
                Insights
              </Link>
            </li>
            {showResumeButton && (
              <li>
                <button
                  type="button"
                  onClick={() => setResumePreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-cream-fixed/25 px-5 py-2.5 text-sm font-semibold text-cream-fixed"
                >
                  <Download size={16} />
                  Resume
                </button>
              </li>
            )}
            <li>
              <a
                href="/#contact"
                onClick={handleAnchorClick('contact')}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-cream-fixed px-5 py-2.5 text-sm font-semibold text-ink-fixed"
              >
                Contact Me
                <ArrowUpRight size={16} />
              </a>
            </li>
          </ul>
        </div>
      )}

      {showResumeButton && (
        <CertificatePreviewModal
          open={resumePreviewOpen}
          onClose={() => setResumePreviewOpen(false)}
          title="resume.preview"
          fileUrl={profile.resume_file}
        />
      )}
    </header>
  )
}
