import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { useMessages } from '../lib/useMessages'
import { format } from 'date-fns'

export default function UnmatchedPage() {
  const { messages } = useMessages()
  const unmatched = messages.filter(m => !m.competitorId)

  // Group by sending domain (stored in tags as "domain:xxx")
  const byDomain = {}
  unmatched.forEach(m => {
    const domainTag = (m.tags || []).find(t => t.startsWith('domain:'))
    const domain = domainTag ? domainTag.replace('domain:', '') : 'unknown'
    if (!byDomain[domain]) byDomain[domain] = []
    byDomain[domain].push(m)
  })

  const domains = Object.entries(byDomain).sort((a, b) => b[1].length - a[1].length)

  if (unmatched.length === 0) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Unknown Senders</h1>
        <p className="text-sm text-slate-500">All captured emails have been matched to competitors.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Unknown Senders</h1>
        <p className="text-sm text-slate-500 mt-1">
          {unmatched.length} emails from {domains.length} unrecognised sending domain{domains.length !== 1 ? 's' : ''}.
          These are captured but not yet linked to a competitor — add the domain to the Edge Function to auto-match future emails.
        </p>
      </div>

      <div className="space-y-4">
        {domains.map(([domain, msgs]) => (
          <div key={domain} className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            {/* Domain header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border-b border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-semibold text-slate-800 text-sm">{domain}</span>
              <span className="ml-auto text-xs text-amber-600 font-medium">{msgs.length} email{msgs.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Email list */}
            <div className="divide-y divide-slate-100">
              {msgs.slice(0, 5).map(msg => (
                <Link
                  key={msg.id}
                  to={`/messages/${msg.id}`}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {msg.subject || '(no subject)'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {msg.senderEmail} · {format(new Date(msg.receivedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
              {msgs.length > 5 && (
                <p className="px-5 py-2 text-xs text-slate-400">+{msgs.length - 5} more emails from this domain</p>
              )}
            </div>

            {/* Add to mapping hint */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                To auto-match: add <code className="bg-slate-200 px-1 rounded text-slate-700">"{domain}": "competitor_id"</code> to the Edge Function's <code className="bg-slate-200 px-1 rounded text-slate-700">DOMAIN_MAP</code>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
