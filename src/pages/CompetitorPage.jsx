import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { ExternalLink, Mail, MessageSquare, ArrowLeft, TrendingUp } from 'lucide-react'
import { COMPETITOR_MAP } from '../data/competitors'
import { useMessages } from '../lib/useMessages'
import MessageTable from '../components/MessageTable'
import DayHeatmap from '../components/DayHeatmap'
import StatsCard from '../components/StatsCard'

const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const CAMPAIGN_COLORS = {
  welcome:       'bg-indigo-100 text-indigo-700',
  promotional:   'bg-amber-100 text-amber-700',
  cart_abandon:  'bg-red-100 text-red-700',
  reengagement:  'bg-purple-100 text-purple-700',
  educational:   'bg-emerald-100 text-emerald-700',
  transactional: 'bg-sky-100 text-sky-700',
  nurture:       'bg-pink-100 text-pink-700',
}

export default function CompetitorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const comp = COMPETITOR_MAP[id]
  const { messages: allMessages } = useMessages()
  const messages = useMemo(() =>
    allMessages.filter(m => m.competitorId === id)
      .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)),
    [allMessages, id]
  )

  if (!comp) return (
    <div className="p-6">
      <p className="text-slate-500">Competitor not found.</p>
      <button onClick={() => navigate(-1)} className="text-indigo-500 mt-2 text-sm">Go back</button>
    </div>
  )

  const emails = messages.filter(m => m.channel === 'email').length
  const sms = messages.filter(m => m.channel === 'sms').length

  // Campaign type breakdown
  const typeMap = {}
  messages.forEach(m => { typeMap[m.campaignType] = (typeMap[m.campaignType] || 0) + 1 })

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Competitor header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: comp.color }}
          >
            {comp.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Oswald', color: '#2d2520' }}>{comp.name}</h1>
            <a
              href={comp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 mt-1"
              style={{ color: '#ed7979', fontFamily: 'Josefin Sans' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {comp.domain}
            </a>
          </div>
          {messages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#afd8ea22', color: '#0369a1', fontFamily: 'Josefin Sans' }}>
                <Mail className="w-4 h-4" /> {emails} emails
              </span>
              <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{ background: '#fbab9822', color: '#c2410c', fontFamily: 'Josefin Sans' }}>
                <MessageSquare className="w-4 h-4" /> {sms} SMS
              </span>
            </div>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No messages captured yet for {comp.name}</p>
          <p className="text-slate-400 text-sm mt-1">Sign up for their emails and SMS to start tracking.</p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add First Message
          </Link>
        </div>
      ) : (
        <>
          {/* Stats + campaign breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StatsCard label="Total Captured" value={messages.length} icon={TrendingUp} color={comp.color} />
            <StatsCard label="Email Messages" value={emails} icon={Mail} color="#3b82f6" />
            <StatsCard label="SMS Messages" value={sms} icon={MessageSquare} color="#10b981" />
          </div>

          {/* Campaign type breakdown */}
          {Object.keys(typeMap).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Campaign Types</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeMap).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                  <span
                    key={type}
                    className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${CAMPAIGN_COLORS[type] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {type.replace('_', ' ')} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap for this competitor */}
          {messages.length >= 3 && (
            <div className="mb-6">
              <DayHeatmap messages={messages} />
            </div>
          )}

          {/* Message table */}
          <MessageTable messages={messages} showFilters={false} />
        </>
      )}
    </div>
  )
}
