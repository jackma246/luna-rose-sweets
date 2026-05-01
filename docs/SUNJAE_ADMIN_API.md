# Sunjae Admin API

Sunjae can be given admin-equivalent API access for Dip & Sprinkle through a revocable bearer token.

This is intended to replace brittle browser automation for admin work while preserving safety:

- reads are allowed
- writes require operator confirmation
- deletes require exact strong confirmation
- no admin passwords or browser cookies are stored
- token-backed writes are audit logged in `AdminAuditLog`

## Environment variables

Production/Railway:

```text
SUNJAE_ADMIN_API_TOKEN=[REDACTED]
```

Local Sunjae shell/profile environment:

```text
DIPSPRINKLE_ADMIN_BASE_URL=https://dipsprinkle.com
SUNJAE_ADMIN_API_TOKEN=[REDACTED]
```

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

Delete requires exact confirmation:

```bash
scripts/sunjae_admin.py orders delete ORDER_ID \
  --confirm-delete "Approve delete order ORDER_ID" \
  --execute
```

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

4. Set `SUNJAE_ADMIN_API_TOKEN` in Railway.
5. Put the same token only into Sunjae's private env, not repo/vault/chat.
6. Deploy after approval.
7. Run read-only smoke tests first.
8. Run one controlled write after approval.

## Revocation

Rotate or remove `SUNJAE_ADMIN_API_TOKEN` in Railway.
