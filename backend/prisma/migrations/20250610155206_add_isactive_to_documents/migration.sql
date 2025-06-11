-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "documents_isActive_idx" ON "documents"("isActive");
