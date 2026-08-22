# Build: customers cannot request orders on blocked days

## Problem
Admin blocks days in `/admin/availability` (table `AvailabilityDate`, statuses `available | limited | fully_booked | closed`).
The customer-facing calendar (`src/app/(site)/components/AvailabilityCalendar.tsx`) is display-only.
The checkout forms (`src/app/(site)/cart/page.tsx`, `src/app/classic/cart/page.tsx`) and the contact form (`src/app/(site)/contact/page.tsx`) use a bare `<input type="date" min=today+3>`.
`src/app/api/request-order/route.ts` writes `customer.neededDate` with no validation.
Result: customers request orders on closed / fully booked days.

## Goal
A customer can NEVER submit an order request for a day whose status is `closed` or `fully_booked`.
Enforced server-side (authoritative) and client-side (UX).
`limited` days stay selectable but show a warning.
Admin-created orders (`src/app/api/admin/orders/route.ts`) are NOT blocked (owner override); leave that route alone.

## Read first
- `CLAUDE.md` (this is Next 16.2 - read `node_modules/next/dist/docs/` for route handler / client component conventions before writing code).
- `prisma/schema.prisma` (`AvailabilityDate`, `Order`).
- `src/app/api/admin/availability/route.ts` (existing admin read shape; reuse the `toDate` convention: dates are `YYYY-MM-DD`, stored as `@db.Date`, constructed with `new Date(\`${input}T00:00:00\`)`).
- `src/app/(site)/components/AvailabilityCalendarClient.tsx` (status labels/colours; keep the customer-facing styling consistent with it).
- both cart pages and the contact page.

## Work

### 1. Shared availability helper - `src/lib/availability.ts`
- `export const BLOCKED_STATUSES = ["closed", "fully_booked"] as const;`
- `export function isBlockedStatus(status): boolean`.
- `export async function getAvailabilityMap(fromISO, toISO): Promise<Record<string, { status, note }>>` - queries `prisma.availabilityDate` for a date range, keys by `YYYY-MM-DD`.
- `export async function assertDateRequestable(dateISO: string): Promise<{ ok: true } | { ok: false; reason: string }>` - validates format `^\d{4}-\d{2}-\d{2}$`, rejects past dates and dates earlier than the existing 3-day minimum lead time (extract the lead-time constant here too, `MIN_LEAD_DAYS = 3`, and use it in the cart pages instead of the inline `Date.now() + 3 * 24 * 60 * 60 * 1000`), and rejects if the status for that day is blocked. Reason strings are customer-facing, e.g. "We're closed on Saturday, September 5 - please pick another day." / "Saturday, September 5 is fully booked - please pick another day." Use `formatLongDate` from `src/lib/orderEmails.ts` if it fits.

### 2. Public read endpoint - `src/app/api/availability/route.ts`
- `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` (defaults: today .. today + 12 months; clamp `to` to at most 18 months out).
- No auth. Returns `{ ok: true, dates: [{ date, status }] }` - do NOT return `note` (internal, may hold private detail) and do not return `id`.
- Only return non-`available` rows (same as what the public calendar shows).
- `Cache-Control: no-store` (admin changes must take effect immediately).

### 3. Server-side enforcement - `src/app/api/request-order/route.ts`
- Before creating the order: if `customer.neededDate` is present, call `assertDateRequestable`. On failure return `400 { ok: false, error: reason }` and send no emails, persist nothing.
- `neededDate` remains optional (existing behaviour): a request with no date still goes through.
- Do it at the top of the handler alongside the existing name/email/cart checks, before the Resend key check.

### 4. Client-side - a shared date picker component `src/app/(site)/components/RequestDatePicker.tsx` (client component)
- Props: `value`, `onChange(value)`, `id`, `required?`, plus an optional `className`/style passthrough so it fits both the v2 site and the classic theme.
- On mount fetch `/api/availability` (today .. +12 months). Keep the native `<input type="date" min=...>` as the control (it is what both pages use today and it is what mobile users get) and add:
  - `min` = today + `MIN_LEAD_DAYS` (computed in local time, not UTC - the existing `toISOString().slice(0,10)` has a timezone bug near midnight; fix it while you are here using the same local `dateKey` approach as `AvailabilityCalendarClient`).
  - On change: if the chosen day is blocked, do not accept it - clear the value, show an inline error under the field ("We're closed that day" / "That day is fully booked - please choose another"), and set `aria-invalid`. If the day is `limited`, accept it and show a soft warning ("Limited availability that day - we'll confirm by email").
  - Render a compact legend/list of upcoming blocked days beneath the input (next 60 days, max ~8 entries, e.g. "Closed: Sep 5, Sep 6 · Booked: Sep 12") so people see the blocks before they pick. Match the pastel styling from `AvailabilityCalendarClient` `statusStyles`.
- Disable the submit button in both cart pages while a blocked date is selected or while the availability fetch is still loading the first time. If the fetch fails, fall back to allowing the input (the server is authoritative) but still apply `min`.
- Use it in: `src/app/(site)/cart/page.tsx`, `src/app/classic/cart/page.tsx` (replace the inline `<input type="date">` and the `minDate` state), and `src/app/(site)/contact/page.tsx` `#date` field (controlled value via local state; the contact form only sets a submitted flag today - do not add a backend for it).
- Cart pages: surface the server's 400 `error` string to the customer (check how the submit handler currently handles non-ok responses and make sure the message from the API is shown, not a generic "something went wrong").

### 5. Tests
- There is no test runner in `package.json`. Add `vitest` as a devDependency with a `test` script, and write unit tests for `src/lib/availability.ts` (`isBlockedStatus`, `assertDateRequestable` with prisma mocked via `vi.mock("@/lib/prisma")`): past date, under-lead-time date, closed, fully_booked, limited (ok), available/unknown (ok), bad format.
- Keep the vitest config minimal (`vitest.config.ts` with the `@/` alias from `tsconfig.json`).

### 6. Verify
- `npm run lint` clean.
- `npm test` green.
- `npx tsc --noEmit` clean.
- `npm run build` succeeds (needs `DATABASE_URL`; if the build fails only on DB connection during prerender, say so explicitly rather than hiding it).
- Manual proof: start `next dev`, POST to `/api/request-order` with a `neededDate` that you first mark closed via prisma (use a small throwaway script in `/tmp` against the dev DB, or `prisma db seed`-style one-off; do NOT commit that script), confirm 400 with the customer-facing reason and that no `Order` row was created. Then the same date as `limited`: 201/200 and a row. Revert the test availability rows afterwards.

## Constraints
- No em dashes in any new copy or code comments - use a plain dash.
- Do not touch `src/app/api/admin/orders/route.ts` or the admin availability UI.
- Do not change the Prisma schema.
- Commit on the current branch with a clear message. Do not add a co-author line.
- Finish with a short report: files changed, what was verified with actual output, anything left undone and why.
