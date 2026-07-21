// Per-visitor light/dark mode preference — purely client-side (localStorage),
// never sent to the backend. Shared across the public site and admin
// dashboard via the same localStorage key + document.documentElement dataset.

const STORAGE_KEY = 'portfolio_color_mode'

export function getStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage unavailable (e.g. privacy mode) — fall through to media query
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function setMode(mode) {
  document.documentElement.dataset.theme = mode
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore write failures
  }
}

export function toggleMode() {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  setMode(next)
  return next
}

// Applies the stored/derived mode to the document as early as possible
// (called from main.jsx before first paint) to avoid a flash of the wrong theme.
export function initColorMode() {
  const mode = getStoredMode()
  document.documentElement.dataset.theme = mode
  return mode
}
