# Sunjae Admin API

Sunjae can be given admin-equivalent API access for Dip & Sprinkle through a revocable bearer token.

This is intended to replace brittle browser automation for admin work while preserving safety:

- reads are allowed
- writes require operator confirmation
- deletes require exact strong confirmation
- no admin passwords or browser cookies are stored
- every admin write is audit logged in `AdminAuditLog`, from Sunjae's token and from the owner's browser session alike (`actorType` `sunjae_agent` or `browser_admin`)
- audit rows never store customer PII: names, emails, phones, notes/messages and image data are replaced with `[redacted]` before the request/response body is saved
- an optional read-only token can be issued for day-to-day lookups, so the write-capable token does not need to be on hand

## Environment variables

Production/Railway:

```text
SUNJAE_ADMIN_API_TOKEN=[REDACTED]
# optional, read-only (GET only; any write with it gets HTTP 403)
SUNJAE_ADMIN_API_READ_TOKEN=[REDACTED]
```

Local Sunjae shell/profile environment:

```text
DIPSPRINKLE_ADMIN_BASE_URL=https://dipsprinkle.com
SUNJAE_ADMIN_API_READ_TOKEN=[REDACTED]
# only when writes are needed
SUNJAE_ADMIN_API_TOKEN=[REDACTED]
```

Token scopes:

| Token | Allowed methods | Audit `actorId` |
|---|---|---|
| `SUNJAE_ADMIN_API_TOKEN` | all (reads, writes, deletes with confirmation) | `sunjae` |
| `SUNJAE_ADMIN_API_READ_TOKEN` | `GET` / `HEAD` only | `sunjae-read` |

The client uses the read-only token for reads whenever it is set and falls back to the full token.
Writes always use `SUNJAE_ADMIN_API_TOKEN`, so a shell that only has the read-only token cannot write.
Both tokens must be different, long random values.

Do not commit token values.

## Client

Script:

```bash
scripts/sunjae_admin.py
```

Dry-run is the default for writes.

Examples:

```bash
scripts/sunjae_admin.py orders list
scripts/sunjae_admin.py orders images list ORDER_ID
scripts/sunjae_admin.py expenses list
scripts/sunjae_admin.py inventory list
```

Create expense dry-run:

```bash
scripts/sunjae_admin.py expenses create \
  --date 2026-05-01 \
  --amount 18 \
  --category packaging \
  --vendor Amazon \
  --notes "boxes"
```

Execute after approval:

```bash
scripts/sunjae_admin.py expenses create \
  --date 2026-05-01 \
  --amount 18 \
  --category packaging \
  --vendor Amazon \
  --notes "boxes" \
  --execute
```

Attach order images after the operator clearly requests it and provides local image paths:

```bash
# dry-run preview
scripts/sunjae_admin.py orders images upload ORDER_ID /path/to/image.png

# execute after clear Korean or English operator request
scripts/sunjae_admin.py orders images upload ORDER_ID /path/to/image.png --execute
```

Image limits are enforced before upload:

- max 10 MB per file
- jpeg, png, webp, gif, heic, or heif
- backend max 20 images per order

Delete an order image requires exact confirmation:

```bash
scripts/sunjae_admin.py orders images delete ORDER_ID IMAGE_ID \
  --confirm-delete "Approve delete order image IMAGE_ID" \
  --execute
```

Delete requires exact confirmation:

```bash
scripts/sunjae_admin.py orders delete ORDER_ID \
  --confirm-delete "Approve delete order ORDER_ID" \
  --execute
```

## Facebook Marketplace reply helper

Local decision script:

```bash
scripts/facebook_marketplace_replies.py "How much are cake pops?" --no-write
```

See `docs/FACEBOOK_MARKETPLACE_REPLIES.md`.

## Approval policy

Sunjae must ask before every write.

Sunjae should show:

- operation
- target record if known
- before/after summary when editing
- exact payload or meaningful field summary

Destructive actions require stronger approval using the exact wording printed by the CLI.

## Deployment

1. Review branch diff.
2. Run:

```bash
npm run lint
npm run build
python3 scripts/test_sunjae_admin.py
```

3. Generate a token locally:

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

4. Set `SUNJAE_ADMIN_API_TOKEN` (and optionally `SUNJAE_ADMIN_API_READ_TOKEN`, generated separately) in Railway.
5. Put the same token(s) only into Sunjae's private env, not repo/vault/chat.
6. Deploy after approval.
7. Run read-only smoke tests first.
8. Run one controlled write after approval.

## Revocation

Rotate or remove `SUNJAE_ADMIN_API_TOKEN` and/or `SUNJAE_ADMIN_API_READ_TOKEN` in Railway.
Each token can be revoked independently.
