/*
  Warnings:

  - A unique constraint covering the columns `[customerId,type,workspaceId]` on the table `secure_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."secure_tokens" ADD COLUMN     "customerId" TEXT;

-- CreateIndex
CREATE INDEX "secure_tokens_customerId_idx" ON "public"."secure_tokens"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "secure_tokens_customerId_type_workspaceId_key" ON "public"."secure_tokens"("customerId", "type", "workspaceId");
