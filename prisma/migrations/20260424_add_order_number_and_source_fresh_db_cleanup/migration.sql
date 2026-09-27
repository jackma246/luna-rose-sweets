-- Removes the placeholder order inserted by 20260423_init_fresh_db_bootstrap (fresh databases only) and restarts
-- order numbering so the first real order is #1. No-op on databases that never had the placeholder (production).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Order" WHERE "id" = '__fresh_db_bootstrap__') THEN
    DELETE FROM "Order" WHERE "id" = '__fresh_db_bootstrap__';
    IF NOT EXISTS (SELECT 1 FROM "Order") THEN
      PERFORM setval('"Order_orderNumber_seq"', 1, false);
    END IF;
  END IF;
END $$;
