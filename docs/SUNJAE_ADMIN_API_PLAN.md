# Full Admin-Equivalent Sunjae Access Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task after Jack approves. Do not deploy, push, or set production secrets without explicit approval.

**Goal:** Give Sunjae admin-equivalent ability for Dip & Sprinkle through a safer API-backed workflow, so Sunjae can do anything the admin UI can do while still requiring confirmation for writes and stronger confirmation for destructive actions.

**Architecture:** Add a shared admin auth helper that accepts either the existing browser admin session or a revocable `SUNJAE_ADMIN_API_TOKEN` bearer token. Apply that helper to all existing admin API routes. Add an audit log model/table for token-backed admin writes. Add a local Sunjae CLI wrapper that previews every write by default and only executes after explicit approval.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, TypeScript, Python CLI, Railway environment variables.

---

## Requirements

Sunjae should be able to perform any admin-equivalent Dip & Sprinkle operation, including:

- read/list admin data
- create/edit/delete orders
- update order status/details/items/pricing/notes
- upload/manage order images later, if practical
- create/edit/delete expenses
- create/edit/delete inventory items
- increase/decrease/set inventory
- use future admin endpoints as they are added

Safety requirements:

- Reads are allowed.
- Writes require confirmation from the current Sunjae operator.
- Delete/bulk/destructive operations require stronger explicit confirmation, e.g. `Approve delete order #123`.
- Sunjae must ask only for missing required fields.
- Sunjae must show a before/after or payload summary before execution.
- No admin password storage.
- No browser cookie extraction/storage.
- No direct database writes by default.
- Every token-backed write must be logged.
- Token must be revocable by changing `SUNJAE_ADMIN_API_TOKEN` in Railway.

## Current app findings

Existing admin API routes:

- `src/app/api/admin/orders/route.ts`
  - `GET` list orders
  - `POST` create order
- `src/app/api/admin/orders/[id]/route.ts`
  - `PATCH` edit order
  - `DELETE` delete order
- `src/app/api/admin/orders/[id]/images/route.ts`
- `src/app/api/admin/orders/[id]/images/[imageId]/route.ts`
- `src/app/api/admin/expenses/route.ts`
  - `GET` list expenses
  - `POST` create expense
- `src/app/api/admin/expenses/[id]/route.ts`
  - `PATCH` edit expense
  - `DELETE` delete expense
- `src/app/api/admin/inventory/route.ts`
  - `GET` list inventory
  - `POST` create inventory item
- `src/app/api/admin/inventory/[id]/route.ts`
  - `PATCH` edit inventory item
  - `DELETE` delete inventory item
- `src/app/api/admin/inventory/[id]/adjust/route.ts`
  - `POST` adjust quantity
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`

Enums in `prisma/schema.prisma`:

- `OrderStatus`: `pending`, `confirmed`, `deposit_received`, `prepping`, `cake_prepped`, `ready`, `delivered`, `completed`, `cancelled`
- `ExpenseCategory`: `ingredient`, `supply`, `packaging`, `other`
- `OrderSource`: `fb_marketplace`, `tiktok`, `instagram`, `website`
- `InventoryCategory`: `ingredient`, `supply`, `packaging`, `equipment`, `other`

---

## Task 1: Create a feature branch

**Objective:** Keep work isolated until reviewed.

**Files:** none

**Step 1:** Check status.

Run:

```bash
cd /Users/jacma/Documents/projects/luna-rose-sweets
git status --short
```

Expected: only known local files or clean tree.

**Step 2:** Create branch.

Run:

```bash
git switch -c feat/sunjae-admin-api
```

Expected: new branch created.

---

## Task 2: Add admin auth helper

**Objective:** Centralize admin authentication for browser session and Sunjae bearer token.

**Files:**

- Create: `src/lib/adminAuth.ts`

**Implementation:**

Create helper with this shape:

```ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "dip_admin_session";

export type AdminActor = {
  actorType: "browser_admin" | "sunjae_agent";
  actorId: string;
};

function timingSafeEqualString(a: string, b: string) {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

async function verifyBrowserAdmin(req: NextRequest): Promise<AdminActor | null> {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return { actorType: "browser_admin", actorId: "admin-session" };
  } catch {
    return null;
  }
}

