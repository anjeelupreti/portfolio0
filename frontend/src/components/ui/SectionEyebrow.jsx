/** Renders a section label styled like a self-closing JSX tag (e.g. `<About />`) — the recurring "eyebrow" motif above every homepage section. */
export default function SectionEyebrow({ children, tone = 'light' }) {
  const isDark = tone === 'dark'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-mono text-xs font-medium tracking-tight ${
        isDark
          ? 'border-accent/30 text-accent'
          : 'border-ink/15 text-ink/70'
      }`}
    >
      <span className={isDark ? 'text-cream-fixed/40' : 'text-ink/35'}>&lt;</span>
      {children}
      <span className={isDark ? 'text-cream-fixed/40' : 'text-ink/35'}>/&gt;</span>
    </span>
  )
}
