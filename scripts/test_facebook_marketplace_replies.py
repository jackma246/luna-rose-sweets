#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import facebook_marketplace_replies as fb


class FacebookMarketplaceReplyTests(unittest.TestCase):
    def test_price_question_uses_local_products_and_answers_immediately(self):
        decision = fb.decide_reply("Hi, how much are cake pops?", products_path=fb.DEFAULT_PRODUCTS_PATH)

        self.assertEqual(decision["action"], "auto_reply")
        self.assertEqual(decision["intent"], "price")
        self.assertIn("Cakepop Bouquet", decision["reply"])
        self.assertIn("$42", decision["reply"])
        self.assertIn("Cakepop & Rose Bouquet", decision["reply"])
        self.assertIn("$95", decision["reply"])
        self.assertEqual(decision["source"], "local_products_list")

    def test_spanish_website_question_redirects_to_website_in_spanish(self):
        decision = fb.decide_reply("Hola, tienes página web?", products_path=fb.DEFAULT_PRODUCTS_PATH)

        self.assertEqual(decision["action"], "auto_reply")
        self.assertEqual(decision["language"], "es")
        self.assertEqual(decision["intent"], "website")
        self.assertIn("https://dipsprinkle.com", decision["reply"])
        self.assertIn("pedido", decision["reply"].lower())

    def test_korean_price_question_answers_in_korean(self):
        decision = fb.decide_reply("케이크팝 가격 얼마예요?", products_path=fb.DEFAULT_PRODUCTS_PATH)

        self.assertEqual(decision["action"], "auto_reply")
        self.assertEqual(decision["language"], "ko")
        self.assertEqual(decision["intent"], "price")
        self.assertIn("Cakepop Bouquet", decision["reply"])
        self.assertIn("$42", decision["reply"])
        self.assertIn("웹사이트", decision["reply"])

    def test_unknown_question_creates_korean_escalation_for_sunjae(self):
        with tempfile.TemporaryDirectory() as tmp:
            escalation_path = Path(tmp) / "escalations.jsonl"
            decision = fb.decide_reply(
                "Can you make these gluten free and deliver tomorrow morning?",
                sender="Maria",
                listing_title="Cake pops ad #12",
                products_path=fb.DEFAULT_PRODUCTS_PATH,
                escalation_path=escalation_path,
            )

            self.assertEqual(decision["action"], "ask_sunjae")
            self.assertEqual(decision["intent"], "needs_human")
            self.assertIn("Sunjae", decision["sunjae_message_en"])
            self.assertIn("아래 고객 질문에 답변이 필요해요", decision["sunjae_message_ko"])
            self.assertTrue(escalation_path.exists())
            rows = [json.loads(line) for line in escalation_path.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["sender"], "Maria")
            self.assertEqual(rows[0]["listing_title"], "Cake pops ad #12")
            self.assertEqual(rows[0]["status"], "waiting_for_sunjae")


if __name__ == "__main__":
    unittest.main()
