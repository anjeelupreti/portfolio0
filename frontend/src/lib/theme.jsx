import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSiteTheme } from '../api/resources'

/** Converts a `#rgb`/`#rrggbb` hex string to `{ r, g, b }` (0-255 each). */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

/** Converts an `{ r, g, b }` object back to a `#rrggbb` hex string, clamping each channel. */
export function rgbToHex({ r, g, b }) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mix(hex, target, amount) {
  const c = hexToRgb(hex)
  const t = hexToRgb(target)
  const clamped = Math.max(0, Math.min(1, amount))
  return rgbToHex({
    r: c.r + (t.r - c.r) * clamped,
    g: c.g + (t.g - c.g) * clamped,
    b: c.b + (t.b - c.b) * clamped,
  })
}

/** Mixes a hex color towards white by `amount` (0-1) — used to derive a lightened tint (e.g. accent-soft). */
export function mixHexTowardsWhite(hex, amount) {
  return mix(hex, '#ffffff', amount)
}

/** Mixes a hex color towards black by `amount` (0-1) — used to derive a darker shade (e.g. ink-soft). */
export function mixHexTowardsBlack(hex, amount) {
  return mix(hex, '#000000', amount)
}

/**
 * Writes the admin-configured brand colors onto the Tailwind v4 CSS custom
 * properties on `:root`, so every `bg-accent`/`text-ink`/etc class across the
 * app picks up the new palette with no component changes. `secondary_color`
 * only drives `--color-ink` in light mode: in dark mode, `--color-ink` is the
 * inverted (light) foreground color from src/lib/colorMode.js, and writing an
 * inline style would override that CSS-driven inversion with unreadable
 * dark-on-dark text — so dark mode leaves it untouched instead.
 */
export function applyTheme({ primary_color, secondary_color } = {}) {
  const root = document.documentElement
  const isDark = root.dataset.theme === 'dark'

  if (primary_color) {
    root.style.setProperty('--color-accent', primary_color)
    root.style.setProperty('--color-accent-soft', mixHexTowardsWhite(primary_color, 0.4))
  }
  if (secondary_color) {
    if (isDark) {
      root.style.removeProperty('--color-ink')
      root.style.removeProperty('--color-ink-soft')
    } else {
      root.style.setProperty('--color-ink', secondary_color)
      root.style.setProperty('--color-ink-soft', mixHexTowardsWhite(secondary_color, 0.09))
    }
  }
}

const ThemeContext = createContext(null)

/** Fetches the site-wide theme (singleton) on mount and applies it; exposes `theme` + `applyTheme` via context to the whole app. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    let cancelled = false
    getSiteTheme()
      .then((data) => {
        if (cancelled || !data) return
        setTheme(data)
        applyTheme(data)
      })
      .catch(() => {
      })
    return () => {
      cancelled = true
    }
  }, [])

  const applyAndSet = useCallback((next) => {
    setTheme((prev) => ({ ...prev, ...next }))
    applyTheme(next)
  }, [])

  const value = useMemo(
    () => ({ theme, applyTheme: applyAndSet }),
    [theme, applyAndSet]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Accesses the current site theme and its live-apply setter (e.g. for the Personalization admin page's preview); must be used within ThemeProvider. */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
