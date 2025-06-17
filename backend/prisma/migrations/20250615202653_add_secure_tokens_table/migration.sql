/*
  Warnings:

  - You are about to drop the `gdpr_content` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "gdpr_content" DROP CONSTRAINT "gdpr_content_workspaceId_fkey";

-- DropTable
DROP TABLE "gdpr_content";

-- CreateTable
CREATE TABLE "secure_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "phoneNumber" TEXT,
    "payload" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secure_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secure_tokens_token_key" ON "secure_tokens"("token");

-- CreateIndex
CREATE INDEX "secure_tokens_token_idx" ON "secure_tokens"("token");

-- CreateIndex
CREATE INDEX "secure_tokens_expiresAt_idx" ON "secure_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "secure_tokens_workspaceId_idx" ON "secure_tokens"("workspaceId");

-- AddForeignKey
ALTER TABLE "secure_tokens" ADD CONSTRAINT "secure_tokens_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
