-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'deposit_received', 'prepping', 'cake_prepped', 'ready', 'delivered', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('ingredient', 'supply', 'packaging', 'other');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "items" JSONB NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "neededDate" DATE,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "remindersSent" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "vendor" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "notes" TEXT,
    "receiptUrl" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_neededDate_idx" ON "Order"("neededDate");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

