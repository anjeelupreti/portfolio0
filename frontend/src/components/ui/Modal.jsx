import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LucideX as X } from 'lucide-react'

// Generic, reusable modal used across the public site (certificate preview,
// project preview, resume preview, reference preview, ...). Renders via a
// portal so it always sits above app content regardless of where it's
// mounted, dark-mode-aware via the theme tokens (bg-cream/text-ink), closes
// on Escape, backdrop click, or the explicit X button, and does a
// lightweight focus trap (Tab/Shift+Tab cycle within the dialog) without
// requiring a full focus-trap library.
export default function Modal({ open, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.body.style.overflow = 'hidden'

    // Move focus into the dialog once it's mounted.
    const focusTimer = setTimeout(() => {
      const target = dialogRef.current?.querySelector(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      target?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = ''
      clearTimeout(focusTimer)
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-ink/10 bg-cream shadow-2xl ${className}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 px-5 py-3.5 backdrop-blur">
              <span className="truncate font-mono text-xs text-ink/50">{title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-full p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
