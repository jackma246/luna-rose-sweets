# Dip & Sprinkle — operations guide

Everything you need to run the site, manage orders, and track expenses.

---

## Architecture at a glance

| Piece | What it does | Where it lives |
|---|---|---|
| Public site | Customer-facing storefront | `src/app/(site)/*`, `src/app/classic/*` |
| Order request API | Writes orders to DB + sends 2 emails | `src/app/api/request-order/route.ts` |
| Admin dashboard | Owner-only orders + expenses management | `src/app/admin/*` |
| Admin APIs | CRUD for orders + expenses | `src/app/api/admin/*` |
| Cron reminders | Daily email reminders for upcoming orders | `src/app/api/cron/reminders/route.ts` |
| Database | Postgres (Railway-hosted) | Schema in `prisma/schema.prisma` |
| Email | Resend via `orders@dipsprinkle.com` | `request-order/route.ts`, `cron/reminders/route.ts` |

---

## Environment variables

All live on Railway → web service → **Variables** tab. Local dev copies go in `.env.local` (gitignored).

| Variable | Purpose | Example / notes |
|---|---|---|
| `DATABASE_URL` | Postgres connection | Reference `${{Postgres.DATABASE_URL}}` on Railway |
| `RESEND_API_KEY` | Email sending | `re_...` from resend.com |
| `ADMIN_PASSWORD` | Admin dashboard login | Any strong password |
| `ADMIN_SESSION_SECRET` | Signs login cookies (optional) | Random string; falls back to `ADMIN_PASSWORD` if unset |
| `CRON_SECRET` | Bearer token for cron endpoint | Random string |
| `NEXT_PUBLIC_URL` | Base URL in emails | `https://dipsprinkle.com` |
| `TZ` | Timezone for dates in emails (optional) | `America/Los_Angeles` |

---

## Admin dashboard URLs

All under `https://dipsprinkle.com`. Gated by `ADMIN_PASSWORD` login.

| Path | What it does |
|---|---|
| `/admin/login` | Sign in with password |
| `/admin` | Orders dashboard — grouped into Due this week / Later / Recently completed |
| `/admin/orders/new` | Manually add an order (for backfilling historical orders) |
| `/admin/orders/[id]` | Order detail — change status, edit internal notes, edit date, view items, delete |
| `/admin/expenses` | Expense log — monthly total + category breakdown |
| `/admin/expenses/new` | Log a new expense (ingredient / supply / packaging / other) |
| `/admin/expenses/[id]` | Edit or delete an expense |

Session lasts **14 days** before re-login required.

---

## API endpoints

### Public

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/request-order` | Called by the cart form. Writes order to DB, sends two emails (customer confirmation + support notification). |

**Request body:**
```json
{
  "items": [{"name": "Cake Pops", "variantLabel": "Dozen", "quantity": 1, "price": 42}],
  "totalPrice": 42,
  "customer": {
    "name": "...",
    "email": "...",
    "phone": "...(optional)",
    "neededDate": "2026-05-10 (optional, YYYY-MM-DD)",
    "message": "...(optional)"
  }
}
```

### Admin (auth required via session cookie)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/admin/login` | Sign in. Body: `{"password": "..."}`. Sets cookie. |
| `POST` | `/api/admin/logout` | Sign out. Clears cookie. |
| `POST` | `/api/admin/orders` | Create order (used by `/admin/orders/new` form) |
| `PATCH` | `/api/admin/orders/[id]` | Update status / notes / date / customer info |
| `DELETE` | `/api/admin/orders/[id]` | Permanently delete order |
| `POST` | `/api/admin/expenses` | Create expense |
| `PATCH` | `/api/admin/expenses/[id]` | Update expense |
| `DELETE` | `/api/admin/expenses/[id]` | Delete expense |

### Cron (bearer-token protected)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/cron/reminders` | Sends email reminders for orders at D-3, D-2, D-1, D-0. Idempotent per-window. |

**Auth header:** `Authorization: Bearer $CRON_SECRET`

---

## Order status flow

```
pending → confirmed → deposit_received → prepping → cake_prepped → ready → delivered → completed
                                                                                         ↑
                                                                                   (or cancelled from anywhere)
```

Change by opening an order in `/admin/orders/[id]` and selecting from the status dropdown. Saves automatically.

**Meanings:**
- **Pending** — customer just submitted, you haven't replied yet
- **Confirmed** — you replied, customer agreed to move forward
- **Deposit received** — partial payment received via Venmo/Zelle
- **Prepping** — actively baking / assembling
- **Cake prepped** — base is done, still needs finishing (decoration, box, etc.)
- **Ready** — fully done, boxed, waiting for pickup/delivery
- **Delivered** — handed off to customer
- **Completed** — final payment received, fully done
- **Cancelled** — order will not be fulfilled

---

## Common workflows

### New order came in (automatic flow)
1. Customer submits cart form on public site
2. Two emails fire: one to customer (confirmation), one to `supportdipsprinkle@gmail.com` (notification)
3. Order appears in `/admin` as **Pending**
4. You review, reply to customer via email (Reply-To is pre-wired), update status to **Confirmed** when they agree

