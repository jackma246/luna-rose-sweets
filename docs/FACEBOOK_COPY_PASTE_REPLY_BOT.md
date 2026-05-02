# Facebook Personal Marketplace Copy/Paste Reply Bot

This is the safe personal-Marketplace lane for Dip & Sprinkle.

It does **not** log into Facebook, read Facebook, click Facebook, or send Facebook messages. The human operator copies a customer message from personal Facebook Marketplace into this Telegram bot. The bot returns either:

1. a single standalone customer reply that can be copied/pasted back into Facebook, or
2. a Korean follow-up question for the operator when the answer is not safe to infer.

Customer-facing replies are always sent as their own Telegram message with no preface, label, or explanation.

## Why this exists

Personal Facebook Marketplace currently performs much better than the business/Page account. This bot preserves that demand while avoiding personal-account browser automation risk.

## Behavior

### Safe price question

Operator sends:

```text
How much are cake pops?
```

Bot sends one standalone copy/paste message:

```text
Hi! Current pricing is:
- Cake Pops — 1 Dozen (12 pcs): $40
You can see more options or order here: https://dipsprinkle.com
```

### Safe website/menu question

Bot returns the website/menu link in the customer's language:

```text
https://dipsprinkle.com
```

### Unknown/custom question

Operator sends:

```text
Can you make these gluten free and deliver tomorrow morning?
```

Bot asks the operator in Korean:

```text
아래 고객 질문은 자동 답변하지 않는 게 안전해요.
고객에게 보낼 답을 한국어로 알려주세요. 제가 고객 언어로 복사/붙여넣기용 답장을 따로 만들게요.
...
```

Operator replies in Korean. The bot then sends one standalone copy/paste customer reply.

### Multi-turn context

The bot keeps lightweight per-Telegram-chat context in:

```text
runtime/facebook-copy-paste-bot/state.json
```

It remembers the recent copied customer turns, bot replies, operator Korean answers, and product context such as `Cake Pops`. This lets a later pasted message like:

```text
Can I get 2 dozen for tomorrow morning?
```

be evaluated with the prior thread context instead of as an isolated message. If the answer depends on availability, timing, delivery, pickup, allergy, or customization, the bot asks the operator in Korean and includes the previous conversation summary.

Use `/new` when starting a different customer conversation so context does not leak across customers:

```text
/new
```

For Phase 1 there is one active copied Facebook thread per operator Telegram chat. If she needs to handle several Facebook customers in parallel, the next upgrade should add explicit thread labels like `/thread maria` or `/thread order12`.

## Local scripts

Decision layer:

```bash
python3 scripts/facebook_copy_paste_copilot.py "How much are cake pops?"
```

Long-polling Telegram bot:

```bash
# Reads local secrets from /Users/jacma/.hermes/profiles/dipsreply/.env
scripts/run_facebook_copy_paste_telegram_bot.sh
```

Direct form:

```bash
DIPSPRINKLE_REPLY_BOT_TOKEN=*** \
DIPSPRINKLE_REPLY_BOT_ALLOWED_USERS=*** \
python3 scripts/facebook_copy_paste_telegram_bot.py
```

Do not put tokens in chat, docs, git, or the vault. Put them only in local/deployment environment files. A local template exists at `/Users/jacma/.hermes/profiles/dipsreply/.env.template`; copy it to `.env`, fill values locally, and `chmod 600` it.

## Required Telegram setup

1. In Telegram, open `@BotFather`.
2. Run `/newbot`.
3. Name suggestion: `Dip Sprinkle Reply Copilot`.
4. Username suggestion: `dip_sprinkle_reply_bot` or similar.
5. Copy the bot token into local env only as:

```bash
DIPSPRINKLE_REPLY_BOT_TOKEN=***
```

6. Add the operator Telegram user ID allowlist as:

```bash
DIPSPRINKLE_REPLY_BOT_ALLOWED_USERS=***
```

For the current operating policy, this allowlist should contain **Sunjae's Telegram user ID only**. The token/user ID must not be committed.

## Safety boundary

Allowed:

- Receive copied customer text in Telegram.
- Return exact copy/paste customer replies.
- Ask Korean follow-up questions to the operator.
- Use `src/data/products.ts` as product/price source of truth.
- Use `https://dipsprinkle.com` as website/order destination.

Not allowed:

- Facebook login automation.
- Personal inbox scraping.
- Browser clicking/typing/sending.
- Hallucinated prices or product facts.
- Answering allergy, delivery, availability, custom design, or policy questions without operator input.

## Test command

```bash
python3 -m unittest \
  scripts.test_facebook_copy_paste_copilot \
  scripts.test_facebook_copy_paste_telegram_bot \
  -v
```
