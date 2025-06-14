-- CreateTable
CREATE TABLE "gdpr_content" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gdpr_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gdpr_content_workspaceId_idx" ON "gdpr_content"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "gdpr_content_workspaceId_key" ON "gdpr_content"("workspaceId");

-- AddForeignKey
ALTER TABLE "gdpr_content" ADD CONSTRAINT "gdpr_content_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
