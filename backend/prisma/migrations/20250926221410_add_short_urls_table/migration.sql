/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `n8nWebhook` on the `whatsapp_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."customers" DROP COLUMN "shippingAddress";

-- AlterTable
ALTER TABLE "public"."whatsapp_settings" DROP COLUMN "n8nWebhook";

-- CreateTable
CREATE TABLE "public"."ShortUrls" (
    "id" TEXT NOT NULL,
    "shortCode" VARCHAR(10) NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrls_shortCode_key" ON "public"."ShortUrls"("shortCode");

-- CreateIndex
CREATE INDEX "ShortUrls_shortCode_idx" ON "public"."ShortUrls"("shortCode");

-- CreateIndex
CREATE INDEX "ShortUrls_workspaceId_idx" ON "public"."ShortUrls"("workspaceId");

-- CreateIndex
CREATE INDEX "ShortUrls_expiresAt_idx" ON "public"."ShortUrls"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."ShortUrls" ADD CONSTRAINT "ShortUrls_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
