// Mock data — connect Supabase and run the Gmail capture script to start populating real data.

export const MOCK_MESSAGES = []

export function getMessagesForCompetitor(competitorId) {
  return MOCK_MESSAGES.filter(m => m.competitorId === competitorId)
}

export function getAllStats() {
  const total       = MOCK_MESSAGES.length
  const emails      = MOCK_MESSAGES.filter(m => m.channel === 'email').length
  const sms         = MOCK_MESSAGES.filter(m => m.channel === 'sms').length
  const competitors = new Set(MOCK_MESSAGES.map(m => m.competitorId)).size
  return { total, emails, sms, competitors }
}
