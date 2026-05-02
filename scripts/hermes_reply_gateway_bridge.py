#!/usr/bin/env python3
"""Bridge Hermes gateway messages into the deterministic copy/paste reply state.

This is for the LLM-backed `dipsreply` Hermes profile. The profile can call this
script as a guardrail/state engine, then return only the selected text to Yun.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import facebook_copy_paste_telegram_bot as bot


def main() -> int:
    parser = argparse.ArgumentParser(description="Process one Yun reply-bot message and return outgoing text JSON.")
    parser.add_argument("message", help="Exact Telegram message from Yun")
    parser.add_argument("--chat-key", default="yun", help="Stable key for Yun's private reply bot chat")
    parser.add_argument("--state-path", type=Path, default=bot.DEFAULT_STATE_PATH)
    args = parser.parse_args()

    state = bot.load_state(args.state_path)
    outgoing = bot.build_outgoing_messages(args.message, args.chat_key, state)  # type: ignore[arg-type]
    bot.save_state(args.state_path, state)
    print(json.dumps({"outgoing_messages": outgoing}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
