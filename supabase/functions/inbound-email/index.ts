// ============================================================
// Supabase Edge Function — inbound-email
// Catch-all: every email is stored. Known senders get a
// competitor_id; unknown senders get competitor_id=null
// and their domain stored in tags for later mapping.
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ── Domain → competitor_id ────────────────────────────────────────────────────
// Root domain AND common sending subdomains listed for each competitor.
// The catch-all means you don't need to list every subdomain up front —
// unknown ones will still be stored and tagged with their domain.
const DOMAIN_MAP: Record<string, string> = {
  // Absolut
  "absolut.com": "absolut", "email.absolut.com": "absolut",
  // Bacardí
  "bacardi.com": "bacardi", "email.bacardi.com": "bacardi",
  // Beefeater Gin
  "beefeatergin.com": "beefeater", "email.beefeatergin.com": "beefeater",
  // Captain Morgan
  "captainmorgan.com": "captainmorgan", "email.captainmorgan.com": "captainmorgan",
  // Casamigos
  "casamigos.com": "casamigos", "email.casamigos.com": "casamigos",
  // Cazadores
  "cazadores.com": "cazadores", "email.cazadores.com": "cazadores",
  // Deep Eddy Vodka
  "deepeddyvodka.com": "deepeddy", "email.deepeddyvodka.com": "deepeddy",
  // Don Julio
  "donjulio.com": "donjulio", "email.donjulio.com": "donjulio",
  // Greenhook Gin
  "greenhookgin.com": "greenhook", "email.greenhookgin.com": "greenhook",
  // Hornitos Tequila
  "hornitostequila.com": "hornitos", "email.hornitostequila.com": "hornitos",
  // Jack Daniel's
  "jackdaniels.com": "jackdaniels", "email.jackdaniels.com": "jackdaniels",
  // Jameson
  "jamesonwhiskey.com": "jameson", "email.jamesonwhiskey.com": "jameson",
  // Jefferson's Bourbon
  "jeffersonsbourbon.com": "jeffersons", "email.jeffersonsbourbon.com": "jeffersons",
  // Jim Beam
  "jimbeam.com": "jimbeam", "email.jimbeam.com": "jimbeam",
  // José Cuervo
  "josecuervo.com": "josecuervo", "email.josecuervo.com": "josecuervo",
  // Ketel One
  "ketelone.com": "ketelone", "email.ketelone.com": "ketelone",
  // Malibu
  "maliburumdrinks.com": "malibu", "email.maliburumdrinks.com": "malibu",
  // Smirnoff
  "smirnoff.com": "smirnoff", "email.smirnoff.com": "smirnoff",
  // Tanqueray
  "tanqueray.com": "tanqueray", "email.tanqueray.com": "tanqueray",
  // Austin Cocktails
  "austincocktails.com": "austin", "email.austincocktails.com": "austin",
  // BeatBox Beverages
  "beatboxbeverages.com": "beatbox", "email.beatboxbeverages.com": "beatbox",
  // Betty Booze
  "bettybooze.com": "bettybooze", "email.bettybooze.com": "bettybooze",
  // Booz Box Cocktails
  "boozboxcocktails.com": "boozbox", "email.boozboxcocktails.com": "boozbox",
  // BuzzBallz
  "buzzballz.com": "buzzballz", "email.buzzballz.com": "buzzballz",
  // Canteen Spirits
  "canteenspirits.com": "canteen", "email.canteenspirits.com": "canteen",
  // Cantina Cocktails
  "cantinacocktails.com": "cantina", "email.cantinacocktails.com": "cantina",
  // Cayman Jack
  "caymanjack.com": "caymanjack", "email.caymanjack.com": "caymanjack",
  // Cocktail Squad
  "cocktailsquad.com": "cocktailsquad", "email.cocktailsquad.com": "cocktailsquad",
  // Crafthouse Cocktails
  "crafthousecocktails.com": "crafthouse", "email.crafthousecocktails.com": "crafthouse",
  // Cutwater Spirits
  "cutwaterspirits.com": "cutwater", "email.cutwaterspirits.com": "cutwater",
  // Delola
  "delolalife.com": "delola", "email.delolalife.com": "delola",
  // Dio Cocktails
  "diococktails.com": "dio", "email.diococktails.com": "dio",
  // Dogfish Head
  "dogfish.com": "dogfish", "email.dogfish.com": "dogfish",
  // Drifter Cocktails
  "driftercocktails.com": "drifter", "email.driftercocktails.com": "drifter",
  // Filé Monade
  "filemonade.com": "filemonade", "email.filemonade.com": "filemonade",
  // Five Drinks
  "fivedrinks.co": "fivedrinks", "email.fivedrinks.co": "fivedrinks",
  // Handy & Schiller
  "handyandschiller.com": "handyschiller", "email.handyandschiller.com": "handyschiller",
  // Heritage Distilling
  "heritagedistilling.com": "heritage", "email.heritagedistilling.com": "heritage",
  // High Noon
  "highnoonspirits.com": "highnoon", "email.highnoonspirits.com": "highnoon",
  // JuneShine
  "juneshine.com": "juneshine", "email.juneshine.com": "juneshine",
  // Lone River
  "loneriverbevco.com": "loneriver", "email.loneriverbevco.com": "loneriver",
  // The Long Drink
  "thelongdrink.com": "longdrink", "email.thelongdrink.com": "longdrink",
  // Loverboy
  "drinkloverboy.com": "loverboy", "email.drinkloverboy.com": "loverboy",
  // Loyal 9 Cocktails
  "loyal9cocktails.com": "loyal9", "email.loyal9cocktails.com": "loyal9",
  // Lyre's
  "lyres.com": "lyres", "email.lyres.com": "lyres",
  // Mamitas
  "drinkmamitas.com": "mamitas", "email.drinkmamitas.com": "mamitas",
  // 'Merican Mule
  "mericanmule.com": "mericanmule", "email.mericanmule.com": "mericanmule",
  // Mission Cocktails
  "missioncocktails.com": "mission", "email.missioncocktails.com": "mission",
  // Monaco Cocktails
  "monacococktails.com": "monaco", "email.monacococktails.com": "monaco",
  // MOTH Drinks
  "mothdrinks.com": "moth", "email.mothdrinks.com": "moth",
  // NUTRL Vodka
  "nutrlvodka.com": "nutrl", "email.nutrlvodka.com": "nutrl",
  // Onda
  "drinkonda.com": "onda", "email.drinkonda.com": "onda",
  // OTR Cocktails
  "otrcocktails.com": "otr", "email.otrcocktails.com": "otr",
  // Post Meridiem
  "postmeridiemspirits.com": "postmeridiem", "email.postmeridiemspirits.com": "postmeridiem",
  // Salt Point Cocktails
  "saltpointcocktails.com": "saltpoint", "email.saltpointcocktails.com": "saltpoint",
  // Slow & Low
  "drinkslowandlow.com": "slowandlow", "email.drinkslowandlow.com": "slowandlow",
  // Social Sparkling Wine
  "socialsparklingwine.com": "social", "email.socialsparklingwine.com": "social",
  // Spritz Society
  "spritzsociety.com": "spritzsociety", "email.spritzsociety.com": "spritzsociety",
  // Straightaway Cocktails
  "straightawaycocktails.com": "straightaway", "email.straightawaycocktails.com": "straightaway",
  // Sunday's Finest
  "sundaysfinest.com": "sundaysfinest", "email.sundaysfinest.com": "sundaysfinest",
  // Superbird
  "drinksuperbird.com": "superbird", "email.drinksuperbird.com": "superbird",
  // Tails Cocktails
  "tailscocktails.com": "tails", "email.tailscocktails.com": "tails",
  // Thomas Ashbourne
  "thomasashbourne.com": "ashbourne", "email.thomasashbourne.com": "ashbourne",
  // Tip Top Cocktails
  "tiptopcocktails.com": "tiptop", "email.tiptopcocktails.com": "tiptop",
  // Two Chicks Cocktails
  "twochickscocktails.com": "twochicks", "email.twochickscocktails.com": "twochicks",
  // Via Carota
  "drinkviacarota.com": "viacarota", "email.drinkviacarota.com": "viacarota",
  // Vervet
  "drinkvervet.com": "vervet", "email.drinkvervet.com": "vervet",
  // Wandering Barman
  "wanderingbarman.com": "wanderingbarman", "email.wanderingbarman.com": "wanderingbarman",
  // White Claw
  "whiteclaw.com": "whiteclaw", "email.whiteclaw.com": "whiteclaw",
  // You & Yours
  "youandyours.com": "youandyours", "email.youandyours.com": "youandyours",
}

