import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Mail, MessageSquare, Filter, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { COMPETITORS, COMPETITOR_MAP, DAYS_OF_WEEK, CAMPAIGN_TYPES } from '../data/competitors'

const DOW_MAP = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function getDOW(isoString) {
  const d = new Date(isoString)
  return DOW_FULL[d.getDay()]
}

function formatTime(isoString) {
  return format(new Date(isoString), 'h:mm a')
}

function formatDate(isoString) {
  return format(new Date(isoString), 'MMM d, yyyy')
}

const CHANNEL_BADGE = {
  email: 'bg-blue-50 text-blue-700 border-blue-200',
  sms:   'bg-green-50 text-green-700 border-green-200',
}

const CAMPAIGN_BADGE_COLORS = {
  welcome:       'bg-indigo-50 text-indigo-700',
  promotional:   'bg-amber-50 text-amber-700',
  cart_abandon:  'bg-red-50 text-red-700',
  reengagement:  'bg-purple-50 text-purple-700',
  educational:   'bg-emerald-50 text-emerald-700',
  transactional: 'bg-sky-50 text-sky-700',
  nurture:       'bg-pink-50 text-pink-700',
}

export default function MessageTable({ messages, showFilters = true, initialType = 'all' }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterCompetitor, setFilterCompetitor] = useState('all')
  const [filterChannel, setFilterChannel] = useState('all')
  const [filterDOW, setFilterDOW] = useState('all')
  const [filterType, setFilterType] = useState(initialType)
  const [sortKey, setSortKey] = useState('receivedAt')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    let rows = [...messages]

    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(m =>
        m.subject?.toLowerCase().includes(q) ||
        m.bodyText?.toLowerCase().includes(q) ||
        COMPETITOR_MAP[m.competitorId]?.name.toLowerCase().includes(q)
      )
    }
    if (filterCompetitor !== 'all') rows = rows.filter(m => m.competitorId === filterCompetitor)
    if (filterChannel !== 'all')    rows = rows.filter(m => m.channel === filterChannel)
    if (filterDOW !== 'all')        rows = rows.filter(m => getDOW(m.receivedAt) === filterDOW)
    if (filterType !== 'all')       rows = rows.filter(m => m.campaignType === filterType)

    rows.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'receivedAt') {
        va = new Date(va).getTime()
        vb = new Date(vb).getTime()
      }
      if (sortKey === 'competitor') {
        va = COMPETITOR_MAP[a.competitorId]?.name || ''
        vb = COMPETITOR_MAP[b.competitorId]?.name || ''
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [messages, search, filterCompetitor, filterChannel, filterDOW, filterType, sortKey, sortDir])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-300" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />
  }

  return (
    <div className="flex flex-col gap-4">
      {showFilters && (
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          {/* Competitor filter */}
          <select
            value={filterCompetitor}
            onChange={e => setFilterCompetitor(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">All Competitors</option>
            {COMPETITORS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Channel filter */}
          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">Email & SMS</option>
            <option value="email">Email only</option>
            <option value="sms">SMS only</option>
          </select>

          {/* Day of week filter */}
          <select
            value={filterDOW}
            onChange={e => setFilterDOW(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">Any Day</option>
            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Campaign type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">All Types</option>
            {CAMPAIGN_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} of {messages.length} messages
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('competitor')}
                >
                  <div className="flex items-center gap-1">Competitor <SortIcon col="competitor" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ch
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Subject / Message
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 whitespace-nowrap"
                  onClick={() => handleSort('receivedAt')}
                >
                  <div className="flex items-center gap-1">Date <SortIcon col="receivedAt" /></div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Day
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No messages match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(msg => {
                const comp = COMPETITOR_MAP[msg.competitorId]
                const dow = getDOW(msg.receivedAt)
                const isWeekend = dow === 'Saturday' || dow === 'Sunday'
                return (
                  <tr
                    key={msg.id}
                    onClick={() => navigate(`/messages/${msg.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {/* Competitor */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: comp?.color || '#94a3b8' }}
                        />
                        <span className="font-medium text-slate-800 whitespace-nowrap">{comp?.name}</span>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-3">
                      {msg.channel === 'email'
                        ? <Mail className="w-4 h-4 text-blue-500" />
                        : <MessageSquare className="w-4 h-4 text-green-500" />
                      }
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-slate-800 font-medium truncate">{msg.subject}</p>
                      {msg.previewText && (
                        <p className="text-slate-400 text-xs truncate mt-0.5">{msg.previewText}</p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(msg.receivedAt)}
                    </td>

                    {/* DOW */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${isWeekend ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {dow.substring(0, 3)}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatTime(msg.receivedAt)}
                    </td>

                    {/* Campaign type */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium
                        ${CAMPAIGN_BADGE_COLORS[msg.campaignType] || 'bg-slate-100 text-slate-600'}`}>
                        {msg.campaignType?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
