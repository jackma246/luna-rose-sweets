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
import shlex
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
        return {"pending": {}, "threads": {}}
    state = json.loads(path.read_text(encoding="utf-8"))
    state.setdefault("pending", {})
    state.setdefault("threads", {})
    state.setdefault("active_threads", {})
    return state


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


def conversation_context_for(thread: dict[str, Any], *, max_turns: int = 6) -> str:
    turns = thread.get("turns", [])[-max_turns:]
    lines: list[str] = []
    product_context = thread.get("product_context") or []
    if product_context:
        lines.append("상품 맥락: " + ", ".join(product_context[:5]))
    for turn in turns:
        role = turn.get("role", "message")
        text = str(turn.get("text", "")).strip()
        if text:
            label = {"customer": "고객", "bot_reply": "이전 답장", "operator": "운영자"}.get(role, role)
            lines.append(f"{label}: {text}")
    return "\n".join(lines)


def remember_turn(thread: dict[str, Any], role: str, text: str) -> None:
    turns = thread.setdefault("turns", [])
    turns.append({"role": role, "text": text})
    del turns[:-10]


def product_context_from_payload(payload: dict[str, Any], fallback_text: str = "") -> list[str]:
    names: list[str] = []
    for product in payload.get("matched_products", []) or []:
        name = product.get("name")
        if name and name not in names:
            names.append(name)
    if not names and "Cake Pops" in fallback_text:
        names.append("Cake Pops")
    return names


def is_reset_command(text: str) -> bool:
    return text.strip().lower() in {"/new", "/reset", "new customer", "새 고객"}


def parse_thread_command(text: str) -> tuple[str, str] | None:
    stripped = text.strip()
    if not stripped.lower().startswith("/thread "):
        # Korean low-friction shortcut: "마리아: customer message".
        # This is easier for Yun than slash commands and works for English,
        # Spanish, or Korean customer messages.
        if ":" in stripped and not stripped.startswith("http"):
            name, message = stripped.split(":", 1)
            name = name.strip()
            message = message.strip()
            if name and message and len(name) <= 40 and " " not in name:
                return name.lower(), message
        return None
    try:
        parts = shlex.split(stripped)
    except ValueError:
        parts = stripped.split(maxsplit=2)
    if len(parts) < 3:
        return None
    return parts[1].strip().lower(), parts[2].strip()


def parse_finish_command(text: str) -> str | None:
    stripped = text.strip()
    lower = stripped.lower()
    if lower.startswith("/thread-finish "):
        return stripped.split(maxsplit=1)[1].strip().lower()
    if lower.startswith("/finish "):
        return stripped.split(maxsplit=1)[1].strip().lower()
    if stripped.startswith("끝 "):
        return stripped.split(maxsplit=1)[1].strip().lower()
    if stripped.endswith(" 끝"):
        return stripped.rsplit(maxsplit=1)[0].strip().lower()
    return None


def parse_change_command(text: str) -> str | None:
    stripped = text.strip()
    lower = stripped.lower()
    if lower.startswith("change "):
        return stripped[len("change ") :].strip()
    if lower.startswith("/change "):
        return stripped[len("/change ") :].strip()
    for prefix in ("수정 ", "바꿔줘 ", "고쳐줘 ", "다시 "):
        if stripped.startswith(prefix):
            return stripped[len(prefix) :].strip()
    return None


def chat_threads(state: dict[str, Any], key: str) -> dict[str, Any]:
    threads = state.setdefault("threads", {})
    current = threads.setdefault(key, {})
    # Legacy migration: old state stored {turns, product_context} directly under
    # chat id. Move it under a default thread name only when needed.
    if "turns" in current:
        threads[key] = {"default": {"customer_name": "default", **current}}
        current = threads[key]
    return current


def active_thread_name(state: dict[str, Any], key: str) -> str:
    return state.setdefault("active_threads", {}).get(key, "default")


def get_thread(state: dict[str, Any], key: str, name: str | None = None) -> dict[str, Any]:
    thread_name = (name or active_thread_name(state, key)).lower()
    threads = chat_threads(state, key)
    return threads.setdefault(thread_name, {"customer_name": thread_name, "turns": [], "product_context": []})


def last_bot_reply(thread: dict[str, Any]) -> str:
    for turn in reversed(thread.get("turns", [])):
        if turn.get("role") == "bot_reply":
            return str(turn.get("text", ""))
    return ""


