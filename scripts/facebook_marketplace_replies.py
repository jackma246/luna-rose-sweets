#!/usr/bin/env python3
"""Local Facebook Marketplace reply decision helper for Dip & Sprinkle.

This module is intentionally side-effect-light: it decides whether a customer
message is safe to answer immediately from the local product list or should be
escalated to Sunjae. It does not call Facebook, Telegram, or any paid model by
itself. A later webhook/adapter can use this decision object to send the reply.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PRODUCTS_PATH = ROOT / "src/data/products.ts"
DEFAULT_ESCALATION_PATH = ROOT / "runtime/facebook-marketplace/escalations.jsonl"
DEFAULT_WEBSITE_URL = "https://dipsprinkle.com"

PRICE_WORDS = {
    "en": ("price", "prices", "cost", "how much", "$", "rate", "rates"),
    "es": ("precio", "precios", "cuánto", "cuanto", "cuesta", "costo", "vale"),
    "ko": ("가격", "얼마", "비용", "금액"),
}
WEBSITE_WORDS = {
    "en": ("website", "web site", "site", "link", "order online", "menu", "catalog"),
    "es": ("página", "pagina", "sitio", "website", "link", "enlace", "catálogo", "catalogo", "pedido"),
    "ko": ("웹사이트", "사이트", "링크", "주문", "메뉴"),
}
PRODUCT_ALIASES = {
    "cakepop": ("cakepop", "cake pop", "cake pops", "케이크팝", "paleta", "paletas"),
    "cake": ("cake", "cakes", "케이크", "pastel", "pasteles"),
    "strawberry": ("strawberry", "strawberries", "딸기", "fresa", "fresas"),
    "cupcake": ("cupcake", "cupcakes", "컵케이크"),
}


@dataclass(frozen=True)
class ProductVariant:
    label: str
    price: float


@dataclass(frozen=True)
class Product:
    slug: str
    name: str
    variants: list[ProductVariant]
    hidden: bool = False


def _extract_block(text: str, start_index: int) -> str:
    brace = text.rfind("{", 0, start_index)
    if brace == -1:
        brace = text.find("{", start_index)
    if brace == -1:
        return ""
    depth = 0
    in_string = False
    escape = False
    for index in range(brace, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[brace : index + 1]
    return ""


def load_products(products_path: Path = DEFAULT_PRODUCTS_PATH) -> list[Product]:
    text = products_path.read_text(encoding="utf-8")
    products: list[Product] = []
    for match in re.finditer(r'\bslug:\s*"([^"]+)"', text):
        block = _extract_block(text, match.start())
        if not block:
            continue
        name_match = re.search(r'\bname:\s*"([^"]+)"', block)
        if not name_match:
            continue
        variants: list[ProductVariant] = []
        for variant in re.finditer(r'\{\s*label:\s*"([^"]+)"\s*,\s*price:\s*([0-9]+(?:\.[0-9]+)?)', block):
            variants.append(ProductVariant(label=variant.group(1), price=float(variant.group(2))))
        if not variants:
            continue
        hidden = bool(re.search(r'\bhidden:\s*true', block))
        products.append(Product(slug=match.group(1), name=name_match.group(1), variants=variants, hidden=hidden))
    return products


def detect_language(message: str) -> str:
    lower = message.lower()
    if re.search(r"[\uac00-\ud7af]", message):
        return "ko"
    if any(word in lower for word in PRICE_WORDS["es"] + WEBSITE_WORDS["es"]):
        return "es"
    return "en"


def detect_intent(message: str) -> str:
    lower = message.lower()
    if any(word in lower for words in PRICE_WORDS.values() for word in words):
        return "price"
    if any(word in lower for words in WEBSITE_WORDS.values() for word in words):
        return "website"
    return "needs_human"


def matching_products(message: str, products: list[Product]) -> list[Product]:
    lower = message.lower()
    requested_keys = [key for key, aliases in PRODUCT_ALIASES.items() if any(alias in lower for alias in aliases)]
    visible = [product for product in products if not product.hidden]
    if not requested_keys:
        return [product for product in visible if "cakepop" in product.name.lower() or "cake pop" in product.name.lower()]
    matches: list[Product] = []
    for product in visible:
        haystack = f"{product.slug} {product.name}".lower()
        if any(any(alias in haystack for alias in PRODUCT_ALIASES[key]) for key in requested_keys):
            matches.append(product)
    return matches or visible[:5]


def format_price(value: float) -> str:
    if value.is_integer():
        return f"${int(value)}"
    return f"${value:.2f}"


def product_price_lines(products: list[Product]) -> list[str]:
    lines: list[str] = []
    for product in products[:5]:
        variants = ", ".join(f"{variant.label}: {format_price(variant.price)}" for variant in product.variants[:3])
        lines.append(f"{product.name} — {variants}")
    return lines


def website_reply(language: str, website_url: str) -> str:
    if language == "es":
        return f"¡Hola! Puedes ver el menú, precios y enviar tu pedido aquí: {website_url} 😊"
    if language == "ko":
        return f"안녕하세요! 메뉴, 가격, 주문은 웹사이트에서 확인하실 수 있어요: {website_url} 😊"
    return f"Hi! You can see the menu, prices, and place an order here: {website_url} 😊"


def price_reply(language: str, products: list[Product], website_url: str) -> str:
    lines = product_price_lines(products)
    if language == "es":
        return "¡Hola! Estos son los precios actuales:\n" + "\n".join(f"- {line}" for line in lines) + f"\nPuedes ver más opciones o pedir aquí: {website_url}"
    if language == "ko":
        return "안녕하세요! 현재 가격은 아래와 같아요:\n" + "\n".join(f"- {line}" for line in lines) + f"\n더 많은 옵션과 주문은 웹사이트에서 확인해주세요: {website_url}"
    return "Hi! Current pricing is:\n" + "\n".join(f"- {line}" for line in lines) + f"\nYou can see more options or order here: {website_url}"


def build_sunjae_escalation(message: str, sender: str, listing_title: str, language: str) -> dict[str, Any]:
    return {
        "escalation_id": f"fbm_{uuid.uuid4().hex[:12]}",
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "status": "waiting_for_sunjae",
        "channel": "facebook_marketplace",
        "sender": sender,
        "listing_title": listing_title,
        "customer_language": language,
        "customer_message": message,
        "sunjae_message_ko": (
            "Sunjae, 아래 고객 질문에 답변이 필요해요. 한국어로 답장해주면 제가 영어로 번역해서 고객 채팅에 보낼 답변으로 만들게요.\n"
            f"고객: {sender or 'unknown'}\n"
            f"광고: {listing_title or 'unknown'}\n"
            f"질문: {message}"
        ),
        "sunjae_message_en": (
            "Sunjae, this Facebook Marketplace question needs your answer. Reply in Korean; Sunjae/Jarvis will translate it to English for the customer.\n"
            f"Customer: {sender or 'unknown'}\nListing: {listing_title or 'unknown'}\nQuestion: {message}"
        ),
    }


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def decide_reply(
    message: str,
    *,
    sender: str = "",
    listing_title: str = "",
    products_path: Path = DEFAULT_PRODUCTS_PATH,
    escalation_path: Path | None = None,
    website_url: str | None = None,
) -> dict[str, Any]:
    website = website_url or os.environ.get("DIPSPRINKLE_WEBSITE_URL") or DEFAULT_WEBSITE_URL
    language = detect_language(message)
    intent = detect_intent(message)
    if intent == "website":
        return {
            "action": "auto_reply",
            "intent": "website",
            "language": language,
            "reply": website_reply(language, website),
            "source": "website_url",
            "website_url": website,
        }
    if intent == "price":
        products = matching_products(message, load_products(products_path))
        return {
            "action": "auto_reply",
            "intent": "price",
            "language": language,
            "reply": price_reply(language, products, website),
            "source": "local_products_list",
            "matched_products": [asdict(product) for product in products[:5]],
            "website_url": website,
        }

    escalation = build_sunjae_escalation(message, sender, listing_title, language)
    if escalation_path is not None:
        append_jsonl(escalation_path, escalation)
    return {
        "action": "ask_sunjae",
        "intent": "needs_human",
        "language": language,
        **escalation,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Decide a safe Facebook Marketplace reply for Dip & Sprinkle.")
    parser.add_argument("message", help="Customer message text")
    parser.add_argument("--sender", default="")
    parser.add_argument("--listing-title", default="")
    parser.add_argument("--products-path", type=Path, default=DEFAULT_PRODUCTS_PATH)
    parser.add_argument("--escalation-path", type=Path, default=DEFAULT_ESCALATION_PATH)
    parser.add_argument("--no-write", action="store_true", help="Do not append escalation JSONL rows")
    parser.add_argument("--website-url", default=None)
    args = parser.parse_args(argv)
    decision = decide_reply(
        args.message,
        sender=args.sender,
        listing_title=args.listing_title,
        products_path=args.products_path,
        escalation_path=None if args.no_write else args.escalation_path,
        website_url=args.website_url,
    )
    print(json.dumps(decision, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
