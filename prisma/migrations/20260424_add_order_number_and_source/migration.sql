-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('fb_marketplace', 'tiktok', 'instagram', 'website');

-- AlterTable: add orderNumber (nullable for backfill, then enforced)
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;
ALTER TABLE "Order" ADD COLUMN "source" "OrderSource" NOT NULL DEFAULT 'website';

-- Backfill existing rows in createdAt order
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "Order"
)
UPDATE "Order"
SET "orderNumber" = numbered.rn
FROM numbered
WHERE "Order"."id" = numbered."id";

-- Sequence + default + NOT NULL
CREATE SEQUENCE "Order_orderNumber_seq" OWNED BY "Order"."orderNumber";
SELECT setval('"Order_orderNumber_seq"', COALESCE((SELECT MAX("orderNumber") FROM "Order"), 0));
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET DEFAULT nextval('"Order_orderNumber_seq"');
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_source_idx" ON "Order"("source");
