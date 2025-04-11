/*
  Warnings:

  - A unique constraint covering the columns `[slug,workspaceId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "temperature" DOUBLE PRECISION DEFAULT 0.7,
ADD COLUMN     "top_k" INTEGER DEFAULT 40,
ADD COLUMN     "top_p" DOUBLE PRECISION DEFAULT 0.9;

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT '€',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_workspaceId_key" ON "categories"("slug", "workspaceId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
