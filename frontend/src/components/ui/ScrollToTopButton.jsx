import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { getSiteWidgets } from '../../api/resources'

const SCROLL_THRESHOLD = 400

// Floating "back to top" button for the public site — bottom-left so it
// never collides with the bottom-right WhatsApp button. Fails open/silent
// if the widget config can't be fetched or is disabled, and stays hidden
// until the visitor has scrolled past the threshold.
export default function ScrollToTopButton() {
  const [widget, setWidget] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
    if (!widget?.scroll_to_top_enabled) return undefined

    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [widget])

  if (!widget?.scroll_to_top_enabled) return null

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Scroll to top"
          title="Scroll to top"
          initial={{ opacity: 0, y: 12, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-cream-fixed/10 bg-ink-fixed text-cream-fixed shadow-lg shadow-black/20"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
