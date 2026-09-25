-- Fresh-database bootstrap for 20260424_add_order_number_and_source.
--
-- That migration runs setval('"Order_orderNumber_seq"', COALESCE(MAX("orderNumber"), 0)). Postgres rejects 0
-- (the sequence minimum is 1), so on an empty "Order" table the migration fails and a brand new database can
-- never be migrated. Production applied it while it already had orders, and Prisma records its checksum, so the
-- file itself must not be edited.
--
-- This migration sorts between 20260423_init and 20260424_add_order_number_and_source. On a database that has
-- not run 20260424 yet (no "orderNumber" column) and holds no orders, it inserts one placeholder order so the
-- 20260424 backfill numbers it 1 and setval succeeds. 20260424_add_order_number_and_source_fresh_db_cleanup
-- deletes the placeholder right after. On an existing database (production) both migrations are no-ops.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'Order' AND column_name = 'orderNumber'
  ) AND NOT EXISTS (SELECT 1 FROM "Order") THEN
    INSERT INTO "Order" ("id", "updatedAt", "customerName", "customerEmail", "items", "totalPrice")
    VALUES ('__fresh_db_bootstrap__', CURRENT_TIMESTAMP, 'Fresh database bootstrap', 'bootstrap@invalid', '[]', 0);
  END IF;
END $$;
