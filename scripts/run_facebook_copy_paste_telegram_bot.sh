#!/usr/bin/env bash
set -euo pipefail

PROFILE_ENV="/Users/jacma/.hermes/profiles/dipsreply/.env"
REPO="/Users/jacma/Documents/projects/luna-rose-sweets"

if [[ -f "$PROFILE_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$PROFILE_ENV"
  set +a
fi

cd "$REPO"
exec python3 scripts/facebook_copy_paste_telegram_bot.py
