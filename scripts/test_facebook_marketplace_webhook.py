#!/usr/bin/env python3
from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBHOOK_ROUTE = ROOT / "src/app/api/facebook/marketplace/webhook/route.ts"
REPLY_LIB = ROOT / "src/lib/facebookMarketplaceReplies.ts"
DOC = ROOT / "docs/FACEBOOK_MARKETPLACE_REPLIES.md"


class FacebookMarketplaceWebhookTests(unittest.TestCase):
    def test_webhook_route_has_meta_verification_and_signature_guard(self):
        text = WEBHOOK_ROUTE.read_text(encoding="utf-8")
        self.assertIn("export async function GET", text)
        self.assertIn("hub.verify_token", text)
        self.assertIn("FB_MARKETPLACE_VERIFY_TOKEN", text)
        self.assertIn("x-hub-signature-256", text)
        self.assertIn("crypto.createHmac", text)
        self.assertIn("FB_APP_SECRET", text)

    def test_webhook_route_processes_messages_without_required_live_send_credentials(self):
        text = WEBHOOK_ROUTE.read_text(encoding="utf-8")
        self.assertIn("FB_PAGE_ACCESS_TOKEN", text)
        self.assertIn("SUNJAE_TELEGRAM_CHAT_ID", text)
        self.assertIn("local_only", text)
        self.assertIn("decideMarketplaceReply", text)
        self.assertIn("safeLogPayload", text)

    def test_reply_library_has_optional_llm_classifier_but_uses_local_facts_for_replies(self):
        text = REPLY_LIB.read_text(encoding="utf-8")
        self.assertIn("FB_MARKETPLACE_USE_LLM", text)
        self.assertIn("OPENAI_API_KEY", text)
        self.assertIn("Classify a bakery Facebook Marketplace customer message", text)
        self.assertIn("llm_classifier_local_facts", text)
        self.assertIn("priceReply(language, matched)", text)
        self.assertIn("products", text)

    def test_docs_describe_webhook_and_llm_boundary(self):
        text = DOC.read_text(encoding="utf-8")
        self.assertIn("webhook", text.lower())
        self.assertIn("LLM", text)
        self.assertTrue("local product" in text.lower() or "src/data/products.ts" in text)
        self.assertIn("FB_MARKETPLACE_VERIFY_TOKEN", text)
        self.assertIn("FB_PAGE_ACCESS_TOKEN", text)


if __name__ == "__main__":
    unittest.main()
