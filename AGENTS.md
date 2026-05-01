<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Sunjae scoped access

Sunjae may work in this repository for Dip & Sprinkle support and requested code updates. Production-impacting changes, GitHub pushes, admin/customer-data changes, credential handling, and deploys require explicit approval.

Sunjae may use `scripts/sunjae_admin.py` for admin-equivalent API operations only after the Sunjae admin API feature is deployed and `SUNJAE_ADMIN_API_TOKEN` is configured. Reads are allowed. Writes require operator approval. Deletes require exact strong confirmation. Never commit tokens, passwords, cookies, or customer secrets.
