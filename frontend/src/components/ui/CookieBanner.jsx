import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { getSiteWidgets } from '../../api/resources'

const STORAGE_KEY = 'portfolio_cookie_consent_dismissed'

// Bottom-of-viewport cookie/analytics consent notice. Fails open/silent if
// the widget config can't be fetched or is disabled, and never reappears
// once dismissed (tracked in localStorage, never sent to the backend).
export default function CookieBanner() {
  const [widget, setWidget] = useState(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === 'true')
    } catch {
      setDismissed(false)
    }

    let cancelled = false
    getSiteWidgets()
      .then((data) => {
        if (!cancelled) setWidget(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!widget?.cookie_banner_enabled || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore write failures (e.g. privacy mode)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-ink px-5 py-4 text-cream shadow-xl shadow-black/30 sm:flex-row sm:items-center">
          <Cookie size={20} className="hidden shrink-0 text-accent sm:block" />
          <p className="flex-1 text-xs leading-relaxed text-cream/80 sm:text-sm">
            {widget.cookie_banner_message ||
              'This site uses cookies for basic analytics to improve your experience.'}
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-ink transition-transform hover:scale-105 sm:self-center"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
