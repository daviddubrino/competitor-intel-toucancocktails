import { useState, useEffect } from 'react'
import { COMPETITORS, COMPETITOR_MAP } from '../data/competitors'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const isConnected  = !!(SUPABASE_URL && SUPABASE_KEY)

function mapRow(c) {
  return {
    id:      c.id,
    name:    c.name    ?? c.id,
    domain:  c.domain  ?? '',
    website: c.website ?? '',
    color:   c.color   ?? '#6366f1',
    bg:      c.bg_color ?? '#EEF2FF',
  }
}

// Returns { competitors, competitorMap } — always populated (falls back to static list)
export function useCompetitors() {
  const [competitors, setCompetitors] = useState(COMPETITORS)
  const [competitorMap, setCompetitorMap] = useState(COMPETITOR_MAP)

  useEffect(() => {
    if (!isConnected) return

    fetch(`${SUPABASE_URL}/rest/v1/competitors?select=*&order=name.asc`, {
      headers: {
        apikey:        SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })
      .then(r => r.ok ? r.json() : null)
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) return
        // Merge: Supabase rows override static entries for the same ID,
        // but static entries not yet in the DB are kept so the list never shrinks
        const dbMap = Object.fromEntries(rows.map(mapRow).map(c => [c.id, c]))
        const merged = [
          ...rows.map(mapRow),
          ...COMPETITORS.filter(c => !dbMap[c.id]),
        ]
        setCompetitors(merged)
        setCompetitorMap(Object.fromEntries(merged.map(c => [c.id, c])))
      })
      .catch(() => {}) // silently fall back to static list
  }, [])

  return { competitors, competitorMap }
}
