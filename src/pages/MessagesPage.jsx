import { Link, useSearchParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { useMessages } from '../lib/useMessages'
import MessageTable from '../components/MessageTable'

export default function MessagesPage() {
  const { messages, loading, source } = useMessages()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'all'

  if (loading) return <div className="p-6 text-slate-400 animate-pulse">Loading live data…</div>

  if (source === 'live' && messages.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">All Messages</h1>
          <p className="text-sm text-slate-500 mt-1">0 messages captured</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">No messages yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Start adding competitor emails and SMS to build your intelligence library.
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Messages</h1>
        <p className="text-sm text-slate-500 mt-1">
          {messages.length} messages captured across {new Set(messages.map(m => m.competitorId)).size} competitors
        </p>
      </div>
      <MessageTable messages={messages} showFilters={true} initialType={initialType} />
    </div>
  )
}
