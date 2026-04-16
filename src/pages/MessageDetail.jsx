import { useParams, useNavigate } from 'react-router-dom'
import { useMessages } from '../lib/useMessages'
import MessageViewer from '../components/MessageViewer'

export default function MessageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { messages, loading } = useMessages()

  if (loading) return <div className="p-6 text-slate-400 animate-pulse">Loading…</div>

  const message = messages.find(m => m.id === id)

  if (!message) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Message not found.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-500 mt-2 text-sm">Go back</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <MessageViewer message={message} />
    </div>
  )
}
