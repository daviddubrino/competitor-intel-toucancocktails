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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="flex flex-col bg-slate-900 text-slate-100 transition-all duration-200 flex-shrink-0"
        style={{ width: sidebarOpen ? 260 : 64 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm leading-tight text-white">Competitor Intel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-slate-400 leading-tight">Cocktail Brands</p>
                {/* Data source badge */}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium leading-tight flex-shrink-0
                  ${isSupabaseConnected
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isSupabaseConnected ? '● live' : '○ demo'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto text-slate-400 hover:text-white transition-colors flex-shrink-0"
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
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
