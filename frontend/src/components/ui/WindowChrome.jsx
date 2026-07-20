// Small macOS-style traffic-light dots decoration, used to make cards read
// like code-editor / terminal windows. Purely decorative.
export function TrafficLights() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
    </span>
  )
}

// A titlebar strip for a "window"-styled card: traffic lights + a filename/tab label.
export function WindowTitlebar({ label, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-cream/10 bg-black/20 px-4 py-2.5 ${className}`}
    >
      <TrafficLights />
      {label && (
        <span className="font-mono text-[11px] text-cream/40">{label}</span>
      )}
    </div>
  )
}
