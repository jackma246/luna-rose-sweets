#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class HermesReplyGatewayBridgeTests(unittest.TestCase):
    def test_bridge_updates_named_thread_state_and_returns_copy_paste_reply(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "state.json"
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/hermes_reply_gateway_bridge.py",
                    "maria: How much are cake pops?",
                    "--state-path",
                    str(state_path),
                ],
                cwd=ROOT,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
            payload = json.loads(completed.stdout)
            self.assertIn("Cake Pops", payload["outgoing_messages"][0])
            state = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(state["active_threads"]["yun"], "maria")
            self.assertIn("maria", state["threads"]["yun"])

    def test_bridge_treats_empty_state_file_as_fresh_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            state_path = Path(tmp) / "state.json"
            state_path.write_text("", encoding="utf-8")
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/hermes_reply_gateway_bridge.py",
                    "How much are cake pops?",
                    "--state-path",
                    str(state_path),
                ],
                cwd=ROOT,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
            payload = json.loads(completed.stdout)
            self.assertIn("Cake Pops", payload["outgoing_messages"][0])
            state = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(state["pending"], {})
            self.assertIn("yun", state["threads"])
            self.assertIn("default", state["threads"]["yun"])


if __name__ == "__main__":
    unittest.main()
