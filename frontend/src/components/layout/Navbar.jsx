import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LucideMenu as Menu, LucideX as X } from 'lucide-react'

// Pricing intentionally omitted — it's gated off by the site-sections
// feature flag (seeded is_visible=false), so it's dropped from primary nav.
const NAV_LINKS = [
  { label: 'Home', anchor: 'home' },
  { label: 'About', anchor: 'about' },
  { label: 'Timeline', anchor: 'timeline' },
  { label: 'Tech Stack', anchor: 'tech-stack' },
  { label: 'Portfolio', anchor: 'portfolio' },
  { label: 'Services', anchor: 'services' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

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
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[28px] bg-ink px-4 py-3 shadow-xl shadow-black/20 sm:rounded-[32px] sm:px-6 sm:py-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-cream sm:text-2xl"
        >
          <span className="font-mono text-accent">~/</span>anjeel
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-medium text-cream/80 lg:flex">
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

        <a
          href="/#contact"
          onClick={handleAnchorClick('contact')}
          className="group hidden shrink-0 items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-105 lg:inline-flex"
        >
          Contact Me
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="text-cream lg:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl bg-ink px-6 py-6 shadow-xl lg:hidden">
          <ul className="flex flex-col gap-4 text-base font-medium text-cream/90">
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
            <li>
              <a
                href="/#contact"
                onClick={handleAnchorClick('contact')}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Contact Me
                <ArrowUpRight size={16} />
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