// ── Root-domain fallback lookup ───────────────────────────────────────────────
// e.g. "email.tiptopcocktails.com" → root "tiptopcocktails.com" → "tiptop"
function lookupCompetitor(emailDomain: string): string | null {
  if (DOMAIN_MAP[emailDomain]) return DOMAIN_MAP[emailDomain]
  // Try matching root domain (last two parts)
  const parts = emailDomain.split(".")
  if (parts.length > 2) {
    const root = parts.slice(-2).join(".")
    if (DOMAIN_MAP[root]) return DOMAIN_MAP[root]
    // Handle .net / three-part TLDs
    const rootAlt = parts.slice(-3).join(".")
    if (DOMAIN_MAP[rootAlt]) return DOMAIN_MAP[rootAlt]
  }
  return null
}

// ── Campaign type detection ───────────────────────────────────────────────────
function detectCampaignType(subject: string, bodyText: string): string {
  const t = (subject + " " + bodyText).toLowerCase()
  if (/welcome|thank you for (joining|signing|registering)|account (created|confirmed|activated)|get started|you're in/.test(t)) return "welcome"
  if (/\d+%\s*off|\$\d+\s*off|save\s+\$|discount|promo code|deal|special offer|limited.?time|flash sale|today only|expires/.test(t)) return "promotional"
  if (/left (behind|your cart|without)|still (there|waiting)|complete your|finish your|abandoned|didn.t finish|pick up where/.test(t)) return "cart_abandon"
  if (/miss(ing)? you|we haven.t (seen|heard)|come back|it.s been a while|re-engage|still with us|been a minute/.test(t)) return "reengagement"
  if (/guide|how to|learn|tips|what you need to know|did you know|educational|science behind|research/.test(t)) return "educational"
  if (/order (confirmed|shipped|delivered)|tracking (number|update)|invoice|receipt|confirmation #|payment/.test(t)) return "transactional"
  return "nurture"
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

  const secret = req.headers.get("x-webhook-secret")
  if (!secret || secret !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 })
  }

  let payload: {
    from_email?: string; from_name?: string; subject?: string
    body_html?: string;  body_text?: string; received_at?: string
  }
  try { payload = await req.json() }
  catch { return new Response("Invalid JSON", { status: 400 }) }

  const { from_email = "", from_name = "", subject = "", body_html = "", body_text = "", received_at } = payload

  const emailDomain = (from_email.split("@")[1] ?? "").toLowerCase()
  const competitorId = lookupCompetitor(emailDomain) // null = unknown sender

  const campaignType = detectCampaignType(subject, body_text)

  // Compute day_of_week and hour_of_day (Eastern time)
  const receivedDate = received_at ? new Date(received_at) : new Date()
  const easternStr = receivedDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  const easternDate = new Date(easternStr)
  const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayOfWeek = DOW_NAMES[easternDate.getDay()]
  const hourOfDay = easternDate.getHours()

  // Always tag with the sending domain so unknown senders are identifiable
  const tags: string[] = [`domain:${emailDomain}`]
  if (!competitorId) tags.push("unmatched")

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  const { error } = await supabase.from("messages").insert({
    competitor_id: competitorId,   // null for unknown senders
    channel:       "email",
    subject:       subject || null,
    preview_text:  body_text.slice(0, 250) || null,
    sender_name:   from_name || null,
    sender_email:  from_email || null,
    body_html:     body_html || null,
    body_text:     body_text || null,
    received_at:   received_at ?? new Date().toISOString(),
    day_of_week:   dayOfWeek,
    hour_of_day:   hourOfDay,
    campaign_type: campaignType,
    tags,
  })

  if (error) {
    console.error("Insert error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log(`Captured: [${competitorId ?? "unknown:" + emailDomain}] "${subject}" → ${campaignType}`)
  return new Response(JSON.stringify({ ok: true, competitor: competitorId, campaignType }), { status: 200 })
})
