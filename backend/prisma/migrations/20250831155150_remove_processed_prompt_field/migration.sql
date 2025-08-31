/*
  Warnings:

  - You are about to drop the column `processedPrompt` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "processedPrompt";
