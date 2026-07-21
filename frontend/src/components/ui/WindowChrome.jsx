/** Decorative macOS-style traffic-light dots, used inside window-styled cards. */
export function TrafficLights() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
    </span>
  )
}

/** Titlebar strip (traffic lights + filename label) for always-dark "window" cards like Portfolio project cards and admin auth panels; uses the mode-invariant fixed tokens so it never flips with color mode. */
export function WindowTitlebar({ label, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-cream-fixed/10 bg-black/20 px-4 py-2.5 ${className}`}
    >
      <TrafficLights />
      {label && (
        <span className="font-mono text-[11px] text-cream-fixed/40">{label}</span>
      )}
    </div>
  )
}
