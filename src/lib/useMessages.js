import { useState, useEffect } from 'react'
import { MOCK_MESSAGES } from '../data/mockData'

// ── Supabase config (optional — app works without these) ──────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isSupabaseConnected = !!(SUPABASE_URL && SUPABASE_KEY)

// ── In-memory store for locally added messages ────────────────────────────────
let localMessages = [...MOCK_MESSAGES]

// ── Safe date helper — never throws, never returns Invalid Date ───────────────
function safeIso(val) {
  if (!val) return new Date().toISOString()
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

// ── Map a Supabase row to the shape the UI expects ────────────────────────────
function mapRow(m) {
  return {
    id:            String(m.id ?? `sb-${Math.random()}`),
    competitorId:  m.competitor_id  ?? 'unknown',
    channel:       m.channel === 'sms' ? 'sms' : 'email',
    subject:       m.subject        ?? '',
    previewText:   m.preview_text   ?? null,
    senderName:    m.sender_name    ?? null,
    senderEmail:   m.sender_email   ?? null,
    bodyHtml:      m.body_html      ?? null,
    bodyText:      m.body_text      ?? null,
    receivedAt:    safeIso(m.received_at),
    campaignType:  m.campaign_type  ?? 'promotional',
    tags:          Array.isArray(m.tags) ? m.tags : [],
  }
}

// ── Fetch from Supabase ───────────────────────────────────────────────────────
// Returns:
//   mapped rows array (possibly empty []) — fetch succeeded
//   null                                  — fetch failed (network/auth error)
async function fetchLiveMessages() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=*&order=received_at.desc`,
      {
        headers: {
          apikey:        SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    if (!res.ok) return null          // auth error, table missing, etc.
    const data = await res.json()
    if (!Array.isArray(data)) return null
    return data.map(mapRow)           // [] is valid — table is just empty
  } catch {
    return null
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMessages() {
  // Start with mock data (instant render, no blank screen)
  // If Supabase is configured, swap in live data (even if empty)
  const [messages, setMessages] = useState(localMessages)
  const [source, setSource]     = useState('mock')    // 'mock' | 'live'
  const [loading, setLoading]   = useState(isSupabaseConnected)

  useEffect(() => {
    if (!isSupabaseConnected) return

    fetchLiveMessages().then(rows => {
      setLoading(false)
      if (rows === null) return        // fetch failed — keep mock data as fallback
      setMessages(rows)               // could be [] — that's a valid empty state
      setSource('live')
    })
  }, [])

  return { messages, loading, source }
}

// ── Save a message (Supabase if connected, in-memory otherwise) ───────────────
export async function saveMessage(form) {
  const row = {
    competitor_id: form.competitorId,
    channel:       form.channel,
    subject:       form.subject       || null,
    preview_text:  form.previewText   || null,
    sender_name:   form.senderName    || null,
    sender_email:  form.senderEmail   || null,
    body_html:     form.bodyHtml      || null,
    body_text:     form.bodyText      || null,
    received_at:   safeIso(form.receivedAt),
    campaign_type: form.campaignType,
    tags:          form.tags
                     ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
                     : [],
  }

  if (isSupabaseConnected) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method:  'POST',
        headers: {
          apikey:         SUPABASE_KEY,
          Authorization:  `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer:         'return=minimal',
        },
        body: JSON.stringify(row),
      })
      if (res.ok) return { success: true }
    } catch {
      // fall through to in-memory
    }
  }

  // In-memory fallback
  const newMsg = { ...mapRow({ ...row, id: `local-${Date.now()}` }) }
  localMessages = [newMsg, ...localMessages]
  return { success: true }
}
