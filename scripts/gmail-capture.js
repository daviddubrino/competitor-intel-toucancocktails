// ============================================================
// Gmail Capture Script — Google Apps Script
// Polls your Gmail inbox for competitor emails every 30 min,
// extracts the full HTML, and sends them to your Supabase
// Edge Function for storage.
//
// SETUP:
// 1. Go to script.google.com → New project
// 2. Paste this entire file
// 3. Click the gear icon → Project Settings → Script Properties
// 4. Add these two properties:
//      EDGE_FUNCTION_URL  →  https://YOUR_PROJECT_REF.supabase.co/functions/v1/inbound-email
//      WEBHOOK_SECRET     →  (any random string you choose — must match Supabase env var)
// 5. Run "setup()" once to create the 30-minute trigger
// 6. Run "captureCompetitorEmails()" manually first to test
// ============================================================

// ── Configuration ─────────────────────────────────────────────────────────────
// These are read from Script Properties (set in step 3 above — never hardcode secrets)
function getConfig() {
  const props = PropertiesService.getScriptProperties()
  return {
    edgeFunctionUrl: props.getProperty('EDGE_FUNCTION_URL'),
    webhookSecret:   props.getProperty('WEBHOOK_SECRET'),
  }
}

// Label applied to emails after they've been captured (prevents duplicates)
const CAPTURED_LABEL_NAME = 'CompetitorIntel/Captured'

