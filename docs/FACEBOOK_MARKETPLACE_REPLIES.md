# Facebook Marketplace AI Replies

Local + webhook decision helper for Dip & Sprinkle cake-pop Marketplace chats.

## Safety boundary

- No Facebook credentials, cookies, scraping, or account login in code/docs.
- Safe auto-replies are limited to website/menu redirects and prices pulled from `src/data/products.ts`.
- The LLM layer is classifier-only: it may classify intent as `price`, `website`, or `needs_human`, but it must never invent prices or free-form customer answers.
- Unknown or low-confidence questions are escalated to Sunjae in Korean for human guidance.
- Live Facebook sending only occurs when `FB_PAGE_ACCESS_TOKEN` is configured locally/in production.
- Sunjae Telegram escalation only sends when `SUNJAE_TELEGRAM_BOT_TOKEN`/`SUNJAE_TELEGRAM_CHAT_ID` are configured locally/in production.

## Personal Marketplace copy/paste bot

For the high-engagement personal Facebook Marketplace channel, use the copy/paste Telegram bot instead of browser automation:

- `docs/FACEBOOK_COPY_PASTE_REPLY_BOT.md`
- `scripts/facebook_copy_paste_copilot.py`
- `scripts/facebook_copy_paste_telegram_bot.py`

It receives copied customer messages in Telegram and returns either one standalone copy/paste customer reply or one Korean follow-up question. It never logs into Facebook or sends Facebook messages.

## Local script

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

## Webhook endpoint

Route:

```text
/api/facebook/marketplace/webhook
```

Meta verification uses:

```text
FB_MARKETPLACE_VERIFY_TOKEN=***
```

Optional request signature validation uses:

```text
FB_APP_SECRET=***
```

Optional live Facebook send uses:

```text
FB_PAGE_ACCESS_TOKEN=***
```

Optional Telegram escalation to Sunjae uses:

```text
SUNJAE_TELEGRAM_BOT_TOKEN=***
SUNJAE_TELEGRAM_CHAT_ID=***
```

Optional classifier-only LLM layer:

```text
FB_MARKETPLACE_USE_LLM=1
OPENAI_API_KEY=***
FB_MARKETPLACE_LLM_MODEL=gpt-4o-mini
```

## Readiness check

Run this before/after you create the Facebook Page app and set env vars:

```bash
scripts/facebook_marketplace_setup_check.py
```

It reports only `configured` / `missing` and never prints token values. It also verifies the product list and webhook files exist.

## Decision strategy

1. Deterministic rules run first for obvious price / website / menu / order-link questions.
2. If deterministic rules are unsure, optional LLM classifier may classify the intent only.
3. If intent is `price`, the reply is generated strictly from the local product list, not from the LLM.
4. If intent is `website`, the reply uses the configured website URL.
5. Everything else becomes a Korean Sunjae escalation.

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
2. Adapter calls `decideMarketplaceReply()`.
3. If `auto_reply`, adapter sends the returned `reply` to the Marketplace chat when `FB_PAGE_ACCESS_TOKEN` is configured; otherwise it logs the local-only decision.
4. If `ask_sunjae`, adapter sends the Korean escalation to Sunjae's Telegram bot when Telegram env vars are configured; otherwise it logs the local-only decision. Escalations include an `Escalation ID` built from the Facebook message ID so the later Sunjae reply bridge can map her answer back to the original customer thread.
5. Sunjae replies in Korean.
6. Follow-up work translates her Korean answer into customer-facing English and sends it back to the Marketplace chat.

## Current limitations

- Webhook receive/verify/decision/live-auto-reply scaffolding exists.
- The return path from Sunjae's Korean Telegram reply back into the original Facebook chat is not built yet.
- Language detection is simple: English, Spanish, Korean.
- Product matching is heuristic and uses the local TypeScript product list.
