#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import io
import json
import os
import tempfile
import unittest
from unittest import mock

import sunjae_admin


@contextlib.contextmanager
def no_token_required_for_dry_run():
    old = os.environ.get("SUNJAE_ADMIN_API_TOKEN")
    os.environ.pop("SUNJAE_ADMIN_API_TOKEN", None)
    try:
        yield
    finally:
        if old is not None:
            os.environ["SUNJAE_ADMIN_API_TOKEN"] = old


class SunjaeAdminTests(unittest.TestCase):
    def run_main(self, argv):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = sunjae_admin.main(argv)
        self.assertEqual(code, 0)
        return buf.getvalue()

    def parse_final_json(self, out):
        marker = "\n{\n  \"dryRun\""
        start = out.rfind(marker)
        if start == -1:
            marker = "\n{\n  \"ok\""
            start = out.rfind(marker)
        self.assertNotEqual(start, -1, out)
        return json.loads(out[start + 1:])

    def test_order_create_rejects_missing_required_fields(self):
        with self.assertRaises(SystemExit):
            sunjae_admin.main(["orders", "create", "--customer-name", "Jane"])

    def test_order_create_builds_payload_in_dry_run_without_token(self):
        with no_token_required_for_dry_run():
            out = self.run_main([
                "orders",
                "create",
                "--customer-name",
                "Jane Kim",
                "--customer-email",
                "jane@example.com",
                "--items-json",
                '[{"name":"Cupcakes","quantity":12,"price":36}]',
                "--total-price",
                "36",
                "--status",
                "deposit_received",
            ])
        self.assertIn('"dryRun": true', out)
        self.assertIn('"customerName": "Jane Kim"', out)
        self.assertIn('"status": "deposit_received"', out)

    def test_expense_category_validation_rejects_bad_category(self):
        with self.assertRaises(SystemExit):
            sunjae_admin.main([
                "expenses",
                "create",
                "--date",
                "2026-05-01",
                "--amount",
                "10",
                "--vendor",
                "Amazon",
                "--category",
                "bad",
            ])

    def test_inventory_adjust_rejects_zero_delta(self):
        with self.assertRaises(SystemExit):
            sunjae_admin.main(["inventory", "adjust", "item_123", "--delta", "0"])

    def test_delete_requires_exact_confirmation(self):
        with self.assertRaises(SystemExit):
            sunjae_admin.main(["orders", "delete", "order_123", "--confirm-delete", "yes", "--execute"])

    def test_delete_dry_run_allows_exact_confirmation_without_token(self):
        with no_token_required_for_dry_run():
            out = self.run_main([
                "orders",
                "delete",
                "order_123",
                "--confirm-delete",
                "Approve delete order order_123",
            ])
        result = self.parse_final_json(out)
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["path"], "/api/admin/orders/order_123")

    def test_order_image_upload_dry_run_previews_files_without_token(self):
        with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
            tmp.write(b"fake image bytes")
            tmp.flush()
            with no_token_required_for_dry_run():
                out = self.run_main(["orders", "images", "upload", "order_123", tmp.name])
        result = self.parse_final_json(out)
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["method"], "POST")
        self.assertEqual(result["path"], "/api/admin/orders/order_123/images")
        self.assertEqual(result["files"][0]["path"], tmp.name)
        self.assertEqual(result["files"][0]["size"], len(b"fake image bytes"))
        self.assertEqual(result["files"][0]["mimeType"], "image/png")
        self.assertNotIn("fake image bytes", out)

    def test_order_image_upload_rejects_disallowed_file_type(self):
        with tempfile.NamedTemporaryFile(suffix=".txt") as tmp:
            tmp.write(b"not an image")
            tmp.flush()
            with self.assertRaises(SystemExit):
                sunjae_admin.main(["orders", "images", "upload", "order_123", tmp.name])

    def test_order_image_upload_execute_sends_multipart_without_printing_token(self):
        captured = {}

        class FakeResponse:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return b'{"ok":true,"images":[{"id":"img_123"}]}'

        def fake_urlopen(req, timeout):
            captured["url"] = req.full_url
            captured["headers"] = dict(req.header_items())
            captured["data"] = req.data
            captured["timeout"] = timeout
            return FakeResponse()

        with tempfile.NamedTemporaryFile(suffix=".webp") as tmp:
            tmp.write(b"image-data")
            tmp.flush()
            with mock.patch.dict(os.environ, {
                "SUNJAE_ADMIN_API_TOKEN": "secret-token",
                "DIPSPRINKLE_ADMIN_BASE_URL": "https://example.test",
            }, clear=False):
                with mock.patch("urllib.request.urlopen", fake_urlopen):
                    out = self.run_main(["orders", "images", "upload", "order_123", tmp.name, "--execute"])

        self.assertIn('"id": "img_123"', out)
        self.assertEqual(captured["url"], "https://example.test/api/admin/orders/order_123/images")
        self.assertEqual(captured["headers"]["Authorization"], "Bearer secret-token")
        self.assertIn("multipart/form-data", captured["headers"]["Content-type"])
        self.assertIn(b'name="file"', captured["data"])
        self.assertIn(b"image-data", captured["data"])
        self.assertNotIn("secret-token", out)

    def test_order_image_delete_requires_exact_confirmation(self):
        with self.assertRaises(SystemExit):
            sunjae_admin.main([
                "orders",
                "images",
                "delete",
                "order_123",
                "img_123",
                "--confirm-delete",
                "yes",
                "--execute",
            ])

    def test_order_image_delete_dry_run_allows_exact_confirmation_without_token(self):
        with no_token_required_for_dry_run():
            out = self.run_main([
                "orders",
                "images",
                "delete",
                "order_123",
                "img_123",
                "--confirm-delete",
                "Approve delete order image img_123",
            ])
        result = self.parse_final_json(out)
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["path"], "/api/admin/orders/order_123/images/img_123")


if __name__ == "__main__":
    unittest.main()
