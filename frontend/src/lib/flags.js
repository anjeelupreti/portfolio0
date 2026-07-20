// Helper for the site-sections feature-flag system.
// Fails open: if a section key isn't present in the fetched list (e.g. the
// endpoint errored and we got an empty array), we treat it as visible so the
// page never goes blank just because the flag service is unreachable.
export function isVisible(sections, key) {
  if (!Array.isArray(sections) || sections.length === 0) return true
  const match = sections.find((s) => s.key === key)
  if (!match) return true
  return match.is_visible !== false
}
