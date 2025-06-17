/*
  Warnings:

  - You are about to drop the column `content` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `isRouter` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `max_tokens` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `top_k` on the `agent_configs` table. All the data in the column will be lost.
  - You are about to drop the column `top_p` on the `agent_configs` table. All the data in the column will be lost.
  - Made the column `temperature` on table `agent_configs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `agent_configs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "agent_configs" DROP CONSTRAINT "agent_configs_workspaceId_fkey";

-- DropIndex
DROP INDEX "agent_configs_isActive_idx";

-- DropIndex
DROP INDEX "agent_configs_isRouter_idx";

-- DropIndex
DROP INDEX "agent_configs_workspaceId_idx";

-- AlterTable
ALTER TABLE "agent_configs" DROP COLUMN "content",
DROP COLUMN "department",
DROP COLUMN "isRouter",
DROP COLUMN "max_tokens",
DROP COLUMN "name",
DROP COLUMN "top_k",
DROP COLUMN "top_p",
ADD COLUMN     "maxTokens" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "prompt" TEXT NOT NULL DEFAULT 'You are a helpful assistant.',
ALTER COLUMN "temperature" SET NOT NULL,
ALTER COLUMN "model" SET NOT NULL;

-- CreateTable
CREATE TABLE "product_chunks" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" JSONB,
    "workspaceId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gdpr_content" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gdpr_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_chunks_productId_idx" ON "product_chunks"("productId");

-- CreateIndex
CREATE INDEX "product_chunks_chunkIndex_idx" ON "product_chunks"("chunkIndex");

-- CreateIndex
CREATE INDEX "product_chunks_workspaceId_idx" ON "product_chunks"("workspaceId");

-- CreateIndex
CREATE INDEX "product_chunks_language_idx" ON "product_chunks"("language");

-- CreateIndex
CREATE UNIQUE INDEX "gdpr_content_workspaceId_key" ON "gdpr_content"("workspaceId");

-- AddForeignKey
ALTER TABLE "product_chunks" ADD CONSTRAINT "product_chunks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_configs" ADD CONSTRAINT "agent_configs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gdpr_content" ADD CONSTRAINT "gdpr_content_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