function verifySunjaeToken(req: NextRequest): AdminActor | null {
  const expected = process.env.SUNJAE_ADMIN_API_TOKEN;
  if (!expected) return null;
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  if (!timingSafeEqualString(match[1], expected)) return null;
  return { actorType: "sunjae_agent", actorId: "sunjae" };
}

export async function requireAdmin(req: NextRequest): Promise<AdminActor | NextResponse> {
  const tokenActor = verifySunjaeToken(req);
  if (tokenActor) return tokenActor;

  const browserActor = await verifyBrowserAdmin(req);
  if (browserActor) return browserActor;

  return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export function isAuthResponse(value: AdminActor | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
```

**Verification:** TypeScript should compile after later route imports are added.

---

## Task 3: Protect all admin API routes with `requireAdmin`

**Objective:** Ensure API routes are not callable without either valid browser session or Sunjae token.

**Files:**

- Modify all admin data routes listed above except login/logout.

**Implementation pattern:**

At top of each route file:

```ts
import { isAuthResponse, requireAdmin } from "@/lib/adminAuth";
```

At start of each exported handler:

```ts
const actor = await requireAdmin(req);
if (isAuthResponse(actor)) return actor;
```

For handlers currently using `_req`, rename to `req`.

**Important:** Do not require auth for `login` POST or users cannot log in. Logout can remain browser-only or unauthenticated.

**Verification:**

Run:

```bash
npm run lint
npm run build
```

Expected: no auth import/type errors.

---

## Task 4: Add Prisma audit log model

**Objective:** Track every token-backed Sunjae write.

**Files:**

- Modify: `prisma/schema.prisma`
- New migration via Prisma after review.

**Schema:**

```prisma
model AdminAuditLog {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  actorType   String
  actorId     String
  method      String
  path        String
  action      String?
  targetType  String?
  targetId    String?
  requestJson Json?
  responseJson Json?
  ok          Boolean

  @@index([createdAt])
  @@index([actorType])
  @@index([targetType, targetId])
}
```

**Verification:**

Run locally when database config is available:

```bash
npx prisma migrate dev --name add-admin-audit-log
```

For production:

```bash
npx prisma migrate deploy
```

Do not run production migrations without approval.

---

## Task 5: Add audit helper

**Objective:** Make audit logging consistent and non-invasive.

**Files:**

- Modify: `src/lib/adminAuth.ts` or create `src/lib/adminAudit.ts`

**Implementation shape:**

```ts
import { prisma } from "@/lib/prisma";
import type { AdminActor } from "@/lib/adminAuth";

export async function logAdminWrite(input: {
  actor: AdminActor;
  method: string;
  path: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  requestJson?: unknown;
  responseJson?: unknown;
  ok: boolean;
}) {
  if (input.actor.actorType !== "sunjae_agent") return;
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorType: input.actor.actorType,
        actorId: input.actor.actorId,
        method: input.method,
        path: input.path,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        requestJson: input.requestJson as never,
        responseJson: input.responseJson as never,
        ok: input.ok,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log", err);
  }
}
```

**Design decision:** Audit failure should not necessarily block the admin action in Phase 1, but this can be tightened later.

---

## Task 6: Audit write routes

**Objective:** Log Sunjae token-backed writes for create/edit/delete actions.

**Files:**

- Modify write handlers in:
  - `src/app/api/admin/orders/route.ts`
  - `src/app/api/admin/orders/[id]/route.ts`
  - `src/app/api/admin/expenses/route.ts`
  - `src/app/api/admin/expenses/[id]/route.ts`
  - `src/app/api/admin/inventory/route.ts`
  - `src/app/api/admin/inventory/[id]/route.ts`
  - `src/app/api/admin/inventory/[id]/adjust/route.ts`

**Implementation pattern:**

After successful mutation:

```ts
await logAdminWrite({
  actor,
  method: req.method,
  path: req.nextUrl.pathname,
  action: "order.patch",
  targetType: "order",
  targetId: id,
  requestJson: body,
  responseJson: { id },
  ok: true,
});
```

Use action names:

- `order.create`
- `order.patch`
- `order.delete`
- `expense.create`
- `expense.patch`
- `expense.delete`
- `inventory.create`
- `inventory.patch`
- `inventory.delete`
- `inventory.adjust`

---

## Task 7: Create local Sunjae admin client

**Objective:** Provide a safer command-line client for Sunjae instead of raw curl/API calls.

**Files:**

- Create: `scripts/sunjae_admin.py`
- Create/update: `.env.example`

**Behavior:**

- Reads base URL from `DIPSPRINKLE_ADMIN_BASE_URL`, default `https://dipsprinkle.com`.
- Reads token from `SUNJAE_ADMIN_API_TOKEN` or a local untracked env file.
- Supports read/list and write actions.
- Defaults to dry-run for writes.
- Requires `--execute` for writes.
- Requires `--confirm-delete "Approve delete ..."` for deletes.
- Prints payload preview before writes.
- Does not store secrets.

Initial commands:

```bash
scripts/sunjae_admin.py orders list
scripts/sunjae_admin.py orders create --needed-date 2026-05-05 --customer-name "Jane" --customer-email jane@example.com --items-json '[...]' --total-price 72 --status deposit_received --dry-run
scripts/sunjae_admin.py orders patch ORDER_ID --status ready --dry-run
scripts/sunjae_admin.py orders delete ORDER_ID --confirm-delete "Approve delete order ORDER_ID" --execute
scripts/sunjae_admin.py expenses list
scripts/sunjae_admin.py expenses create --date 2026-05-01 --amount 18 --category packaging --vendor Amazon --notes "boxes" --dry-run
scripts/sunjae_admin.py inventory list
scripts/sunjae_admin.py inventory create --name Butter --quantity 10 --unit lbs --category ingredient --dry-run
scripts/sunjae_admin.py inventory adjust ITEM_ID --delta -2 --dry-run
```

---

## Task 8: Add local CLI tests

**Objective:** Test payload building and safety behavior without touching production.

**Files:**

- Create: `scripts/test_sunjae_admin.py`

**Tests:**

- create order rejects missing required fields
- create order builds expected JSON
- expense category validation rejects bad category
- inventory adjust rejects zero delta
- delete refuses without strong confirmation
- dry-run never sends HTTP request

Run:

```bash
python3 scripts/test_sunjae_admin.py
```

Expected: all tests pass.

---

## Task 9: Add docs/runbook

**Objective:** Make safe usage obvious for Sunjae and humans.

**Files:**

- Create: `docs/SUNJAE_ADMIN_API.md`
- Update: `AGENTS.md`
- Update: `/Users/jacma/sunjae-vault/Runbooks/Dip & Sprinkle Admin Operations.md`

Docs must cover:

- what Sunjae can do
- approval requirements
- delete confirmation wording
- env vars
- examples
- rollback/incident handling
- never store token/password in repo/vault/chat

---

## Task 10: Local verification

**Objective:** Ensure repo still builds.

Run:

```bash
cd /Users/jacma/Documents/projects/luna-rose-sweets
npm run lint
npm run build
python3 scripts/test_sunjae_admin.py
```

Expected:

- lint passes
- build passes
- Python tests pass

---

## Task 11: Deployment plan

**Objective:** Roll out safely.

Steps:

1. Commit code on branch.
2. Open PR or review local diff.
3. Generate token locally:

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

4. Set Railway variable:

```text
SUNJAE_ADMIN_API_TOKEN=[REDACTED]
```

5. Deploy after approval.
6. Store token only in Sunjae local env, not repo/vault.
7. Run read-only smoke test:

```bash
scripts/sunjae_admin.py orders list
scripts/sunjae_admin.py expenses list
scripts/sunjae_admin.py inventory list
```

8. Run one controlled write test only after approval, preferably against a harmless test record.

---

## Acceptance criteria

- Sunjae can perform admin-equivalent operations through structured tooling.
- Existing browser admin login still works.
- Existing admin UI still works.
- Token can be revoked by changing one Railway env var.
- Every Sunjae token-backed write creates an audit log row.
- CLI refuses writes without `--execute`.
- CLI refuses deletes without strong confirmation.
- No passwords, tokens, cookies, or secrets are stored in repo/vault/chat.
- Lint/build/tests pass.
