/*
  Warnings:

  - You are about to drop the column `privacyAcceptedAt` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `privacyVersion` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "privacyAcceptedAt",
DROP COLUMN "privacyVersion";
