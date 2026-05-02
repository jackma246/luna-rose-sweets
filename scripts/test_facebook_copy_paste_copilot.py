#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import facebook_copy_paste_copilot as copilot
import facebook_marketplace_replies as fb


class FacebookCopyPasteCopilotTests(unittest.TestCase):
    def test_price_question_returns_only_one_copy_paste_reply_message(self):
        result = copilot.build_copilot_response("Hi, how much are cake pops?")

        self.assertEqual(result["status"], "copy_paste_ready")
        self.assertEqual(result["customer_language"], "en")
        self.assertEqual(len(result["telegram_messages"]), 1)
        message = result["telegram_messages"][0]
        self.assertEqual(message["kind"], "copy_paste_reply")
        self.assertTrue(message["copy_paste_only"])
        self.assertIn("Cake Pops", message["text"])
        self.assertIn("1 Dozen (12 pcs): $40", message["text"])
        self.assertNotIn("고객", message["text"])
        self.assertNotIn("COPY", message["text"].upper())

    def test_unknown_question_returns_korean_follow_up_not_customer_reply(self):
        with tempfile.TemporaryDirectory() as tmp:
            result = copilot.build_copilot_response(
                "Can you make these gluten free and deliver tomorrow morning?",
                sender="Maria",
                listing_title="Cake pops ad #12",
                escalation_path=Path(tmp) / "escalations.jsonl",
            )

        self.assertEqual(result["status"], "needs_operator_answer")
        self.assertEqual(len(result["telegram_messages"]), 1)
        message = result["telegram_messages"][0]
        self.assertEqual(message["kind"], "korean_follow_up")
        self.assertFalse(message["copy_paste_only"])
        self.assertIn("한국어로", message["text"])
        self.assertIn("글루텐프리", message["text"])
        self.assertIn("배송", message["text"])
        self.assertNotIn("Hi!", message["text"])

    def test_operator_answer_is_formatted_as_separate_copy_paste_reply(self):
        result = copilot.build_operator_answer_response(
            customer_message="Can you make these gluten free and deliver tomorrow morning?",
            operator_answer_ko="글루텐프리는 어렵고, 내일 오전 배송은 안 되고 픽업만 가능해요.",
            customer_language="en",
        )

        self.assertEqual(result["status"], "copy_paste_ready")
        self.assertEqual(len(result["telegram_messages"]), 1)
        message = result["telegram_messages"][0]
        self.assertEqual(message["kind"], "copy_paste_reply")
        self.assertTrue(message["copy_paste_only"])
        self.assertIn("gluten-free", message["text"].lower())
        self.assertIn("pickup", message["text"].lower())
        self.assertNotIn("한국어", message["text"])

    def test_cli_outputs_json_messages(self):
        completed = subprocess.run(
            [sys.executable, "scripts/facebook_copy_paste_copilot.py", "Hola, cuánto cuesta una docena de cake pops?"],
            cwd=fb.ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        payload = json.loads(completed.stdout)
        self.assertEqual(payload["status"], "copy_paste_ready")
        self.assertEqual(payload["telegram_messages"][0]["kind"], "copy_paste_reply")
        self.assertIn("$40", payload["telegram_messages"][0]["text"])


if __name__ == "__main__":
    unittest.main()
