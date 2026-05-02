#!/usr/bin/env python3
"""Copy/paste reply copilot for personal Facebook Marketplace messages.

This script is intentionally local and side-effect-light. It does not read
Facebook, send Facebook messages, or call Telegram. A dedicated Telegram/Hermes
profile can call it to turn a copied customer message into either:

- one standalone customer reply that is safe to copy/paste, or
- one Korean follow-up question for the human operator.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import facebook_marketplace_replies as fb


SAFETY_TOPIC_KO = {
    "gluten free": "글루텐프리",
    "gluten-free": "글루텐프리",
    "allergy": "알레르기",
    "allergies": "알레르기",
    "deliver": "배송",
    "delivery": "배송",
    "tomorrow": "내일",
    "morning": "오전",
    "pickup": "픽업",
    "custom": "맞춤 주문",
    "available": "가능 여부",
    "availability": "가능 여부",
}


def _message(kind: str, text: str, *, copy_paste_only: bool) -> dict[str, Any]:
    return {
        "kind": kind,
        "copy_paste_only": copy_paste_only,
        "separate_telegram_message": True,
        "text": text.strip(),
    }


def korean_follow_up_text(decision: dict[str, Any]) -> str:
    customer_message = decision.get("customer_message", "").strip()
    listing_title = decision.get("listing_title") or "미상"
    sender = decision.get("sender") or "미상"
    lower = customer_message.lower()
    detected_topics = [label for key, label in SAFETY_TOPIC_KO.items() if key in lower]
    topic_line = ", ".join(dict.fromkeys(detected_topics)) if detected_topics else "자동 답변하기 어려운 맞춤/가능 여부 질문"
    return (
        "아래 고객 질문은 자동 답변하지 않는 게 안전해요.\n"
        "고객에게 보낼 답을 한국어로 알려주세요. 제가 고객 언어로 복사/붙여넣기용 답장을 따로 만들게요.\n\n"
        f"고객: {sender}\n"
        f"광고: {listing_title}\n"
        f"확인 필요: {topic_line}\n"
        f"고객 질문: {customer_message}"
    )


def build_copilot_response(
    customer_message: str,
    *,
    sender: str = "",
    listing_title: str = "",
    products_path: Path = fb.DEFAULT_PRODUCTS_PATH,
    escalation_path: Path | None = None,
    website_url: str | None = None,
) -> dict[str, Any]:
    decision = fb.decide_reply(
        customer_message,
        sender=sender,
        listing_title=listing_title,
        products_path=products_path,
        escalation_path=escalation_path,
        website_url=website_url,
    )
    if decision["action"] == "auto_reply":
        return {
            "status": "copy_paste_ready",
            "intent": decision["intent"],
            "customer_language": decision["language"],
            "source": decision["source"],
            "telegram_messages": [_message("copy_paste_reply", decision["reply"], copy_paste_only=True)],
        }
    return {
        "status": "needs_operator_answer",
        "intent": decision["intent"],
        "customer_language": decision["language"],
        "escalation_id": decision.get("escalation_id"),
        "telegram_messages": [_message("korean_follow_up", korean_follow_up_text(decision), copy_paste_only=False)],
    }


def _english_reply_from_korean_answer(answer: str) -> str:
    lower = answer.lower()
    # Conservative phrase mapping for common bakery availability answers. The
    # dedicated Hermes profile can improve the language naturally with the LLM,
    # but this local fallback keeps the copy/paste contract deterministic.
    parts: list[str] = []
    if "글루텐" in answer:
        if "어렵" in answer or "안" in answer or "불가" in answer:
            parts.append("We’re sorry, but we can’t make these gluten-free at this time.")
        else:
            parts.append("We can help with gluten-free details after checking the order.")
    if "배송" in answer:
        if "안" in answer or "불가" in answer or "어렵" in answer:
            parts.append("Delivery is not available for that time.")
        else:
            parts.append("Delivery may be available for that time.")
    if "픽업" in answer:
        if "가능" in answer or "만" in answer:
            parts.append("Pickup is available.")
    if not parts:
        cleaned = re.sub(r"\s+", " ", answer).strip()
        parts.append(f"Thanks for asking! We checked with the baker: {cleaned}")
    return "Hi! " + " ".join(parts)


def _spanish_reply_from_korean_answer(answer: str) -> str:
    english = _english_reply_from_korean_answer(answer)
    replacements = [
        ("Hi! ", "¡Hola! "),
        ("We’re sorry, but we can’t make these gluten-free at this time.", "Lo sentimos, pero por ahora no podemos hacerlos sin gluten."),
        ("Delivery is not available for that time.", "No hay entrega disponible para ese horario."),
        ("Pickup is available.", "La recogida sí está disponible."),
    ]
    text = english
    for source, target in replacements:
        text = text.replace(source, target)
    return text


def build_operator_answer_response(
    *,
    customer_message: str,
    operator_answer_ko: str,
    customer_language: str,
) -> dict[str, Any]:
    if customer_language == "es":
        reply = _spanish_reply_from_korean_answer(operator_answer_ko)
    elif customer_language == "ko":
        reply = operator_answer_ko.strip()
    else:
        reply = _english_reply_from_korean_answer(operator_answer_ko)
    return {
        "status": "copy_paste_ready",
        "customer_language": customer_language,
        "source": "operator_answer_ko",
        "telegram_messages": [_message("copy_paste_reply", reply, copy_paste_only=True)],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build copy/paste Telegram messages for Dip & Sprinkle customer replies.")
    parser.add_argument("customer_message", help="Copied customer message from Facebook Marketplace")
    parser.add_argument("--sender", default="")
    parser.add_argument("--listing-title", default="")
    parser.add_argument("--products-path", type=Path, default=fb.DEFAULT_PRODUCTS_PATH)
    parser.add_argument("--escalation-path", type=Path, default=None)
    parser.add_argument("--website-url", default=None)
    parser.add_argument("--operator-answer-ko", default="", help="Korean operator answer to convert into a customer reply")
    parser.add_argument("--customer-language", default="", help="Customer language for operator-answer mode: en/es/ko")
    args = parser.parse_args(argv)

    if args.operator_answer_ko:
        language = args.customer_language or fb.detect_language(args.customer_message)
        payload = build_operator_answer_response(
            customer_message=args.customer_message,
            operator_answer_ko=args.operator_answer_ko,
            customer_language=language,
        )
    else:
        payload = build_copilot_response(
            args.customer_message,
            sender=args.sender,
            listing_title=args.listing_title,
            products_path=args.products_path,
            escalation_path=args.escalation_path,
            website_url=args.website_url,
        )
    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
