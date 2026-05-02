#!/usr/bin/env python3
"""Readiness check for Dip & Sprinkle Facebook Page Marketplace webhook setup.

Prints only configured/missing booleans. Never prints secret values.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "src/data/products.ts"
WEBHOOK_ROUTE = ROOT / "src/app/api/facebook/marketplace/webhook/route.ts"
REPLY_LIB = ROOT / "src/lib/facebookMarketplaceReplies.ts"
DOC = ROOT / "docs/FACEBOOK_MARKETPLACE_REPLIES.md"

REQUIRED_FOR_META_VERIFY = ["FB_MARKETPLACE_VERIFY_TOKEN"]
RECOMMENDED_FOR_PRODUCTION = ["FB_APP_SECRET", "FB_PAGE_ACCESS_TOKEN"]
OPTIONAL_SUNJAE_ESCALATION = ["SUNJAE_TELEGRAM_BOT_TOKEN", "SUNJAE_TELEGRAM_CHAT_ID"]
OPTIONAL_LLM_CLASSIFIER = ["FB_MARKETPLACE_USE_LLM", "OPENAI_API_KEY", "FB_MARKETPLACE_LLM_MODEL"]


def env_status(names: list[str]) -> dict[str, str]:
    return {name: ("configured" if os.environ.get(name) else "missing") for name in names}


def file_status(path: Path) -> dict[str, Any]:
    return {"path": str(path.relative_to(ROOT)), "exists": path.exists(), "bytes": path.stat().st_size if path.exists() else 0}


def product_list_status() -> dict[str, Any]:
    text = PRODUCTS.read_text(encoding="utf-8") if PRODUCTS.exists() else ""
    return {
        "exists": PRODUCTS.exists(),
        "cake_pops_present": "Cake Pops" in text and "1 Dozen (12 pcs)" in text,
        "website_default": os.environ.get("DIPSPRINKLE_WEBSITE_URL", "https://dipsprinkle.com"),
        "source": "src/data/products.ts",
    }


def build_report() -> dict[str, Any]:
    required = env_status(REQUIRED_FOR_META_VERIFY)
    recommended = env_status(RECOMMENDED_FOR_PRODUCTION)
    sunjae = env_status(OPTIONAL_SUNJAE_ESCALATION)
    llm = env_status(OPTIONAL_LLM_CLASSIFIER)
    files = [file_status(path) for path in [PRODUCTS, WEBHOOK_ROUTE, REPLY_LIB, DOC]]
    return {
        "ok": all(value == "configured" for value in required.values()) and all(row["exists"] for row in files),
        "safety": "no_secret_values_printed",
        "required_for_meta_verify": required,
        "recommended_for_live_replies": recommended,
        "optional_sunjae_escalation": sunjae,
        "optional_llm_classifier": llm,
        "product_list": product_list_status(),
        "files": files,
        "webhook_path": "/api/facebook/marketplace/webhook",
        "callback_url_hint": "https://dipsprinkle.com/api/facebook/marketplace/webhook",
    }


def main() -> int:
    print(json.dumps(build_report(), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
