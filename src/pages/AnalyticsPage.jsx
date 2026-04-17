import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMessages } from '../lib/useMessages'
import { COMPETITORS, COMPETITOR_MAP, DAYS_OF_WEEK, CAMPAIGN_TYPES } from '../data/competitors'
import DayHeatmap from '../components/DayHeatmap'

const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAYS_ORDERED = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function getDOW(isoString) {
  return DOW_FULL[new Date(isoString).getDay()]
}
function getHour(isoString) {
  return new Date(isoString).getHours()
}

const HOUR_BUCKETS = [
  { label: 'Early AM (12–6)', test: h => h >= 0 && h < 6 },
  { label: 'Morning (6–10)',  test: h => h >= 6 && h < 10 },
  { label: 'Mid-morning (10–12)', test: h => h >= 10 && h < 12 },
  { label: 'Lunch (12–2)',    test: h => h >= 12 && h < 14 },
  { label: 'Afternoon (2–5)', test: h => h >= 14 && h < 17 },
  { label: 'Evening (5–8)',   test: h => h >= 17 && h < 20 },
  { label: 'Night (8–12)',    test: h => h >= 20 && h <= 23 },
]

export default function AnalyticsPage() {
  const { messages, loading } = useMessages()

  // All hooks must be called unconditionally before any early returns
  // DOW breakdown
  const dowData = useMemo(() => {
    const map = {}
    DAYS_ORDERED.forEach(d => { map[d] = { email: 0, sms: 0 } })
    messages.forEach(m => {
      const d = getDOW(m.receivedAt)
      if (map[d]) map[d][m.channel]++
    })
    return DAYS_ORDERED.map(d => ({ day: d, ...map[d], total: map[d].email + map[d].sms }))
  }, [messages])

  const maxDOW = Math.max(...dowData.map(d => d.total), 1)

  // Hour distribution
  const hourData = useMemo(() => {
    return HOUR_BUCKETS.map(b => {
      const count = messages.filter(m => b.test(getHour(m.receivedAt))).length
      return { ...b, count }
    })
  }, [messages])
  const maxHour = Math.max(...hourData.map(h => h.count), 1)

  // Campaign type breakdown
  const campaignData = useMemo(() => {
    const map = {}
    messages.forEach(m => { map[m.campaignType] = (map[m.campaignType] || 0) + 1 })
    return Object.entries(map)
      .map(([type, count]) => {
        const info = CAMPAIGN_TYPES.find(t => t.id === type)
        return { type, label: info?.label || type, count, color: info?.color || '#94a3b8' }
      })
      .sort((a, b) => b.count - a.count)
  }, [messages])
  const maxCampaign = Math.max(...campaignData.map(c => c.count), 1)

  // Channel split
  const emailCount = messages.filter(m => m.channel === 'email').length
  const smsCount = messages.filter(m => m.channel === 'sms').length
  const emailPct = Math.round((emailCount / messages.length) * 100)

  // Competitor activity
  const compData = useMemo(() => {
    const map = {}
    messages.forEach(m => { map[m.competitorId] = (map[m.competitorId] || 0) + 1 })
    return COMPETITORS
      .map(c => ({ ...c, count: map[c.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .filter(c => c.count > 0)
  }, [messages])
  const maxComp = Math.max(...compData.map(c => c.count), 1)

  // Early return AFTER all hooks
  if (loading) return <div className="p-6 text-slate-400">Loading...</div>

  return (
    <div className="p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Patterns and insights from {messages.length} captured messages</p>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <DayHeatmap messages={messages} />
      </div>

      {/* 2-column charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* DOW distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Sends by Day of Week
            <span className="text-slate-400 font-normal ml-2">— Monday through Sunday</span>
          </h3>
          <div className="space-y-3">
            {dowData.map(d => {
              const isWeekend = d.day === 'Saturday' || d.day === 'Sunday'
              const pct = Math.round((d.total / maxDOW) * 100)
              const emailPct2 = d.total ? Math.round((d.email / d.total) * 100) : 0
              return (
                <div key={d.day} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-24 ${isWeekend ? 'text-orange-500' : 'text-slate-600'}`}>
                    {d.day}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden flex">
                    {d.email > 0 && (
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${(d.email / maxDOW) * 100}%` }}
                        title={`${d.email} emails`}
                      />
                    )}
                    {d.sms > 0 && (
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${(d.sms / maxDOW) * 100}%` }}
                        title={`${d.sms} SMS`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right font-medium">{d.total}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Email
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-emerald-400" /> SMS
            </span>
          </div>
        </div>

        {/* Time of day */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Sends by Time of Day
          </h3>
          <div className="space-y-3">
            {hourData.map(h => (
              <div key={h.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-36">{h.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${(h.count / maxHour) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-5 text-right">{h.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign types + Channel split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Campaign types */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Campaign Type Breakdown</h3>
          <div className="space-y-3">
            {campaignData.map(c => (
              <Link
                key={c.type}
                to={`/messages?type=${c.type}`}
                className="flex items-center gap-3 group hover:bg-slate-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
              >
                <span className="text-xs text-slate-500 w-44 capitalize group-hover:text-indigo-600 transition-colors">{c.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(c.count / maxCampaign) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-5 text-right">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Channel split donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Email vs SMS Split</h3>
          <div className="flex items-center gap-6">
            {/* Simple visual */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EEF2FF" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#6366f1" strokeWidth="3.5"
                  strokeDasharray={`${emailPct} ${100 - emailPct}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#10b981" strokeWidth="3.5"
                  strokeDasharray={`${100 - emailPct} ${emailPct}`}
                  strokeDashoffset={`-${emailPct}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800">{messages.length}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{emailCount}</p>
                <p className="text-xs text-slate-400">{emailPct}% of all messages</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">SMS</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{smsCount}</p>
                <p className="text-xs text-slate-400">{100 - emailPct}% of all messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor volume */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          All Competitors — Send Volume Ranked
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {compData.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-5 text-right">{i + 1}</span>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-sm text-slate-600 w-32 truncate">{c.name}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.count / maxComp) * 100}%`, backgroundColor: c.color + 'BB' }}
                />
              </div>
              <span className="text-xs text-slate-500 w-5 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
