// Shared "eyebrow" label used at the top of every section for a consistent
// software-engineer motif: labels read like a self-closing JSX component tag,
// e.g. <About /> or <Timeline />. One motif, used everywhere, per design brief.
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
      <span className={isDark ? 'text-cream/40' : 'text-ink/35'}>&lt;</span>
      {children}
      <span className={isDark ? 'text-cream/40' : 'text-ink/35'}>/&gt;</span>
    </span>
  )
}
