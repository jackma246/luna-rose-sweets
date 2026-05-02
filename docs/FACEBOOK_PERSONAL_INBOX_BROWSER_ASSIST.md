# Facebook Personal Inbox Browser Assist

Experimental fallback for personal Facebook Marketplace inboxes where official Page webhooks are unavailable.

## Risk boundary

Browser automation against a personal Facebook account is fragile and may violate Facebook expectations/terms or trigger account checks. Use this only as an experiment.

This helper is deliberately conservative:

- no Facebook password/token/cookie is accepted by the CLI
- uses a local persistent browser profile and manual login
- `draft` mode never opens Facebook
- `extract-visible` requires `--execute`
- `send` is dry-run unless `--execute` and exact confirmation are provided
- selectors are best-effort and can break when Facebook changes UI

## Install optional browser dependency

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

## Open browser for manual login

```bash
scripts/facebook_personal_inbox_assist.py open
```

This opens:

```text
https://www.facebook.com/messages/
```

Login manually in the browser window. The session is stored locally under:

```text
runtime/facebook-personal-browser-profile
```

Do not commit this runtime folder.

## Draft without browser automation

```bash
scripts/facebook_personal_inbox_assist.py draft "How much are cake pops?"
```

This uses the same product-list reply helper and returns JSON with a ready-to-copy reply.

## Best-effort read visible messages

After logging in manually:

```bash
scripts/facebook_personal_inbox_assist.py extract-visible --execute
```

This does not use a Facebook API. It only reads visible DOM text from the currently accessible messages UI.

## Send to current open conversation

Dry-run first:

```bash
scripts/facebook_personal_inbox_assist.py send "Hi! You can order here: https://dipsprinkle.com" \
  --confirm-send "Approve send Facebook reply"
```

Actual browser send, only after the correct conversation is open in the browser profile:

```bash
scripts/facebook_personal_inbox_assist.py send "Hi! You can order here: https://dipsprinkle.com" \
  --confirm-send "Approve send Facebook reply" \
  --execute
```

## Recommended operating mode

Use this as assisted mode first:

1. Sunjae opens Facebook manually.
2. She copies a customer message.
3. Run `draft` or paste into Sunjae Telegram helper.
4. Copy the generated answer back into Facebook manually.

Only use `send --execute` after confirming the active conversation is correct.
