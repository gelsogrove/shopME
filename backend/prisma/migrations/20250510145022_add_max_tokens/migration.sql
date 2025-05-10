/*
  Warnings:

  - You are about to drop the `prompts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_promptId_fkey";

-- DropForeignKey
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_workspaceId_fkey";

-- DropTable
DROP TABLE "prompts";

-- CreateTable
CREATE TABLE "Prompts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isRouter" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT,
    "temperature" DOUBLE PRECISION DEFAULT 0.7,
    "top_p" DOUBLE PRECISION DEFAULT 0.9,
    "top_k" INTEGER DEFAULT 40,
    "model" TEXT DEFAULT 'GPT-4.1-mini',
    "max_tokens" INTEGER DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prompts_workspaceId_idx" ON "Prompts"("workspaceId");

-- AddForeignKey
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
