import { Link, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useCompetitors } from '../lib/useCompetitors'
import { useMessages } from '../lib/useMessages'

export default function Sidebar() {
  const location = useLocation()
  const { competitors } = useCompetitors()
  const { messages } = useMessages()

  // Count messages per competitor
  const counts = {}
  let unmatchedCount = 0
  messages.forEach(m => {
    if (!m.competitorId) { unmatchedCount++; return }
    counts[m.competitorId] = (counts[m.competitorId] || 0) + 1
  })

  return (
    <div className="flex flex-col h-full">
      <p className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Competitors ({competitors.length})
      </p>
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {competitors.map(c => {
          const active = location.pathname === `/competitor/${c.id}`
          const count  = counts[c.id] || 0
          return (
            <Link
              key={c.id}
              to={`/competitor/${c.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
              {count > 0 && (
                <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-1.5 py-0.5 flex-shrink-0">
                  {count}
                </span>
              )}
            </Link>
          )
        })}

        {/* Unmatched senders — emails captured but no competitor match yet */}
        {unmatchedCount > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unmatched</p>
            </div>
            <Link
              to="/unmatched"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${location.pathname === '/unmatched'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
              <span className="flex-1 truncate">Unknown Senders</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5 flex-shrink-0">
                {unmatchedCount}
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
