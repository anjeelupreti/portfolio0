import { useEffect, useState } from 'react'
import { LucideSun as Sun, LucideMoon as Moon } from 'lucide-react'
import { getStoredMode, toggleMode } from '../../lib/colorMode'
import { useTheme } from '../../lib/theme'

// Sun/moon toggle button — persists to localStorage (see src/lib/colorMode.js),
// shared between the public site Navbar and the admin DashboardLayout topbar.
export default function ColorModeToggle({ className = '' }) {
  const [mode, setModeState] = useState(getStoredMode)
  const { theme, applyTheme } = useTheme()

  useEffect(() => {
    setModeState(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  const handleToggle = () => {
    const next = toggleMode()
    setModeState(next)
    // Re-apply the site theme so --color-ink's light/dark-mode role is
    // recomputed for the new mode (see the comment in src/lib/theme.jsx —
    // the admin's secondary_color only drives --color-ink in light mode).
    if (theme) applyTheme(theme)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
    >
      {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
