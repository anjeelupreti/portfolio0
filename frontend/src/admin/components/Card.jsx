import { WindowTitlebar } from '../../components/ui/WindowChrome'

// Consistent "code editor window" card used across the dashboard —
// matches the public site's WindowChrome motif applied to functional UI.
export default function Card({ title, children, className = '', bodyClassName = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-ink/10 bg-surface/60 shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center gap-3 border-b border-ink/10 bg-ink/[0.03] px-4 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/50" />
          </span>
          <span className="font-mono text-[11px] text-ink/40">{title}</span>
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  )
}
