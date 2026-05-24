-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'limited', 'fully_booked', 'closed');

-- CreateTable
CREATE TABLE "AvailabilityDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityDate_date_key" ON "AvailabilityDate"("date");

-- CreateIndex
CREATE INDEX "AvailabilityDate_date_idx" ON "AvailabilityDate"("date");

-- CreateIndex
CREATE INDEX "AvailabilityDate_status_idx" ON "AvailabilityDate"("status");
