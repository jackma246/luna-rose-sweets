# Facebook Marketplace AI Replies

Local decision helper for Dip & Sprinkle cake-pop Marketplace chats.

## Safety boundary

- Local-only decision engine for now.
- No Facebook credentials, cookies, scraping, or account login.
- No automatic customer send until a Facebook/Messenger webhook adapter is explicitly configured and approved.
- Safe auto-replies are limited to website/menu redirects and prices pulled from `src/data/products.ts`.
- Any other question is escalated to Sunjae in Korean for human guidance.

## Script

```bash
scripts/facebook_marketplace_replies.py "How much are cake pops?" --no-write
```

Outputs JSON with one of two actions:

- `auto_reply`: safe to send immediately.
- `ask_sunjae`: append/send the Korean Sunjae escalation message and wait for Sunjae's Korean answer.

Escalations are written to:

```text
runtime/facebook-marketplace/escalations.jsonl
```

## Examples

Price question:

```bash
scripts/facebook_marketplace_replies.py "Hi, how much are cake pops?" --no-write
```

Website question in Spanish:

```bash
scripts/facebook_marketplace_replies.py "Hola, tienes página web?" --no-write
```

Unknown question requiring Sunjae:

```bash
scripts/facebook_marketplace_replies.py \
  "Can you make these gluten free and deliver tomorrow morning?" \
  --sender Maria \
  --listing-title "Cake pops ad #12"
```

## Intended live flow

1. Facebook/Messenger webhook receives a Marketplace message.
2. Adapter calls `decide_reply()`.
3. If `auto_reply`, adapter sends the returned `reply` to the Marketplace chat.
4. If `ask_sunjae`, adapter sends `sunjae_message_ko` to Sunjae's Telegram bot and stores the escalation row.
5. Sunjae replies in Korean.
6. Sunjae/Jarvis translates her answer into customer-facing English and sends it back to the Marketplace chat.

## Current limitations

- Current implementation is the local decision/escalation layer, not the Facebook webhook adapter.
- Language detection is intentionally simple: English, Spanish, Korean.
- Product matching is heuristic and uses the local TypeScript product list.
- For live Facebook sending, we still need approved Meta webhook/page-message credentials or an approved compliant integration path.