### Backfilling a historical order
1. Go to `/admin` → **+ New**
2. Fill in customer info, add items (name, variant, qty, unit price), set date, pick current status
3. Save — order enters the system like any other

### Logging an expense
1. `/admin/expenses` → **+ New**
2. Date, amount, vendor (Costco / Amazon / etc.), category (ingredient / supply / packaging / other), optional notes
3. Save — shows up in the monthly total and category breakdown immediately

### Marking an order progress through the stages
1. Open `/admin/orders/[id]`
2. Use the **Status** dropdown — saves on change
3. Use **Internal notes** for your own working memo (e.g., "Costco run needed Sat", "delivery scheduled 6pm") — saves when you tap away

### Rotating the admin password
1. Change `ADMIN_PASSWORD` on Railway
2. If `ADMIN_SESSION_SECRET` isn't set separately, this also invalidates existing sessions (you'll need to log back in)
3. Redeploy triggers automatically on env change

### Rotating the Resend API key
1. Resend dashboard → API Keys → revoke old, generate new
2. Update `RESEND_API_KEY` on Railway → auto-redeploy

### Rotating the cron secret
1. Change `CRON_SECRET` on Railway web service
2. Cron service uses `${{luna-rose-sweets.CRON_SECRET}}` so it picks up automatically on its next run

---

## Cron reminders

**When it runs:** daily at `0 16 * * *` UTC (9 AM PST / 8 AM PDT).

**What it does:** Finds active (non-completed, non-cancelled) orders whose `neededDate` is 3, 2, 1, or 0 days away and whose reminder for that window hasn't fired yet. Sends a single digest email per window to support listing all matching orders. Marks each order's `remindersSent` so it doesn't double-fire.

**Manually trigger (from laptop):**
```bash
curl -fsS -H "Authorization: Bearer <CRON_SECRET>" https://dipsprinkle.com/api/cron/reminders
```
Response: `{"ok":true,"summary":{"d3":0,"d2":0,"d1":0,"d0":0}}` — numbers are orders matched per window.

**Manually trigger (from Railway):** go to `cron-reminders` service → **Deploy Now**.

---

## Deployment (Railway)

**How it deploys:**
- Push to `main` → GitHub webhook → Railway builds with Railpack
- Build command: `prisma generate && next build`
- Start command: `prisma migrate deploy && next start` (applies any new Prisma migrations before serving traffic)

**Adding a new schema change:**
1. Edit `prisma/schema.prisma`
2. Run locally: `npx prisma migrate dev --name <descriptive-name>`
   - This creates a new migration file in `prisma/migrations/<timestamp>_<name>/migration.sql`
   - Applies it to your local DB
3. Commit both schema + migration file
4. Push → Railway applies on next deploy

**Never edit an existing migration file that's been deployed** — create a new migration instead.

---

## Local development

```bash
# 1. Fill in .env.local with values from Railway
# 2. Install deps
npm install
# 3. Apply any pending migrations to your local DB
npx prisma migrate deploy
# 4. Run
npm run dev
```

Open `http://localhost:3000` (public) or `http://localhost:3000/admin/login` (admin).

**Inspect the DB directly:**
```bash
npx prisma studio
```
Opens a browser GUI at `localhost:5555` for editing rows by hand.

---

## Email sender setup

- **Domain:** `dipsprinkle.com` verified in Resend (MX + SPF + DKIM + DMARC via Namecheap DNS)
- **From:** `Dip & Sprinkle <orders@dipsprinkle.com>`
- **Reply-To routing:**
  - Customer confirmation email → replies go to `supportdipsprinkle@gmail.com`
  - Support notification email → replies go to the customer (so hitting reply in Gmail emails them directly)

**Inbound email** (someone emailing `orders@dipsprinkle.com` fresh, not as a reply): currently drops on the floor. Reply-To covers 95%+ of cases; add ImprovMX forwarding if this becomes an issue.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Admin login always says "incorrect password" | `ADMIN_PASSWORD` not set or mismatched between local/Railway | Check env var on both sides |
| Order submission returns 500 | `RESEND_API_KEY` missing, or DB unreachable | Check Railway logs; verify env vars |
| Order in DB but no email sent | Resend domain unverified, or rate-limited | Check Resend dashboard → Logs |
| Cron returns 401 | Wrong `CRON_SECRET` or missing Authorization header | Confirm bearer value matches web service env |
| Cron returns `{"ok":true}` but no email received | No orders in the D-3..D-0 windows (expected), OR already fired for today | Check `remindersSent` on an order in `/admin/orders/[id]` |
| Build fails with "secret ID missing" | Malformed Railway env variable reference | Open **Raw Editor** on Variables tab, remove empty/broken entries |
| Migration fails on deploy | Drift between schema and DB | `npx prisma migrate status` to diagnose; may need a manual migration |

---

## Contacts

- **Resend dashboard:** resend.com (login: whatever email the account uses)
- **Railway dashboard:** railway.com
- **Domain registrar (Namecheap):** namecheap.com
- **Support inbox:** `supportdipsprinkle@gmail.com`
