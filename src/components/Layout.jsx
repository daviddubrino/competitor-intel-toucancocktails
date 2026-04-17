import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Mail, BarChart3, PlusCircle,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import Sidebar from './Sidebar'
import { isSupabaseConnected } from '../lib/useMessages'

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/messages',  label: 'Messages',    icon: Mail },
  { path: '/analytics', label: 'Analytics',   icon: BarChart3 },
  { path: '/add',       label: 'Add Message', icon: PlusCircle },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAF8F2' }}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="flex flex-col transition-all duration-200 flex-shrink-0"
        style={{ width: sidebarOpen ? 260 : 64, background: '#1E1916', color: '#FAF8F2' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #2d2520' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ed7979' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm leading-tight text-white" style={{ fontFamily: 'Oswald', letterSpacing: '0.05em' }}>COMPETITOR INTEL</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs leading-tight" style={{ color: '#929799', fontFamily: 'Josefin Sans' }}>Cocktail Brands</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium leading-tight flex-shrink-0
                  ${isSupabaseConnected
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400'
                  }`}
                  style={!isSupabaseConnected ? { background: '#2d2520' } : {}}
                >
                  {isSupabaseConnected ? '● live' : '○ demo'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto transition-colors flex-shrink-0"
            style={{ color: '#929799' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAF8F2'}
            onMouseLeave={e => e.currentTarget.style.color = '#929799'}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 py-3 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                title={!sidebarOpen ? label : undefined}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? '#ed7979' : 'transparent',
                  color: active ? '#fff' : '#929799',
                  fontFamily: 'Josefin Sans',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#2d2520'; e.currentTarget.style.color = '#FAF8F2' }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#929799' }}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Competitor list */}
        {sidebarOpen && (
          <div className="flex-1 overflow-hidden">
            <Sidebar />
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
