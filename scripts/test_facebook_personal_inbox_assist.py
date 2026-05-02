#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))

import facebook_personal_inbox_assist as assist


class FacebookPersonalInboxAssistTests(unittest.TestCase):
    def run_main(self, argv):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = assist.main(argv)
        self.assertEqual(code, 0)
        return json.loads(buf.getvalue())

    def test_draft_uses_marketplace_reply_helper_without_browser(self):
        result = self.run_main(["draft", "How much are cake pops?"])

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["mode"], "draft")
        self.assertEqual(result["decision"]["action"], "auto_reply")
        self.assertEqual(result["decision"]["intent"], "price")
        self.assertIn("$42", result["decision"]["reply"])
        self.assertEqual(result["safety"], "manual_copy_paste_no_facebook_send")

    def test_open_prints_local_profile_path_and_never_requires_password_in_cli(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(assist, "launch_browser", return_value={"launched": True, "url": assist.DEFAULT_FACEBOOK_INBOX_URL}):
                result = self.run_main(["open", "--profile-dir", tmp])

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["mode"], "open")
        self.assertEqual(result["profile_dir"], tmp)
        self.assertIn("manual_login_required", result)
        self.assertNotIn("password", json.dumps(result).lower())

    def test_extract_visible_requires_execute_and_playwright(self):
        with self.assertRaises(SystemExit):
            assist.main(["extract-visible"])

    def test_send_requires_exact_confirmation(self):
        with self.assertRaises(SystemExit):
            assist.main(["send", "Hello", "--confirm-send", "yes"])

    def test_send_dry_run_does_not_touch_browser(self):
        result = self.run_main(["send", "Hello", "--confirm-send", "Approve send Facebook reply"])

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["dryRun"], True)
        self.assertEqual(result["text"], "Hello")
        self.assertEqual(result["safety"], "dry_run_no_facebook_send")


if __name__ == "__main__":
    unittest.main()
