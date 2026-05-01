#!/usr/bin/env python3
"""Safe Sunjae admin client for Dip & Sprinkle.

Writes dry-run by default. Use --execute only after explicit human approval.
Secrets are read from environment variables, never stored by this script.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any

EXPENSE_CATEGORIES = {"ingredient", "supply", "packaging", "other"}
INVENTORY_CATEGORIES = {"ingredient", "supply", "packaging", "equipment", "other"}
ORDER_STATUSES = {
    "pending",
    "confirmed",
    "deposit_received",
    "prepping",
    "cake_prepped",
    "ready",
    "delivered",
    "completed",
    "cancelled",
}
ORDER_SOURCES = {"fb_marketplace", "tiktok", "instagram", "website"}


def die(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(2)


def base_url() -> str:
    return os.environ.get("DIPSPRINKLE_ADMIN_BASE_URL", "https://dipsprinkle.com").rstrip("/")


def token() -> str:
    value = os.environ.get("SUNJAE_ADMIN_API_TOKEN", "")
    if not value:
        die("SUNJAE_ADMIN_API_TOKEN is required for API execution")
    return value


def parse_items_json(value: str) -> list[dict[str, Any]]:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError as exc:
        die(f"items JSON is invalid: {exc}")
    if not isinstance(parsed, list) or not parsed:
        die("items JSON must be a non-empty array")
    return parsed


def print_preview(method: str, path: str, payload: Any | None) -> None:
    print("DRY RUN" if payload is not None else "READ")
    print(f"{method} {base_url()}{path}")
    if payload is not None:
        print(json.dumps(payload, indent=2, sort_keys=True))


def request(
    method: str,
    path: str,
    payload: Any | None = None,
    execute: bool = False,
    delete_confirmation: str | None = None,
) -> dict[str, Any]:
    if method != "GET" and not execute:
        print_preview(method, path, payload)
        return {"ok": True, "dryRun": True, "method": method, "path": path, "payload": payload}

    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {token()}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if delete_confirmation:
        headers["X-Sunjae-Confirm-Delete"] = delete_confirmation
    req = urllib.request.Request(
        f"{base_url()}{path}",
        data=data,
        method=method,
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            if not body:
                return {"ok": True}
            return json.loads(body)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        die(f"HTTP {exc.code}: {body}")


def require_delete_confirmation(kind: str, object_id: str, confirmation: str | None) -> None:
    expected = f"Approve delete {kind} {object_id}"
    if confirmation != expected:
        die(f"delete requires exact confirmation: {expected!r}")


def handle_orders(args: argparse.Namespace) -> dict[str, Any]:
    if args.action == "list":
        return request("GET", "/api/admin/orders", execute=True)
    if args.action == "create":
        if not args.customer_name or not args.customer_email or not args.items_json or args.total_price is None:
            die("order create requires customer name, customer email, items JSON, and total price")
        payload = {
            "customerName": args.customer_name,
            "customerEmail": args.customer_email,
            "customerPhone": args.customer_phone,
            "items": parse_items_json(args.items_json),
            "totalPrice": args.total_price,
            "neededDate": args.needed_date,
            "customerNotes": args.customer_notes,
            "internalNotes": args.internal_notes,
            "status": args.status,
            "source": args.source,
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        return request("POST", "/api/admin/orders", payload, args.execute)
    if args.action == "patch":
        payload = {
            "customerName": args.customer_name,
            "customerEmail": args.customer_email,
            "customerPhone": args.customer_phone,
            "totalPrice": args.total_price,
            "neededDate": args.needed_date,
            "customerNotes": args.customer_notes,
            "internalNotes": args.internal_notes,
            "status": args.status,
            "source": args.source,
            "items": parse_items_json(args.items_json) if args.items_json else None,
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        if not payload:
            die("order patch requires at least one field")
        return request("PATCH", f"/api/admin/orders/{args.id}", payload, args.execute)
    if args.action == "delete":
        require_delete_confirmation("order", args.id, args.confirm_delete)
        return request("DELETE", f"/api/admin/orders/{args.id}", {}, args.execute, args.confirm_delete)
    raise AssertionError(args.action)


def handle_expenses(args: argparse.Namespace) -> dict[str, Any]:
    if args.action == "list":
        return request("GET", "/api/admin/expenses", execute=True)
    if getattr(args, "category", None) and args.category not in EXPENSE_CATEGORIES:
        die(f"invalid expense category: {args.category}")
    if args.action == "create":
        if not args.date or args.amount is None or not args.vendor or not args.category:
            die("expense create requires date, amount, vendor, and category")
        payload = {"date": args.date, "amount": args.amount, "vendor": args.vendor, "category": args.category, "notes": args.notes}
        payload = {k: v for k, v in payload.items() if v is not None}
        return request("POST", "/api/admin/expenses", payload, args.execute)
    if args.action == "patch":
        payload = {"date": args.date, "amount": args.amount, "vendor": args.vendor, "category": args.category, "notes": args.notes}
        payload = {k: v for k, v in payload.items() if v is not None}
        if not payload:
            die("expense patch requires at least one field")
        return request("PATCH", f"/api/admin/expenses/{args.id}", payload, args.execute)
    if args.action == "delete":
        require_delete_confirmation("expense", args.id, args.confirm_delete)
        return request("DELETE", f"/api/admin/expenses/{args.id}", {}, args.execute, args.confirm_delete)
    raise AssertionError(args.action)


def handle_inventory(args: argparse.Namespace) -> dict[str, Any]:
    if args.action == "list":
        return request("GET", "/api/admin/inventory", execute=True)
    if getattr(args, "category", None) and args.category not in INVENTORY_CATEGORIES:
        die(f"invalid inventory category: {args.category}")
    if args.action == "create":
        if not args.name or args.quantity is None or not args.category:
            die("inventory create requires name, quantity, and category")
        payload = {
            "name": args.name,
            "quantity": args.quantity,
            "unit": args.unit,
            "category": args.category,
            "lowStockThreshold": args.low_stock_threshold,
            "notes": args.notes,
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        return request("POST", "/api/admin/inventory", payload, args.execute)
    if args.action == "patch":
        payload = {
            "name": args.name,
            "quantity": args.quantity,
            "unit": args.unit,
            "category": args.category,
            "lowStockThreshold": args.low_stock_threshold,
            "notes": args.notes,
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        if not payload:
            die("inventory patch requires at least one field")
        return request("PATCH", f"/api/admin/inventory/{args.id}", payload, args.execute)
    if args.action == "adjust":
        if args.delta is None or args.delta == 0:
            die("inventory adjust requires non-zero delta")
        return request("POST", f"/api/admin/inventory/{args.id}/adjust", {"delta": args.delta}, args.execute)
    if args.action == "delete":
        require_delete_confirmation("inventory", args.id, args.confirm_delete)
        return request("DELETE", f"/api/admin/inventory/{args.id}", {}, args.execute, args.confirm_delete)
    raise AssertionError(args.action)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Safe Sunjae admin client for Dip & Sprinkle")
    sub = parser.add_subparsers(dest="resource", required=True)

    orders = sub.add_parser("orders")
    orders_sub = orders.add_subparsers(dest="action", required=True)
    orders_sub.add_parser("list")
    order_create = orders_sub.add_parser("create")
    order_patch = orders_sub.add_parser("patch")
    order_delete = orders_sub.add_parser("delete")
    for p in (order_create, order_patch):
        if p is order_patch:
            p.add_argument("id")
        p.add_argument("--customer-name")
        p.add_argument("--customer-email")
        p.add_argument("--customer-phone")
        p.add_argument("--items-json")
        p.add_argument("--total-price", type=float)
        p.add_argument("--needed-date")
        p.add_argument("--customer-notes")
        p.add_argument("--internal-notes")
        p.add_argument("--status", choices=sorted(ORDER_STATUSES))
        p.add_argument("--source", choices=sorted(ORDER_SOURCES))
        p.add_argument("--execute", action="store_true")
    order_delete.add_argument("id")
    order_delete.add_argument("--confirm-delete")
    order_delete.add_argument("--execute", action="store_true")

    expenses = sub.add_parser("expenses")
    expenses_sub = expenses.add_subparsers(dest="action", required=True)
    expenses_sub.add_parser("list")
    expense_create = expenses_sub.add_parser("create")
    expense_patch = expenses_sub.add_parser("patch")
    expense_delete = expenses_sub.add_parser("delete")
    for p in (expense_create, expense_patch):
        if p is expense_patch:
            p.add_argument("id")
        p.add_argument("--date")
        p.add_argument("--amount", type=float)
        p.add_argument("--vendor")
        p.add_argument("--category")
        p.add_argument("--notes")
        p.add_argument("--execute", action="store_true")
    expense_delete.add_argument("id")
    expense_delete.add_argument("--confirm-delete")
    expense_delete.add_argument("--execute", action="store_true")

    inventory = sub.add_parser("inventory")
    inventory_sub = inventory.add_subparsers(dest="action", required=True)
    inventory_sub.add_parser("list")
    inventory_create = inventory_sub.add_parser("create")
    inventory_patch = inventory_sub.add_parser("patch")
    inventory_adjust = inventory_sub.add_parser("adjust")
    inventory_delete = inventory_sub.add_parser("delete")
    for p in (inventory_create, inventory_patch):
        if p is inventory_patch:
            p.add_argument("id")
        p.add_argument("--name")
        p.add_argument("--quantity", type=float)
        p.add_argument("--unit")
        p.add_argument("--category")
        p.add_argument("--low-stock-threshold", type=float)
        p.add_argument("--notes")
        p.add_argument("--execute", action="store_true")
    inventory_adjust.add_argument("id")
    inventory_adjust.add_argument("--delta", type=float, required=True)
    inventory_adjust.add_argument("--execute", action="store_true")
    inventory_delete.add_argument("id")
    inventory_delete.add_argument("--confirm-delete")
    inventory_delete.add_argument("--execute", action="store_true")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.resource == "orders":
        result = handle_orders(args)
    elif args.resource == "expenses":
        result = handle_expenses(args)
    elif args.resource == "inventory":
        result = handle_inventory(args)
    else:
        raise AssertionError(args.resource)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
