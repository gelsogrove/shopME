/*
  Warnings:

  - The primary key for the `_OfferCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_OfferCategories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_OfferCategories" DROP CONSTRAINT "_OfferCategories_AB_pkey";

-- CreateTable
CREATE TABLE "agent_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRouter" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "workspaceId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION DEFAULT 0.7,
    "top_p" DOUBLE PRECISION DEFAULT 0.9,
    "top_k" INTEGER DEFAULT 40,
    "model" TEXT DEFAULT 'openai/gpt-4o-mini',
    "max_tokens" INTEGER DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_configs_workspaceId_idx" ON "agent_configs"("workspaceId");

-- CreateIndex
CREATE INDEX "agent_configs_isActive_idx" ON "agent_configs"("isActive");

-- CreateIndex
CREATE INDEX "agent_configs_isRouter_idx" ON "agent_configs"("isRouter");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferCategories_AB_unique" ON "_OfferCategories"("A", "B");

-- AddForeignKey
ALTER TABLE "agent_configs" ADD CONSTRAINT "agent_configs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
