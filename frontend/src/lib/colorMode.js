const STORAGE_KEY = 'portfolio_color_mode'

/** Reads the visitor's stored light/dark preference, falling back to the OS `prefers-color-scheme` media query, then light. Client-only, never sent to the backend. */
export function getStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/** Applies a light/dark mode to the document and persists it to localStorage (paired with the ColorModeToggle button). */
export function setMode(mode) {
  document.documentElement.dataset.theme = mode
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
  }
}

/** Flips the current mode and persists the new value; returns the new mode. */
export function toggleMode() {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  setMode(next)
  return next
}

/** Applies the stored/derived mode as early as possible (called from main.jsx before first paint) to avoid a flash of the wrong theme. */
export function initColorMode() {
  const mode = getStoredMode()
  document.documentElement.dataset.theme = mode
  return mode
}
