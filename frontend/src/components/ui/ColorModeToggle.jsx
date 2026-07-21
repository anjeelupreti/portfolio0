import { useEffect, useState } from 'react'
import { LucideSun as Sun, LucideMoon as Moon } from 'lucide-react'
import { getStoredMode, toggleMode } from '../../lib/colorMode'
import { useTheme } from '../../lib/theme'

/**
 * Sun/moon light/dark mode toggle, persisted via src/lib/colorMode.js.
 * Shared between the public site Navbar and the admin DashboardLayout topbar.
 */
export default function ColorModeToggle({ className = '' }) {
  const [mode, setModeState] = useState(getStoredMode)
  const { theme, applyTheme } = useTheme()

  useEffect(() => {
    setModeState(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  const handleToggle = () => {
    const next = toggleMode()
    setModeState(next)
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