// ── Competitor domains to watch ───────────────────────────────────────────────
// Root domains only — subdomains are matched automatically by the Gmail search
// using root domain matching. The Edge Function handles final competitor
// identification as a catch-all.
const COMPETITOR_DOMAINS = [
  // Spirits & Liquor Brands
  'absolut.com',
  'bacardi.com',
  'beefeatergin.com',
  'captainmorgan.com',
  'casamigos.com',
  'cazadores.com',
  'deepeddyvodka.com',
  'donjulio.com',
  'greenhookgin.com',
  'hornitostequila.com',
  'jackdaniels.com',
  'jamesonwhiskey.com',
  'jeffersonsbourbon.com',
  'jimbeam.com',
  'josecuervo.com',
  'ketelone.com',
  'maliburumdrinks.com',
  'smirnoff.com',
  'tanqueray.com',
  // RTD Cocktail & Canned Drink Brands
  'austincocktails.com',
  'beatboxbeverages.com',
  'bettybooze.com',
  'boozboxcocktails.com',
  'buzzballz.com',
  'canteenspirits.com',
  'cantinacocktails.com',
  'caymanjack.com',
  'cocktailsquad.com',
  'crafthousecocktails.com',
  'cutwaterspirits.com',
  'delolalife.com',
  'diococktails.com',
  'dogfish.com',
  'driftercocktails.com',
  'filemonade.com',
  'fivedrinks.co',
  'handyandschiller.com',
  'heritagedistilling.com',
  'highnoonspirits.com',
  'juneshine.com',
  'loneriverbevco.com',
  'thelongdrink.com',
  'drinkloverboy.com',
  'loyal9cocktails.com',
  'lyres.com',
  'drinkmamitas.com',
  'mericanmule.com',
  'missioncocktails.com',
  'monacococktails.com',
  'mothdrinks.com',
  'nutrlvodka.com',
  'drinkonda.com',
  'otrcocktails.com',
  'postmeridiemspirits.com',
  'saltpointcocktails.com',
  'smirnoff.com',
  'socialsparklingwine.com',
  'spritzsociety.com',
  'straightawaycocktails.com',
  'sundaysfinest.com',
  'drinksuperbird.com',
  'tailscocktails.com',
  'thomasashbourne.com',
  'tiptopcocktails.com',
  'twochickscocktails.com',
  'drinkviacarota.com',
  'drinkvervet.com',
  'wanderingbarman.com',
  'whiteclaw.com',
  'youandyours.com',
  'drinkslowandlow.com',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOrCreateLabel(name) {
  const existing = GmailApp.getUserLabels()
  for (const label of existing) {
    if (label.getName() === name) return label
  }
  return GmailApp.createLabel(name)
}

function extractEmailAddress(fromHeader) {
  // "First Last <email@domain.com>" → "email@domain.com"
  const match = fromHeader.match(/<([^>]+)>/)
  return match ? match[1].trim().toLowerCase() : fromHeader.trim().toLowerCase()
}

function extractDisplayName(fromHeader) {
  // "First Last <email@domain.com>" → "First Last"
  const match = fromHeader.match(/^(.+?)\s*</)
  return match ? match[1].trim().replace(/^"|"$/g, '') : fromHeader.split('@')[0]
}

// ── Main capture function ─────────────────────────────────────────────────────
function captureCompetitorEmails() {
  const { edgeFunctionUrl, webhookSecret } = getConfig()

  if (!edgeFunctionUrl || !webhookSecret) {
    console.error('Missing EDGE_FUNCTION_URL or WEBHOOK_SECRET in Script Properties')
    return
  }

  const capturedLabel = getOrCreateLabel(CAPTURED_LABEL_NAME)

  // Build Gmail search query — use root domains (no @ prefix) so subdomains
  // like email.tiptopcocktails.com, email.otrcocktails.com, etc. are all matched
  const rootDomains = [...new Set(COMPETITOR_DOMAINS.map(d => d.split('.').slice(-2).join('.')))]
  const domainClauses = rootDomains.map(d => `from:${d}`).join(' OR ')
  const query = `(${domainClauses}) -label:${CAPTURED_LABEL_NAME}`

  const threads = GmailApp.search(query, 0, 100) // Process up to 100 threads per run

  let captured = 0
  let skipped = 0
  let errors = 0

  for (const thread of threads) {
    for (const message of thread.getMessages()) {
      const fromHeader  = message.getFrom()
      const fromEmail   = extractEmailAddress(fromHeader)
      const fromName    = extractDisplayName(fromHeader)
      const subject     = message.getSubject()
      const bodyHtml    = message.getBody()          // Full HTML
      const bodyText    = message.getPlainBody()     // Plain text fallback
      const receivedAt  = message.getDate().toISOString()

      const payload = JSON.stringify({
        from_email:  fromEmail,
        from_name:   fromName,
        subject:     subject,
        body_html:   bodyHtml,
        body_text:   bodyText,
        received_at: receivedAt,
      })

      try {
        const response = UrlFetchApp.fetch(edgeFunctionUrl, {
          method:           'post',
          contentType:      'application/json',
          headers:          { 'x-webhook-secret': webhookSecret },
          payload:          payload,
          muteHttpExceptions: true,
        })

        const code = response.getResponseCode()
        const body = JSON.parse(response.getContentText() || '{}')

        if (code === 200) {
          if (body.skipped) {
            // Edge Function intentionally skipped (unknown competitor)
            skipped++
          } else {
            console.log(`✓ Captured: [${body.competitor}] "${subject}" → ${body.campaignType}`)
            captured++
          }
        } else {
          console.error(`✗ Failed (${code}): "${subject}" — ${response.getContentText()}`)
          errors++
          continue // Don't label as captured — will retry next run
        }
      } catch (e) {
        console.error(`✗ Error sending "${subject}": ${e.message}`)
        errors++
        continue
      }
    }

    // Label the whole thread as captured (prevents duplicate processing)
    thread.addLabel(capturedLabel)
  }

  const summary = `Run complete — ${captured} captured, ${skipped} skipped (unknown competitor), ${errors} errors`
  console.log(summary)
}

// ── Setup trigger (run once) ──────────────────────────────────────────────────
function setup() {
  // Remove any existing triggers for this function to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'captureCompetitorEmails') {
      ScriptApp.deleteTrigger(trigger)
    }
  }

  // Create a new time-based trigger — every 30 minutes
  ScriptApp.newTrigger('captureCompetitorEmails')
    .timeBased()
    .everyMinutes(30)
    .create()

  console.log('✓ Trigger created — captureCompetitorEmails will run every 30 minutes')
  console.log('Run captureCompetitorEmails() manually now to process existing emails')
}

// ── Teardown (run to remove the trigger if you want to pause) ────────────────
function teardown() {
  const triggers = ScriptApp.getProjectTriggers()
  let removed = 0
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'captureCompetitorEmails') {
      ScriptApp.deleteTrigger(trigger)
      removed++
    }
  }
  console.log(`Removed ${removed} trigger(s)`)
}
