import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LucideLayoutDashboard as LayoutDashboard,
  LucideToggleLeft as ToggleLeft,
  LucideUser as User,
  LucideAward as Award,
  LucideFileText as FileText,
  LucideMessageSquare as MessageSquare,
  LucideMail as Mail,
  LucidePenSquare as PenSquare,
  LucideKey as Key,
  LucideLogOut as LogOut,
  LucideMenu as Menu,
  LucideX as X,
  LucidePalette as Palette,
  LucideMessageCircle as MessageCircle,
} from 'lucide-react'
import { TrafficLights } from '../../components/ui/WindowChrome'
import { useAuth } from '../context/AuthContext'
import ColorModeToggle from '../../components/ui/ColorModeToggle'

const NAV_ITEMS = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/sections', label: 'Sections', icon: ToggleLeft },
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/training', label: 'Training', icon: Award },
  { to: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/compose', label: 'Compose', icon: PenSquare },
  { to: '/admin/personalization', label: 'Personalization', icon: Palette },
  { to: '/admin/widgets', label: 'Widgets', icon: MessageCircle },
  { to: '/admin/change-password', label: 'Settings', icon: Key },
]

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-cream-fixed/10 px-5 py-5">
        <span className="font-display text-lg font-bold text-cream-fixed">
          <span className="font-mono text-accent">~/</span>admin
        </span>
        <p className="mt-1 font-mono text-[11px] text-cream-fixed/40">portfolio-dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-cream-fixed/60 hover:bg-cream-fixed/5 hover:text-cream-fixed'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cream-fixed/10 px-4 py-4">
        <p className="truncate font-mono text-xs text-cream-fixed/50">
          {user?.username ? `logged in as ${user.username}` : ''}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-cream-fixed/15 px-3 py-2 font-mono text-xs text-cream-fixed/70 transition-colors hover:border-red-400/40 hover:text-red-300"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-cream-fixed/10 bg-ink-fixed lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-fixed">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/10 bg-cream/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-ink/10 bg-surface/60 px-3 py-1.5 sm:flex">
              <TrafficLights />
              <span className="font-mono text-[11px] text-ink/40">admin-dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ColorModeToggle className="rounded-lg p-1.5 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink" />
            <div className="font-mono text-xs text-ink/50">
              {user?.email || user?.username}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
