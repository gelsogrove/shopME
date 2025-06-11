/*
  Warnings:

  - You are about to drop the column `supplierId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_workspaceId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "supplierId";

-- DropTable
DROP TABLE "suppliers";
