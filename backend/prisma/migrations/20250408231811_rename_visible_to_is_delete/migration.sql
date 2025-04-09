/*
  Warnings:

  - You are about to drop the column `alias` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "alias",
DROP COLUMN "visible",
ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;
