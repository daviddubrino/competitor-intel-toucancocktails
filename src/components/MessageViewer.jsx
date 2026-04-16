import { format } from 'date-fns'
import { Mail, MessageSquare, Calendar, Clock, Tag, ExternalLink, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COMPETITOR_MAP } from '../data/competitors'

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

export default function MessageViewer({ message }) {
  const navigate = useNavigate()
  const comp = COMPETITOR_MAP[message.competitorId]
  const date = new Date(message.receivedAt)
  const dow = DOW_FULL[date.getDay()]
  const isSMS = message.channel === 'sms'

  return (
    <div className="max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Competitor badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
            style={{ backgroundColor: comp?.color }}
          >
            {comp?.name?.[0] || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">{comp?.name}</span>
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium
                  ${isSMS ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
              >
                {isSMS
                  ? <><MessageSquare className="w-3 h-3" /> SMS</>
                  : <><Mail className="w-3 h-3" /> Email</>
                }
              </span>
              {message.campaignType && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CAMPAIGN_COLORS[message.campaignType] || 'bg-slate-100 text-slate-600'}`}>
                  {message.campaignType.replace('_', ' ')}
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-3">{message.subject}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(date, 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-indigo-600">{dow}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {format(date, 'h:mm a')}
              </span>
              {message.senderEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {message.senderEmail}
                </span>
              )}
              {comp?.website && (
                <a
                  href={comp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {comp.domain}
                </a>
              )}
            </div>

            {/* Tags */}
            {message.tags?.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {message.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message body */}
      {isSMS ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">SMS Message</p>
          <div className="flex justify-end">
            <div
              className="max-w-sm bg-green-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm"
            >
              {message.bodyText}
            </div>
          </div>
        </div>
      ) : message.bodyHtml ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Preview</p>
          </div>
          <iframe
            className="email-frame"
            srcDoc={message.bodyHtml}
            style={{ minHeight: 400 }}
            onLoad={e => {
              try {
                const h = e.target.contentDocument?.body?.scrollHeight
                if (h) e.target.style.height = h + 40 + 'px'
              } catch {}
            }}
            title="Email preview"
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-slate-500 text-sm">No message body captured yet.</p>
        </div>
      )}
    </div>
  )
}
