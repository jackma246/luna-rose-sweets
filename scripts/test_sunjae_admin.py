#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import io
import json
import os
import unittest

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
        result = json.loads(out.split("\n", 3)[-1])
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["path"], "/api/admin/orders/order_123")


if __name__ == "__main__":
    unittest.main()
