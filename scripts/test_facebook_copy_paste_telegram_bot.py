#!/usr/bin/env python3
from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import facebook_copy_paste_telegram_bot as bot


class FacebookCopyPasteTelegramBotTests(unittest.TestCase):
    def test_safe_price_message_returns_single_copy_paste_reply_and_no_pending_state(self):
        state = {"pending": {}}
        outgoing = bot.build_outgoing_messages("How much for cake pops?", 123, state)

        self.assertEqual(len(outgoing), 1)
        self.assertIn("Cake Pops", outgoing[0])
        self.assertIn("$40", outgoing[0])
        self.assertEqual(state["pending"], {})

    def test_unknown_message_asks_korean_follow_up_and_stores_context(self):
        state = {"pending": {}}
        outgoing = bot.build_outgoing_messages("Can you make these gluten free and deliver tomorrow?", 123, state)

        self.assertEqual(len(outgoing), 1)
        self.assertIn("한국어로", outgoing[0])
        self.assertIn("123", state["pending"])
        self.assertEqual(state["pending"]["123"]["customer_language"], "en")

    def test_korean_operator_answer_returns_only_copy_paste_reply_and_clears_context(self):
        state = {
            "pending": {
                "123": {
                    "customer_message": "Can you make these gluten free and deliver tomorrow?",
                    "customer_language": "en",
                    "escalation_id": "fbm_test",
                }
            }
        }
        outgoing = bot.build_outgoing_messages("글루텐프리는 어렵고 배송은 안 되고 픽업만 가능해요.", 123, state)

        self.assertEqual(len(outgoing), 1)
        self.assertIn("gluten-free", outgoing[0].lower())
        self.assertIn("pickup", outgoing[0].lower())
        self.assertEqual(state["pending"], {})

    def test_follow_up_customer_message_uses_prior_thread_context(self):
        state = {"pending": {}, "threads": {}}
        bot.build_outgoing_messages("How much for cake pops?", 123, state)
        outgoing = bot.build_outgoing_messages("Can I get 2 dozen for tomorrow morning?", 123, state)

        self.assertEqual(len(outgoing), 1)
        self.assertIn("한국어로", outgoing[0])
        self.assertIn("Cake Pops", outgoing[0])
        self.assertIn("이전 대화", outgoing[0])
        self.assertIn("2 dozen", state["threads"]["123"]["turns"][-1]["text"])

    def test_start_command_clears_thread_context(self):
        state = {"pending": {}, "threads": {"123": {"turns": [{"role": "customer", "text": "old"}]}}}
        outgoing = bot.build_outgoing_messages("/new", 123, state)

        self.assertEqual(outgoing, ["새 고객 대화를 시작했어요. 고객 메시지를 복사해서 보내주세요."])
        self.assertNotIn("123", state["threads"])
        self.assertNotIn("123", state["pending"])

    def test_allowed_users_parser(self):
        self.assertEqual(bot.allowed_user_ids_from_env("123, 456"), {123, 456})
        self.assertEqual(bot.allowed_user_ids_from_env(""), set())


if __name__ == "__main__":
    unittest.main()
