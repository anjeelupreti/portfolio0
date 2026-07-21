import {
  LucideServer as Server,
  Boxes,
  LucidePlug as Plug,
  Database,
  Code2,
  Globe,
  Cloud,
  LucideShieldCheck as ShieldCheck,
  Layout,
  LucideSmartphone as Smartphone,
  LucideTerminal as Terminal,
  GitBranch,
  Cpu,
  LucideWrench as Wrench,
  BarChart3,
  Layers,
  Lock,
  LucideSettings as Settings,
  LucideSend as Send,
} from 'lucide-react'

/** Maps a service's `icon_name` (free text from the backend) to a lucide-react icon. */
const ICON_MAP = {
  server: Server,
  boxes: Boxes,
  plug: Plug,
  database: Database,
  code: Code2,
  globe: Globe,
  cloud: Cloud,
  shield: ShieldCheck,
  layout: Layout,
  mobile: Smartphone,
  terminal: Terminal,
  git: GitBranch,
  cpu: Cpu,
  wrench: Wrench,
  chart: BarChart3,
  layers: Layers,
  lock: Lock,
  settings: Settings,
}

/** Resolves a service's icon_name to a lucide-react icon component, defaulting to Code2 if unrecognized. */
export function resolveIcon(name) {
  if (!name) return Code2
  const key = String(name).toLowerCase().trim()
  return ICON_MAP[key] || Code2
}

/** Maps a skill name to a reasonable lucide-react icon, falling back to null (caller should render a monogram circle when null). */
const SKILL_ICON_MAP = {
  python: Code2,
  django: Server,
  'django rest': Plug,
  odoo: Boxes,
  php: Code2,
  javascript: Code2,
  c: Terminal,
  sql: Database,
  postgresql: Database,
  mysql: Database,
  sqlite: Database,
  sqlalchemy: Database,
  github: GitBranch,
  docker: Boxes,
  postman: Send,
  aws: Cloud,
  celery: Cpu,
  redis: Database,
  'rest apis': Globe,
  'oauth 2.0': Lock,
  mvc: Layers,
  agile: BarChart3,
  orm: Database,
  pandas: BarChart3,
  numpy: BarChart3,
  matplotlib: BarChart3,
}

/** Resolves a skill name to a lucide-react icon component, or null if unrecognized. */
export function resolveSkillIcon(name) {
  if (!name) return null
  const key = String(name).toLowerCase().trim()
  return SKILL_ICON_MAP[key] || null
}
