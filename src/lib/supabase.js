// Supabase REST API helper — no npm package needed
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConnected = !!(SUPABASE_URL && SUPABASE_KEY)

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

export async function fetchMessages() {
  if (!isSupabaseConnected) return null
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=*&order=received_at.desc`,
      { headers }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function insertMessage(row) {
  if (!isSupabaseConnected) return { success: false }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(row),
    })
    return { success: res.ok }
  } catch {
    return { success: false }
  }
}
