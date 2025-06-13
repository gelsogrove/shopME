/*
  Warnings:

  - The values [ENTERPRISE] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL');
ALTER TABLE "Workspace" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Workspace" ALTER COLUMN "plan" TYPE "PlanType_new" USING ("plan"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "PlanType_old";
ALTER TABLE "Workspace" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- CreateTable
CREATE TABLE "faq_chunks" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faq_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faq_chunks_faqId_idx" ON "faq_chunks"("faqId");

-- CreateIndex
CREATE INDEX "faq_chunks_chunkIndex_idx" ON "faq_chunks"("chunkIndex");

-- AddForeignKey
ALTER TABLE "faq_chunks" ADD CONSTRAINT "faq_chunks_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
