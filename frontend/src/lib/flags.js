/**
 * Checks whether a homepage section should render, per the site-sections
 * admin feature-flag list. Fails open — if `sections` is empty or the key
 * isn't found (e.g. the endpoint errored), the section is treated as visible
 * so the page never renders blank just because the flag service is down.
 */
export function isVisible(sections, key) {
  if (!Array.isArray(sections) || sections.length === 0) return true
  const match = sections.find((s) => s.key === key)
  if (!match) return true
  return match.is_visible !== false
}
