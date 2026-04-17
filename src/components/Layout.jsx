import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Mail, BarChart3, PlusCircle,
  ChevronLeft, ChevronRight, Zap, Menu, X
} from 'lucide-react'
import Sidebar from './Sidebar'
import { isSupabaseConnected } from '../lib/useMessages'

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/messages',  label: 'Messages',    icon: Mail },
  { path: '/analytics', label: 'Analytics',   icon: BarChart3 },
  { path: '/add',       label: 'Add Message', icon: PlusCircle },
]

const SIDEBAR_BG   = '#1E1916'
const SIDEBAR_BORDER = '#2d2520'
const CORAL        = '#ed7979'
const SILVER       = '#929799'
const CREAM        = '#FAF8F2'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const location = useLocation()

  // Close mobile menu on nav
  function handleMobileNav() { setMobileOpen(false) }

  const NavLinks = ({ onClickLink }) => (
    <nav className="px-2 py-3 space-y-1">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <Link
            key={path}
            to={path}
            onClick={onClickLink}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: active ? CORAL : 'transparent',
              color: active ? '#fff' : SILVER,
              fontFamily: 'Josefin Sans',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SIDEBAR_BORDER; e.currentTarget.style.color = CREAM }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SILVER }}}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const LogoBlock = ({ compact }) => (
    <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CORAL }}>
        <Zap className="w-4 h-4 text-white" />
      </div>
      {!compact && (
        <div className="overflow-hidden flex-1">
          <p className="font-bold text-sm leading-tight text-white" style={{ fontFamily: 'Oswald', letterSpacing: '0.05em' }}>COMPETITOR INTEL</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs leading-tight" style={{ color: SILVER, fontFamily: 'Josefin Sans' }}>Cocktail Brands</p>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium leading-tight flex-shrink-0 ${isSupabaseConnected ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}
              style={!isSupabaseConnected ? { background: SIDEBAR_BORDER } : {}}
            >
              {isSupabaseConnected ? '● live' : '○ demo'}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>

      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col transition-all duration-200 flex-shrink-0"
        style={{ width: sidebarOpen ? 260 : 64, background: SIDEBAR_BG, color: CREAM }}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CORAL }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm leading-tight text-white" style={{ fontFamily: 'Oswald', letterSpacing: '0.05em' }}>COMPETITOR INTEL</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs leading-tight" style={{ color: SILVER, fontFamily: 'Josefin Sans' }}>Cocktail Brands</p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium leading-tight flex-shrink-0 ${isSupabaseConnected ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}
                  style={!isSupabaseConnected ? { background: SIDEBAR_BORDER } : {}}
                >
                  {isSupabaseConnected ? '● live' : '○ demo'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto transition-colors flex-shrink-0"
            style={{ color: SILVER }}
            onMouseEnter={e => e.currentTarget.style.color = CREAM}
            onMouseLeave={e => e.currentTarget.style.color = SILVER}
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
                  background: active ? CORAL : 'transparent',
                  color: active ? '#fff' : SILVER,
                  fontFamily: 'Josefin Sans',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SIDEBAR_BORDER; e.currentTarget.style.color = CREAM }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SILVER }}}
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

      {/* ── Mobile top bar ───────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 py-3" style={{ background: SIDEBAR_BG, borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-3" style={{ background: CORAL }}>
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="font-bold text-sm text-white flex-1" style={{ fontFamily: 'Oswald', letterSpacing: '0.05em' }}>COMPETITOR INTEL</p>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: SILVER }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="relative flex flex-col w-72 h-full shadow-2xl"
            style={{ background: SIDEBAR_BG, color: CREAM }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CORAL }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white" style={{ fontFamily: 'Oswald', letterSpacing: '0.05em' }}>COMPETITOR INTEL</p>
                <p className="text-xs" style={{ color: SILVER, fontFamily: 'Josefin Sans' }}>Cocktail Brands</p>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ color: SILVER }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <NavLinks onClickLink={handleMobileNav} />

            {/* Competitor list */}
            <div className="flex-1 overflow-hidden">
              <Sidebar onClickLink={handleMobileNav} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
