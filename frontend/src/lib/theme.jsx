import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSiteTheme } from '../api/resources'

// ---- Pure color helpers ----

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

// Mixes a hex color towards white by `amount` (0-1) — used to derive a
// lightened "soft" tint from a base color (e.g. accent-soft from accent).
export function mixHexTowardsWhite(hex, amount) {
  return mix(hex, '#ffffff', amount)
}

// Mixes a hex color towards black by `amount` (0-1) — used to derive a
// slightly darker/soft shade from a base color (e.g. ink-soft from ink).
export function mixHexTowardsBlack(hex, amount) {
  return mix(hex, '#000000', amount)
}

// ---- Applying the theme to the live document ----

// Sets the Tailwind v4 @theme-generated CSS custom properties on :root so
// every existing bg-accent/text-accent/bg-ink/etc class across the whole
// app (public site + admin dashboard) picks up the new palette with zero
// component changes.
//
// --color-ink doubles as both "brand secondary color" AND "foreground/text
// color" throughout the app (text-ink, border-ink, etc. are used as body
// text everywhere). That's fine in light mode, where the admin's secondary
// is expected to be a dark color that reads as text on the light cream
// background. But light/dark mode (src/lib/colorMode.js) is a *separate*,
// per-visitor, client-only concern that inverts cream/ink so ink becomes a
// light foreground color on a dark page. If we blindly wrote the admin's
// (typically dark) secondary_color into --color-ink while in dark mode, it
// would overwrite that inversion with an inline style (which always beats
// the [data-theme="dark"] CSS rule) and produce unreadable dark-on-dark
// text. So: only let secondary_color drive --color-ink while in light mode;
// in dark mode we leave the CSS-authored light foreground alone.
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

// ---- React context ----

const ThemeContext = createContext(null)

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
        // fail-open: keep default CSS-authored colors, never crash
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Lets callers (e.g. the Personalization admin page) push a live preview
  // or the freshly-saved theme without waiting for a refetch/reload.
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

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