def revise_reply(previous_reply: str, instruction: str) -> str:
    reply = previous_reply.strip()
    if not reply:
        return "수정할 이전 답장이 없어요. 고객 메시지를 다시 보내주세요."
    lower = instruction.lower()
    if any(word in lower for word in ["warmer", "friendly", "nice"]) or any(word in instruction for word in ["따뜻", "친절", "부드럽"]):
        if "😊" not in reply:
            reply += " 😊"
    if "pickup" in lower or "픽업" in instruction:
        if "pickup" not in reply.lower():
            reply += " Pickup is available depending on the date/time."
    if "website" in lower or "link" in lower or "dipsprinkle" in lower:
        if "dipsprinkle.com" not in reply:
            reply += " You can also order here: https://dipsprinkle.com"
    return reply


def process_payload_for_thread(text: str, thread: dict[str, Any], *, thread_name: str) -> tuple[list[str], dict[str, Any]]:
    remember_turn(thread, "customer", text)
    payload = copilot.build_copilot_response(text, conversation_context=conversation_context_for(thread))
    outgoing = [message["text"] for message in payload["telegram_messages"]]
    for response_text in outgoing:
        remember_turn(thread, "bot_reply", response_text)
    products = product_context_from_payload(payload, outgoing[0] if outgoing else "")
    if products:
        existing = thread.setdefault("product_context", [])
        for product in products:
            if product not in existing:
                existing.append(product)
    payload["thread_name"] = thread_name
    return outgoing, payload


def build_outgoing_messages(text: str, chat_id: int, state: dict[str, Any]) -> list[str]:
    pending = state.setdefault("pending", {})
    state.setdefault("threads", {})
    active_threads = state.setdefault("active_threads", {})
    key = str(chat_id)

    finish_name = parse_finish_command(text)
    if finish_name:
        chat_threads(state, key).pop(finish_name, None)
        if active_threads.get(key) == finish_name:
            active_threads.pop(key, None)
        if pending.get(key, {}).get("thread_name") == finish_name:
            pending.pop(key, None)
        return [f"{finish_name} 대화를 종료하고 저장된 맥락을 삭제했어요."]

    if is_reset_command(text):
        pending.pop(key, None)
        state["threads"].pop(key, None)
        active_threads.pop(key, None)
        return ["새 고객 대화를 시작했어요. 고객 메시지를 복사해서 보내주세요."]

    thread_command = parse_thread_command(text)
    if thread_command:
        thread_name, customer_text = thread_command
        active_threads[key] = thread_name
        thread = get_thread(state, key, thread_name)
        outgoing, payload = process_payload_for_thread(customer_text, thread, thread_name=thread_name)
        if payload["status"] == "needs_operator_answer":
            pending[key] = {
                "thread_name": thread_name,
                "customer_message": customer_text,
                "customer_language": payload["customer_language"],
                "escalation_id": payload.get("escalation_id"),
            }
        return outgoing

    change_instruction = parse_change_command(text)
    if change_instruction:
        thread_name = active_thread_name(state, key)
        thread = get_thread(state, key, thread_name)
        revised = revise_reply(last_bot_reply(thread), change_instruction)
        remember_turn(thread, "operator", text)
        remember_turn(thread, "bot_reply", revised)
        return [revised]

    if key in pending:
        context = pending.pop(key)
        thread_name = context.get("thread_name") or active_thread_name(state, key)
        active_threads[key] = thread_name
        thread = get_thread(state, key, thread_name)
        payload = copilot.build_operator_answer_response(
            customer_message=context["customer_message"],
            operator_answer_ko=text,
            customer_language=context["customer_language"],
        )
        remember_turn(thread, "operator", text)
        outgoing = [message["text"] for message in payload["telegram_messages"]]
        for response_text in outgoing:
            remember_turn(thread, "bot_reply", response_text)
        return outgoing

    thread_name = active_thread_name(state, key)
    thread = get_thread(state, key, thread_name)
    outgoing, payload = process_payload_for_thread(text, thread, thread_name=thread_name)
    if payload["status"] == "needs_operator_answer":
        pending[key] = {
            "thread_name": thread_name,
            "customer_message": text,
            "customer_language": payload["customer_language"],
            "escalation_id": payload.get("escalation_id"),
        }
    return outgoing


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
