-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventDate" DATE,
    "guestCount" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website_contact',

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_eventDate_idx" ON "Inquiry"("eventDate");

-- CreateIndex
CREATE INDEX "Inquiry_source_idx" ON "Inquiry"("source");
