#!/usr/bin/env python3
"""Experimental browser-assist helper for a personal Facebook inbox.

This is intentionally conservative:
- no Facebook password/token/cookie is accepted on the CLI
- uses a local persistent browser profile for manual login
- draft mode never opens Facebook
- send mode is dry-run unless --execute and exact confirmation are supplied
- selector automation is best-effort and may break when Facebook changes UI
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import facebook_marketplace_replies as replies  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PROFILE_DIR = ROOT / "runtime/facebook-personal-browser-profile"
DEFAULT_FACEBOOK_INBOX_URL = "https://www.facebook.com/messages/"
EXACT_SEND_CONFIRMATION = "Approve send Facebook reply"


def die(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(2)


def playwright_sync_api():
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
    except Exception as exc:  # pragma: no cover - depends on local optional package
        die(f"Playwright is not installed or browsers are missing: {exc}. Run: python3 -m pip install playwright && python3 -m playwright install chromium")
    return sync_playwright


def launch_browser(profile_dir: Path, url: str = DEFAULT_FACEBOOK_INBOX_URL, headless: bool = False) -> dict[str, Any]:
    sync_playwright = playwright_sync_api()
    profile_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(str(profile_dir), headless=headless)
        page = context.pages[0] if context.pages else context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        # Keep the browser open for manual login/use. In non-headless mode this
        # blocks until the user closes the browser window.
        if not headless:
            try:
                page.wait_for_event("close", timeout=0)
            except Exception:
                pass
        context.close()
    return {"launched": True, "url": url}


def extract_visible_messages(profile_dir: Path, url: str = DEFAULT_FACEBOOK_INBOX_URL, limit: int = 30, headless: bool = False) -> dict[str, Any]:
    sync_playwright = playwright_sync_api()
    profile_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(str(profile_dir), headless=headless)
        page = context.pages[0] if context.pages else context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        page.wait_for_timeout(3_000)
        texts = page.locator("div[role='row'], div[role='gridcell'], div[dir='auto']").all_inner_texts()
        context.close()
    cleaned: list[str] = []
    seen: set[str] = set()
    for text in texts:
        line = " ".join(text.split())
        if not line or line in seen:
            continue
        seen.add(line)
        cleaned.append(line)
    return {"ok": True, "mode": "extract-visible", "messages": cleaned[:limit], "source": "visible_browser_dom_best_effort"}


def send_reply(text: str, profile_dir: Path, execute: bool, headless: bool = False) -> dict[str, Any]:
    if not execute:
        return {"ok": True, "mode": "send", "dryRun": True, "text": text, "safety": "dry_run_no_facebook_send"}
    sync_playwright = playwright_sync_api()
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(str(profile_dir), headless=headless)
        page = context.pages[0] if context.pages else context.new_page()
        # Operator must already have the target conversation open in this profile.
        textbox = page.locator("div[role='textbox'][contenteditable='true']").last
        textbox.fill(text)
        page.keyboard.press("Enter")
        context.close()
    return {"ok": True, "mode": "send", "dryRun": False, "safety": "browser_automation_sent_to_current_open_conversation"}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Experimental personal Facebook inbox browser-assist helper.")
    sub = parser.add_subparsers(dest="command", required=True)

    draft = sub.add_parser("draft", help="Draft a safe reply from a pasted customer message; no browser use.")
    draft.add_argument("message")
    draft.add_argument("--sender", default="")
    draft.add_argument("--listing-title", default="")

    open_cmd = sub.add_parser("open", help="Open Facebook messages with a local persistent browser profile for manual login/use.")
    open_cmd.add_argument("--profile-dir", type=Path, default=DEFAULT_PROFILE_DIR)
    open_cmd.add_argument("--url", default=DEFAULT_FACEBOOK_INBOX_URL)
    open_cmd.add_argument("--headless", action="store_true")

    extract = sub.add_parser("extract-visible", help="Best-effort extract visible text from manually logged-in inbox. Requires --execute.")
    extract.add_argument("--profile-dir", type=Path, default=DEFAULT_PROFILE_DIR)
    extract.add_argument("--url", default=DEFAULT_FACEBOOK_INBOX_URL)
    extract.add_argument("--limit", type=int, default=30)
    extract.add_argument("--headless", action="store_true")
    extract.add_argument("--execute", action="store_true")

    send = sub.add_parser("send", help="Dry-run or send text to currently open Facebook conversation.")
    send.add_argument("text")
    send.add_argument("--profile-dir", type=Path, default=DEFAULT_PROFILE_DIR)
    send.add_argument("--confirm-send")
    send.add_argument("--execute", action="store_true")
    send.add_argument("--headless", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.command == "draft":
        decision = replies.decide_reply(args.message, sender=args.sender, listing_title=args.listing_title, escalation_path=None)
        print(json.dumps({"ok": True, "mode": "draft", "decision": decision, "safety": "manual_copy_paste_no_facebook_send"}, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    if args.command == "open":
        result = launch_browser(args.profile_dir, args.url, args.headless)
        print(json.dumps({"ok": True, "mode": "open", "profile_dir": str(args.profile_dir), "manual_login_required": True, **result}, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    if args.command == "extract-visible":
        if not args.execute:
            die("extract-visible requires --execute because it opens a logged-in browser profile")
        result = extract_visible_messages(args.profile_dir, args.url, args.limit, args.headless)
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    if args.command == "send":
        if args.confirm_send != EXACT_SEND_CONFIRMATION:
            die(f"send requires exact confirmation: {EXACT_SEND_CONFIRMATION!r}")
        result = send_reply(args.text, args.profile_dir, args.execute, args.headless)
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    raise AssertionError(args.command)


if __name__ == "__main__":
    raise SystemExit(main())
