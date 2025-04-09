/*
  Warnings:

  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_workspaceId_fkey";

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR';

-- DropTable
DROP TABLE "settings";
