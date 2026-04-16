import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, Users, TrendingUp, ArrowRight, Inbox } from 'lucide-react'
import { format } from 'date-fns'
import { useMessages } from '../lib/useMessages'
import { isSupabaseConnected } from '../lib/useMessages'
import { COMPETITORS, COMPETITOR_MAP } from '../data/competitors'
import StatsCard from '../components/StatsCard'
import DayHeatmap from '../components/DayHeatmap'

const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getDOWIndex(isoString) {
  return new Date(isoString).getDay()
}

export default function Dashboard() {
  const { messages, loading, source } = useMessages()

  // All hooks must be called unconditionally before any early returns
  const stats = useMemo(() => {
    const emails = messages.filter(m => m.channel === 'email').length
    const sms = messages.filter(m => m.channel === 'sms').length
    const comps = new Set(messages.map(m => m.competitorId)).size
    return { total: messages.length, emails, sms, comps }
  }, [messages])

  // DOW breakdown
  const dowCounts = useMemo(() => {
    const counts = Array(7).fill(0)
    messages.forEach(m => { counts[getDOWIndex(m.receivedAt)]++ })
    return counts
  }, [messages])

  const peakDOW = DOW_FULL[dowCounts.indexOf(Math.max(...dowCounts))]

  // Top competitors by send volume
  const topCompetitors = useMemo(() => {
    const map = {}
    messages.forEach(m => {
      if (!map[m.competitorId]) map[m.competitorId] = { emails: 0, sms: 0 }
      if (m.channel === 'email') map[m.competitorId].emails++
      else map[m.competitorId].sms++
    })
    return Object.entries(map)
      .map(([id, counts]) => ({ id, ...counts, total: counts.emails + counts.sms }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [messages])

  const maxCount = topCompetitors[0]?.total || 1

  // Recent messages
  const recent = useMemo(() =>
    [...messages].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)).slice(0, 6),
    [messages]
  )

  // Early returns AFTER all hooks
  if (loading) return <div className="p-6 text-slate-400 animate-pulse">Loading live data…</div>

  if (source === 'live' && messages.length === 0) {
    return (
      <div className="p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Cocktail Brands — Competitive Intelligence</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">No messages captured yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Your Supabase database is connected and ready. Add your first competitor message to start seeing insights.
          </p>
          <Link
            to="/add"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add First Message
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Cocktail Brands — Competitive Intelligence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Messages" value={stats.total} icon={TrendingUp} color="#6366f1" />
        <StatsCard label="Emails Captured" value={stats.emails} icon={Mail} color="#3b82f6" />
        <StatsCard label="SMS Captured" value={stats.sms} icon={MessageSquare} color="#10b981" />
        <StatsCard label="Competitors Tracked" value={stats.comps} icon={Users} color="#f59e0b" sub="of 21 total" />
      </div>

      {/* Heatmap + DOW side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <DayHeatmap messages={messages} />
        </div>

        {/* DOW bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Sends by Day of Week</h3>
          <p className="text-xs text-slate-400 mb-4">Peak: <span className="text-indigo-600 font-semibold">{peakDOW}</span></p>
          <div className="space-y-2">
            {DOW_SHORT.map((d, i) => {
              const count = dowCounts[i === 0 ? 0 : i]
              // reorder Mon-Sun
              const reorderedIdx = i === 0 ? 0 : i
              const reorderedCount = dowCounts[reorderedIdx]
              const pct = Math.round((reorderedCount / Math.max(...dowCounts)) * 100)
              const isWeekend = d === 'Sat' || d === 'Sun'
              return (
                <div key={d} className="flex items-center gap-3">
                  <span className={`text-xs w-7 font-medium ${isWeekend ? 'text-orange-500' : 'text-slate-500'}`}>{d}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isWeekend ? 'bg-orange-400' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-4 text-right">{reorderedCount}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Competitor volume + Recent messages */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top competitors */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Send Volume by Competitor</h3>
          </div>
          <div className="space-y-3">
            {topCompetitors.map(c => {
              const comp = COMPETITOR_MAP[c.id]
              const pct = Math.round((c.total / maxCount) * 100)
              return (
                <Link key={c.id} to={`/competitor/${c.id}`} className="flex items-center gap-3 group">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: comp?.color }}
                  />
                  <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors w-28 truncate">
                    {comp?.name}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: comp?.color + 'CC' }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{c.total}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Recent Messages</h3>
            <Link to="/messages" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map(msg => {
              const comp = COMPETITOR_MAP[msg.competitorId]
              const dow = DOW_FULL[new Date(msg.receivedAt).getDay()]
              return (
                <Link
                  key={msg.id}
                  to={`/messages/${msg.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: comp?.color }}
                  >
                    {comp?.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {comp?.name} · {dow} {format(new Date(msg.receivedAt), 'h:mm a')}
                    </p>
                  </div>
                  {msg.channel === 'email'
                    ? <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-1" />
                    : <MessageSquare className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-1" />
                  }
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
