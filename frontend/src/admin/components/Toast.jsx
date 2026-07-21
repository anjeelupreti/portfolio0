import { createContext, useCallback, useContext, useState } from 'react'
import { LucideCheck as Check, LucideAlertCircle as AlertCircle, LucideX as X } from 'lucide-react'

const ToastContext = createContext(null)

/** Provides a `push(message, type)` toast notifier to the admin dashboard tree and renders the stacked toast list; each toast auto-dismisses after 5s. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 font-mono text-xs shadow-xl ${
              t.type === 'error'
                ? 'border-red-500/30 bg-ink-fixed text-red-300'
                : t.type === 'success'
                  ? 'border-accent/30 bg-ink-fixed text-accent'
                  : 'border-cream-fixed/20 bg-ink-fixed text-cream-fixed/80'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
            ) : (
              <Check size={15} className="mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-cream-fixed/40 hover:text-cream-fixed"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Accesses the toast `push` function; throws if called outside ToastProvider. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
