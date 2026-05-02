#!/usr/bin/env python3
"""Telegram long-polling bot for Dip & Sprinkle copy/paste replies.

Requires a Telegram bot token in local/deployment env. This bot never connects to
Facebook. It only receives copied customer text from Telegram and returns either
one standalone copy/paste customer reply or one Korean follow-up question.
"""
from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import facebook_copy_paste_copilot as copilot

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_STATE_PATH = ROOT / "runtime/facebook-copy-paste-bot/state.json"


class TelegramBotError(RuntimeError):
    pass


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"pending": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(path: Path, state: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def allowed_user_ids_from_env(value: str | None) -> set[int]:
    if not value:
        return set()
    ids: set[int] = set()
    for item in value.split(","):
        item = item.strip()
        if item:
            ids.add(int(item))
    return ids


def build_outgoing_messages(text: str, chat_id: int, state: dict[str, Any]) -> list[str]:
    pending = state.setdefault("pending", {})
    key = str(chat_id)
    if key in pending:
        context = pending.pop(key)
        payload = copilot.build_operator_answer_response(
            customer_message=context["customer_message"],
            operator_answer_ko=text,
            customer_language=context["customer_language"],
        )
    else:
        payload = copilot.build_copilot_response(text)
        if payload["status"] == "needs_operator_answer":
            pending[key] = {
                "customer_message": text,
                "customer_language": payload["customer_language"],
                "escalation_id": payload.get("escalation_id"),
            }
    return [message["text"] for message in payload["telegram_messages"]]


def telegram_request(token: str, method: str, data: dict[str, Any] | None = None, timeout: int = 60) -> dict[str, Any]:
    url = f"https://api.telegram.org/bot{token}/{method}"
    encoded = urllib.parse.urlencode(data or {}).encode("utf-8")
    request = urllib.request.Request(url, data=encoded if data is not None else None)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise TelegramBotError(f"Telegram API HTTP {exc.code}: {body}") from exc
    if not payload.get("ok"):
        raise TelegramBotError(f"Telegram API error: {payload}")
    return payload


def send_message(token: str, chat_id: int, text: str) -> None:
    telegram_request(token, "sendMessage", {"chat_id": chat_id, "text": text})


def poll_updates(token: str, offset: int | None) -> dict[str, Any]:
    data: dict[str, Any] = {"timeout": 50, "allowed_updates": json.dumps(["message"])}
    if offset is not None:
        data["offset"] = offset
    return telegram_request(token, "getUpdates", data, timeout=65)


def run_bot(token: str, *, state_path: Path, allowed_user_ids: set[int]) -> None:
    state = load_state(state_path)
    offset: int | None = None
    while True:
        payload = poll_updates(token, offset)
        for update in payload.get("result", []):
            offset = int(update["update_id"]) + 1
            message = update.get("message") or {}
            text = (message.get("text") or "").strip()
            chat = message.get("chat") or {}
            user = message.get("from") or {}
            chat_id = chat.get("id")
            user_id = user.get("id")
            if not text or chat_id is None:
                continue
            if allowed_user_ids and user_id not in allowed_user_ids:
                continue
            outgoing = build_outgoing_messages(text, int(chat_id), state)
            save_state(state_path, state)
            for response_text in outgoing:
                send_message(token, int(chat_id), response_text)
        time.sleep(0.2)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Dip & Sprinkle copy/paste reply Telegram bot.")
    parser.add_argument("--state-path", type=Path, default=DEFAULT_STATE_PATH)
    args = parser.parse_args(argv)
    token = os.environ.get("DIPSPRINKLE_REPLY_BOT_TOKEN") or os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit("DIPSPRINKLE_REPLY_BOT_TOKEN is not configured")
    allowed = allowed_user_ids_from_env(os.environ.get("DIPSPRINKLE_REPLY_BOT_ALLOWED_USERS"))
    run_bot(token, state_path=args.state_path, allowed_user_ids=allowed)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
