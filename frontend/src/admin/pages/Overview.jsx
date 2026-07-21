import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import { format } from 'date-fns'
import {
  LucideEye as Eye,
  LucideMonitor as Monitor,
  LucideSmartphone as Smartphone,
  LucideTablet as Tablet,
  LucideGlobe as Globe,
  LucideLoader2 as Loader2,
} from 'lucide-react'
import SectionEyebrow from '../../components/ui/SectionEyebrow'
import Card from '../components/Card'
import { getAnalyticsSummary } from '../api/adminResources'

/** Reads a live CSS custom property from the document root, falling back if unset. Used to pull theme colors into recharts, which needs real hex/rgb strings rather than var(...). */
function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Builds the current chart color palette from live theme CSS variables. Called on mount and whenever the theme/dark-mode attributes change, so charts stay in sync with the active site theme. */
function readChartColors() {
  const ink = cssVar('--color-ink', '#0a0a0a')
  const accent = cssVar('--color-accent', '#d9ff4b')
  const muted = cssVar('--color-muted', '#6b6b6b')
  const gridStroke = `color-mix(in srgb, ${ink} 10%, transparent)`
  return {
    ink,
    accent,
    muted,
    gridStroke,
    deviceColors: { desktop: accent, mobile: ink, tablet: muted },
  }
}

/** Small stat card showing an icon, label, and value — used for the visits/desktop/mobile tiles atop the analytics page. */
function StatTile({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-ink/40">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="rounded-lg bg-ink/5 p-2.5 text-ink/50">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  )
}

/** Custom recharts tooltip for the visits area chart, styled to match the dashboard's dark tooltip treatment. */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink/10 bg-ink px-3 py-2 font-mono text-xs text-cream shadow-lg">
      <p className="text-cream/50">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-accent">{p.value} visits</p>
      ))}
    </div>
  )
}

/** Admin analytics dashboard: visits over time, device/browser/country breakdowns, and top pages. Fetches summary data once on mount and re-derives chart colors whenever the site theme or dark mode changes. */
export default function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [{ ink: INK, accent: ACCENT, muted: MUTED, gridStroke: GRID_STROKE, deviceColors: DEVICE_COLORS }, setColors] =
    useState(readChartColors)

  useEffect(() => {
    const target = document.documentElement
    const observer = new MutationObserver(() => setColors(readChartColors()))
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme', 'style'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    getAnalyticsSummary()
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-ink/30" size={28} />
      </div>
    )
  }

  if (error || !data) {
    return <p className="font-mono text-sm text-ink/50">Unable to load analytics data.</p>
  }

  const visits = (data.visits_last_7_days || []).map((v) => ({
    ...v,
    label: format(new Date(v.date), 'MMM d'),
  }))

  const deviceEntries = Object.entries(data.device_breakdown || {}).filter(([, v]) => v > 0)
  const hasDeviceData = deviceEntries.length > 0

  const topPages = data.top_pages || []
  const maxPageCount = Math.max(1, ...topPages.map((p) => p.count))

  const browserData = data.browser_breakdown || []
  const countryData = data.country_breakdown || []

  return (
    <div className="space-y-6">
      <div>
        <SectionEyebrow>Overview</SectionEyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Eye} label="total visits" value={data.total_visits ?? 0} />
        <StatTile
          icon={Monitor}
          label="desktop visits"
          value={data.device_breakdown?.desktop ?? 0}
        />
        <StatTile
          icon={Smartphone}
          label="mobile visits"
          value={data.device_breakdown?.mobile ?? 0}
        />
      </div>

      <Card title="visits_last_7_days.chart">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visits} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={INK}
                strokeWidth={2}
                fill="url(#visitFill)"
                dot={{ r: 3, fill: ACCENT, stroke: INK, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {visits.length === 0 && (
            <p className="mt-2 text-center font-mono text-xs text-ink/30">No visit data in the last 7 days yet.</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="top_pages.table">
          {topPages.length === 0 ? (
            <p className="font-mono text-xs text-ink/40">No page views recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((p) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate font-mono text-xs text-ink/70" title={p.path}>
                    {p.path}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(p.count / maxPageCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-xs text-ink/50">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="device_breakdown.chart">
          {!hasDeviceData ? (
            <p className="font-mono text-xs text-ink/40">No device data recorded yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceEntries.map(([k, v]) => ({ name: k, value: v }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {deviceEntries.map(([k]) => (
                        <Cell key={k} fill={DEVICE_COLORS[k] || MUTED} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border border-ink/10 bg-ink px-3 py-2 font-mono text-xs text-cream shadow-lg">
                            {payload[0].name}: {payload[0].value}
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {deviceEntries.map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2 font-mono text-xs text-ink/70">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: DEVICE_COLORS[k] || MUTED }}
                    />
                    {k === 'tablet' ? <Tablet size={13} /> : k === 'mobile' ? <Smartphone size={13} /> : <Monitor size={13} />}
                    {k} &middot; {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="browser_breakdown.chart">
          {browserData.length === 0 ? (
            <p className="font-mono text-xs text-ink/40">No browser data recorded yet.</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="browser" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-lg border border-ink/10 bg-ink px-3 py-2 font-mono text-xs text-cream shadow-lg">
                          <p className="text-cream/50">{label}</p>
                          <p className="text-accent">{payload[0].value}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" fill={INK} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="country_breakdown.table">
          {countryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Globe className="text-ink/20" size={28} />
              <p className="font-mono text-xs text-ink/40">
                No country data yet — GeoIP lookups aren't wired up on the backend.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {countryData.map((c) => (
                <li key={c.country} className="flex items-center justify-between font-mono text-xs text-ink/70">
                  <span>{c.country}</span>
                  <span className="text-ink/40">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
