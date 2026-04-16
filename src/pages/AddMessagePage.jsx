import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Mail, MessageSquare, Check, AlertCircle } from 'lucide-react'
import { COMPETITORS, CAMPAIGN_TYPES } from '../data/competitors'
import { saveMessage } from '../lib/useMessages'

export default function AddMessagePage() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    competitorId: '',
    channel: 'email',
    subject: '',
    previewText: '',
    senderEmail: '',
    bodyHtml: '',
    bodyText: '',
    receivedAt: new Date().toISOString().slice(0, 16),
    campaignType: 'promotional',
    tags: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await saveMessage(form)
    if (result.success) {
      setSaved(true)
      setTimeout(() => navigate('/messages'), 2000)
    } else {
      alert('Error saving message. Check console for details.')
    }
  }

  if (saved) {
    return (
      <div className="p-6 max-w-2xl flex flex-col items-center justify-center min-h-64">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Message Saved!</h2>
        <p className="text-slate-500 mt-1">Redirecting to messages...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Message</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manually log a competitor email or SMS you received.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">

        {/* Competitor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Competitor *</label>
          <select
            name="competitorId"
            value={form.competitorId}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            <option value="">Select a competitor...</option>
            {COMPETITORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Channel *</label>
          <div className="flex gap-3">
            {[
              { value: 'email', label: 'Email', icon: Mail },
              { value: 'sms', label: 'SMS', icon: MessageSquare },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, channel: value }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${form.channel === value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject (email only) */}
        {form.channel === 'email' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject Line *</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required={form.channel === 'email'}
              placeholder="e.g. Your cocktail order has shipped"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>
        )}

        {/* SMS body or email preview */}
        {form.channel === 'sms' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">SMS Text *</label>
            <textarea
              name="bodyText"
              value={form.bodyText}
              onChange={handleChange}
              required={form.channel === 'sms'}
              rows={4}
              placeholder="Paste the full SMS text here..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Preview Text</label>
              <input
                type="text"
                name="previewText"
                value={form.previewText}
                onChange={handleChange}
                placeholder="Email preview / snippet text"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email HTML Body
                <span className="text-slate-400 font-normal ml-1">(paste source HTML)</span>
              </label>
              <textarea
                name="bodyHtml"
                value={form.bodyHtml}
                onChange={handleChange}
                rows={8}
                placeholder="Paste the raw HTML of the email here..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">
                In Gmail: open email → ⋮ menu → Show original → copy the HTML
              </p>
            </div>
          </>
        )}

        {/* Date & time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time Received *</label>
          <input
            type="datetime-local"
            name="receivedAt"
            value={form.receivedAt}
            onChange={handleChange}
            required
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>

        {/* Campaign type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Type *</label>
          <select
            name="campaignType"
            value={form.campaignType}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            {CAMPAIGN_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Sender email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Sender Email</label>
          <input
            type="email"
            name="senderEmail"
            value={form.senderEmail}
            onChange={handleChange}
            placeholder="noreply@competitor.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="seasonal, new-product, discount (comma separated)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Save Message
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
