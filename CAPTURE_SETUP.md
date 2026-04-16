# Automated Email Capture Setup

Automatically captures competitor emails from Gmail into Supabase every 30 minutes — no manual work after setup.

## How it works

```
Gmail inbox  →  Google Apps Script (every 30 min)  →  Supabase Edge Function  →  messages table  →  your app
```

1. A dedicated Gmail account subscribes to all competitors
2. Every 30 minutes, Apps Script finds new emails from competitor domains
3. It sends the full email HTML + metadata to the Edge Function
4. The Edge Function identifies the competitor, detects the campaign type, and inserts the row

---

## Step 1 — Supabase: Get your credentials

In your Supabase dashboard:

1. Go to **Project Settings → API**
2. Copy your **Project URL** — looks like `https://abcdefgh.supabase.co`
3. Copy your **Project Reference ID** — the `abcdefgh` part
4. Go to **Project Settings → API → Service Role key** (keep this secret — never put in frontend)

---

## Step 2 — Supabase: Set Edge Function environment variables

In Supabase dashboard → **Project Settings → Edge Functions → Environment Variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Step 1 |
| `WEBHOOK_SECRET` | Any random string you choose (e.g. `ci-secret-x8k2p9`) — save this, you'll need it in Step 4 |

---

## Step 3 — Supabase: Deploy the Edge Function

Install the Supabase CLI if you haven't:
```bash
brew install supabase/tap/supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy the function:
```bash
supabase functions deploy inbound-email
```

Your Edge Function URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/inbound-email
```

---

## Step 4 — Google Apps Script: Set up the Gmail poller

1. Open [script.google.com](https://script.google.com) — sign in with the Gmail account subscribed to competitors
2. Click **New project**
3. Delete the default `myFunction` code
4. Paste the entire contents of `scripts/gmail-capture.js`
5. Click the **gear icon (⚙)** → **Project Settings** → scroll to **Script Properties**
6. Add these two properties:

| Property | Value |
|---|---|
| `EDGE_FUNCTION_URL` | `https://YOUR_PROJECT_REF.supabase.co/functions/v1/inbound-email` |
| `WEBHOOK_SECRET` | The same secret string you set in Step 2 |

7. **Save** the project (Cmd/Ctrl+S)

---

## Step 5 — Run the setup trigger

In Apps Script:

1. Select `setup` from the function dropdown at the top
2. Click **▶ Run**
3. Grant permissions when prompted (needs Gmail read access and URL fetch)
4. You should see: `✓ Trigger created — captureCompetitorEmails will run every 30 minutes`

Then run the first capture manually:

1. Select `captureCompetitorEmails` from the dropdown
2. Click **▶ Run**
3. Open **View → Logs** to see what was captured

---

## Step 6 — Vercel: Add Supabase env vars

In Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your **anon/public** key (NOT service role) |

After adding, **redeploy** (Deployments → Redeploy). The app will then show `● live` in the sidebar and load real data.

---

## What gets captured

Each email stored includes:
- Full HTML body (for the message viewer)
- Plain text body
- Subject line
- Sender name & email
- Timestamp
- Auto-detected campaign type (welcome, promotional, cart abandon, etc.)
- Competitor ID (matched by sender domain)

## Emails that get skipped

Emails from domains not in `COMPETITOR_DOMAINS` are skipped. To add a new competitor:
1. Add the domain to `COMPETITOR_DOMAINS` in both `scripts/gmail-capture.js` and `supabase/functions/inbound-email/index.ts`
2. Redeploy the Edge Function: `supabase functions deploy inbound-email`

## Troubleshooting

**App shows `○ demo` in sidebar** — Vercel env vars not set. See Step 6.

**App shows `● live` but no messages** — Supabase connected but table is empty. Run the Apps Script manually (Step 5).

**Apps Script logs show errors** — Check the `EDGE_FUNCTION_URL` and `WEBHOOK_SECRET` in Script Properties match exactly what's set in Supabase.

**Edge Function returns 401** — The `WEBHOOK_SECRET` in Apps Script doesn't match the one in Supabase Edge Function environment variables.
