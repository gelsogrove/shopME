/*
  Warnings:

  - You are about to drop the `user_workspaces` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_workspaces" DROP CONSTRAINT "user_workspaces_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_workspaces" DROP CONSTRAINT "user_workspaces_workspaceId_fkey";

-- DropTable
DROP TABLE "user_workspaces";

-- CreateTable
CREATE TABLE "UserWorkspace" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserWorkspace_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "service_chunks" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_chunks_serviceId_idx" ON "service_chunks"("serviceId");

-- CreateIndex
CREATE INDEX "service_chunks_chunkIndex_idx" ON "service_chunks"("chunkIndex");

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_chunks" ADD CONSTRAINT "service_chunks_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
